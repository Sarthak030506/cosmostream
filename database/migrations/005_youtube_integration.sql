-- YouTube Integration Migration
-- Adds tables and indexes to support YouTube video import and syncing

-- ==============================================
-- 1. ADD SOURCE TYPE TO CONTENT ITEMS
-- ==============================================

-- Add source_type column to track content origin
ALTER TABLE content_items
ADD COLUMN source_type VARCHAR(20) DEFAULT 'native' CHECK (source_type IN ('native', 'youtube', 'external'));

CREATE INDEX idx_content_items_source_type ON content_items(source_type);

-- Add index on media_urls for fast YouTube ID lookups
CREATE INDEX idx_content_items_media_urls_youtube ON content_items
USING GIN (media_urls)
WHERE media_urls ? 'youtube_id';

-- ==============================================
-- 2. YOUTUBE CATEGORY MAPPINGS TABLE
-- ==============================================
-- Maps each category to YouTube search keywords and channel IDs

CREATE TABLE youtube_category_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES content_categories(id) ON DELETE CASCADE,
    search_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
    channel_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    quality_threshold JSONB DEFAULT '{
        "min_views": 1000,
        "min_likes_ratio": 0.8,
        "min_subscribers": 10000,
        "content_rating": "family_friendly"
    }'::jsonb,
    sync_enabled BOOLEAN DEFAULT TRUE,
    sync_frequency VARCHAR(20) DEFAULT 'daily' CHECK (sync_frequency IN ('hourly', 'daily', 'weekly', 'manual')),
    max_videos_per_sync INTEGER DEFAULT 10,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id)
);

CREATE INDEX idx_youtube_category_mappings_category ON youtube_category_mappings(category_id);
CREATE INDEX idx_youtube_category_mappings_sync_enabled ON youtube_category_mappings(sync_enabled)
WHERE sync_enabled = TRUE;
CREATE INDEX idx_youtube_category_mappings_last_sync ON youtube_category_mappings(last_sync_at);

-- ==============================================
-- 3. YOUTUBE SYNC JOBS TABLE
-- ==============================================
-- Tracks sync job execution history, errors, and quota usage

CREATE TABLE youtube_sync_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('category_sync', 'full_sync', 'manual_import', 'refresh_metrics')),
    category_id UUID REFERENCES content_categories(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),

    -- Job metrics
    videos_fetched INTEGER DEFAULT 0,
    videos_imported INTEGER DEFAULT 0,
    videos_skipped INTEGER DEFAULT 0,
    videos_failed INTEGER DEFAULT 0,

    -- API quota tracking
    quota_cost INTEGER DEFAULT 0,

    -- Error tracking
    error_message TEXT,
    error_stack TEXT,

    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,

    -- Job configuration snapshot
    config JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_youtube_sync_jobs_category ON youtube_sync_jobs(category_id);
CREATE INDEX idx_youtube_sync_jobs_status ON youtube_sync_jobs(status);
CREATE INDEX idx_youtube_sync_jobs_type ON youtube_sync_jobs(job_type);
CREATE INDEX idx_youtube_sync_jobs_created ON youtube_sync_jobs(created_at DESC);

-- ==============================================
-- 4. YOUTUBE API QUOTA TRACKING TABLE
-- ==============================================
-- Tracks daily API quota usage to avoid exceeding limits

CREATE TABLE youtube_api_quota (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    quota_used INTEGER DEFAULT 0,
    quota_limit INTEGER DEFAULT 10000,
    requests_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date)
);

CREATE INDEX idx_youtube_api_quota_date ON youtube_api_quota(date DESC);

-- ==============================================
-- 5. YOUTUBE CHANNEL BLACKLIST TABLE
-- ==============================================
-- Channels to exclude from imports (spam, inappropriate content, etc.)

CREATE TABLE youtube_channel_blacklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id VARCHAR(255) NOT NULL UNIQUE,
    channel_name VARCHAR(500),
    reason TEXT NOT NULL,
    blacklisted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_youtube_channel_blacklist_channel ON youtube_channel_blacklist(channel_id);

-- ==============================================
-- 6. YOUTUBE VIDEO BLACKLIST TABLE
-- ==============================================
-- Specific videos to exclude from imports

CREATE TABLE youtube_video_blacklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    youtube_video_id VARCHAR(255) NOT NULL UNIQUE,
    video_title VARCHAR(500),
    reason TEXT NOT NULL,
    blacklisted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_youtube_video_blacklist_video ON youtube_video_blacklist(youtube_video_id);

-- ==============================================
-- TRIGGERS
-- ==============================================

-- Apply updated_at trigger to new tables
CREATE TRIGGER update_youtube_category_mappings_updated_at
BEFORE UPDATE ON youtube_category_mappings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_youtube_api_quota_updated_at
BEFORE UPDATE ON youtube_api_quota
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- HELPER FUNCTIONS
-- ==============================================

-- Function to get current quota usage
CREATE OR REPLACE FUNCTION get_youtube_quota_remaining()
RETURNS INTEGER AS $$
DECLARE
    v_quota_used INTEGER;
    v_quota_limit INTEGER;
BEGIN
    SELECT quota_used, quota_limit INTO v_quota_used, v_quota_limit
    FROM youtube_api_quota
    WHERE date = CURRENT_DATE;

    IF NOT FOUND THEN
        RETURN 10000; -- Default daily quota
    END IF;

    RETURN GREATEST(v_quota_limit - v_quota_used, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to increment quota usage
CREATE OR REPLACE FUNCTION increment_youtube_quota(p_cost INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO youtube_api_quota (date, quota_used, requests_count)
    VALUES (CURRENT_DATE, p_cost, 1)
    ON CONFLICT (date)
    DO UPDATE SET
        quota_used = youtube_api_quota.quota_used + p_cost,
        requests_count = youtube_api_quota.requests_count + 1,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to check if channel is blacklisted
CREATE OR REPLACE FUNCTION is_youtube_channel_blacklisted(p_channel_id VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM youtube_channel_blacklist
        WHERE channel_id = p_channel_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if video is blacklisted
CREATE OR REPLACE FUNCTION is_youtube_video_blacklisted(p_video_id VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM youtube_video_blacklist
        WHERE youtube_video_id = p_video_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get videos needing sync for a category
CREATE OR REPLACE FUNCTION get_categories_for_sync(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    category_id UUID,
    category_name VARCHAR,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    hours_since_sync NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cc.id,
        cc.name,
        ycm.last_sync_at,
        EXTRACT(EPOCH FROM (NOW() - COALESCE(ycm.last_sync_at, '1970-01-01'::TIMESTAMP WITH TIME ZONE))) / 3600 as hours_since_sync
    FROM content_categories cc
    INNER JOIN youtube_category_mappings ycm ON cc.id = ycm.category_id
    WHERE ycm.sync_enabled = TRUE
    ORDER BY
        CASE ycm.sync_frequency
            WHEN 'hourly' THEN 1
            WHEN 'daily' THEN 2
            WHEN 'weekly' THEN 3
            ELSE 4
        END,
        ycm.last_sync_at ASC NULLS FIRST
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- VIEWS
-- ==============================================

-- View for YouTube content with stats
CREATE OR REPLACE VIEW youtube_content_stats AS
SELECT
    cc.id as category_id,
    cc.name as category_name,
    cc.slug as category_slug,
    COUNT(ci.id) as youtube_video_count,
    MAX(ci.created_at) as latest_import,
    AVG(ci.view_count) as avg_views,
    AVG(ci.engagement_score) as avg_engagement
FROM content_categories cc
LEFT JOIN content_items ci ON cc.id = ci.category_id AND ci.source_type = 'youtube'
GROUP BY cc.id, cc.name, cc.slug;

-- View for sync job summary
CREATE OR REPLACE VIEW youtube_sync_summary AS
SELECT
    job_type,
    status,
    COUNT(*) as job_count,
    SUM(videos_imported) as total_imported,
    SUM(quota_cost) as total_quota_used,
    AVG(duration_seconds) as avg_duration_seconds,
    MAX(created_at) as last_job_at
FROM youtube_sync_jobs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY job_type, status;

-- ==============================================
-- COMMENTS
-- ==============================================

COMMENT ON TABLE youtube_category_mappings IS 'Maps categories to YouTube search keywords and channel IDs for automated syncing';
COMMENT ON TABLE youtube_sync_jobs IS 'Tracks YouTube sync job execution history and metrics';
COMMENT ON TABLE youtube_api_quota IS 'Tracks daily YouTube API quota usage to prevent exceeding limits';
COMMENT ON TABLE youtube_channel_blacklist IS 'Channels excluded from imports (spam, inappropriate)';
COMMENT ON TABLE youtube_video_blacklist IS 'Specific videos excluded from imports';

COMMENT ON COLUMN content_items.source_type IS 'Content source: native (uploaded), youtube (imported), external (other platforms)';
COMMENT ON COLUMN youtube_category_mappings.quality_threshold IS 'JSON config for video quality filters (min_views, min_likes_ratio, etc.)';
COMMENT ON COLUMN youtube_sync_jobs.quota_cost IS 'YouTube API quota units consumed by this job';
