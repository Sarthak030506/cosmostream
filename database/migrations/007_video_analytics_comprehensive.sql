-- Video Analytics Comprehensive Migration
-- Tracks detailed video performance metrics, viewer behavior, and engagement

-- ==============================================
-- 1. VIDEO VIEWS TABLE
-- ==============================================
-- Detailed tracking of individual video views with metadata
CREATE TABLE video_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255) NOT NULL,

    -- View metrics
    watch_duration INTEGER DEFAULT 0,  -- Seconds watched
    completion_percentage FLOAT DEFAULT 0,  -- 0-100

    -- Device & browser info
    device_type VARCHAR(50),  -- desktop, mobile, tablet
    browser VARCHAR(100),
    operating_system VARCHAR(100),
    screen_resolution VARCHAR(50),

    -- Location (anonymized)
    country VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(100),

    -- Traffic source
    traffic_source VARCHAR(50),  -- search, browse, recommended, direct, external, social
    referrer_url TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),

    -- Playback details
    quality_selected VARCHAR(20),  -- 480p, 720p, 1080p
    playback_speed FLOAT DEFAULT 1.0,
    autoplay BOOLEAN DEFAULT FALSE,

    -- User engagement
    liked BOOLEAN DEFAULT FALSE,
    shared BOOLEAN DEFAULT FALSE,
    bookmarked BOOLEAN DEFAULT FALSE,

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_heartbeat_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Metadata
    ip_address_hash VARCHAR(64),  -- Hashed for privacy
    user_agent TEXT,

    UNIQUE(session_id, video_id)
);

CREATE INDEX idx_video_views_video ON video_views(video_id);
CREATE INDEX idx_video_views_user ON video_views(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_video_views_session ON video_views(session_id);
CREATE INDEX idx_video_views_started ON video_views(started_at DESC);
CREATE INDEX idx_video_views_traffic_source ON video_views(traffic_source);
CREATE INDEX idx_video_views_device ON video_views(device_type);
CREATE INDEX idx_video_views_country ON video_views(country) WHERE country IS NOT NULL;

-- ==============================================
-- 2. VIDEO EVENTS TABLE
-- ==============================================
-- Track all video player events for detailed analysis
CREATE TABLE video_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Event details
    event_type VARCHAR(50) NOT NULL,  -- play, pause, seek, complete, quality_change, speed_change, etc.
    event_data JSONB DEFAULT '{}'::jsonb,
    video_timestamp INTEGER,  -- Position in video (seconds)

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_video_events_video ON video_events(video_id);
CREATE INDEX idx_video_events_session ON video_events(session_id);
CREATE INDEX idx_video_events_type ON video_events(event_type);
CREATE INDEX idx_video_events_created ON video_events(created_at DESC);

-- ==============================================
-- 3. VIDEO RETENTION TABLE
-- ==============================================
-- Aggregated retention curve data (updated daily)
CREATE TABLE video_retention (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,

    timestamp_seconds INTEGER NOT NULL,  -- Position in video
    viewer_count INTEGER DEFAULT 0,  -- How many reached this point
    viewer_percentage FLOAT DEFAULT 0,  -- Percentage of total viewers
    drop_off_count INTEGER DEFAULT 0,  -- How many stopped watching here

    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(video_id, timestamp_seconds)
);

CREATE INDEX idx_video_retention_video ON video_retention(video_id);
CREATE INDEX idx_video_retention_timestamp ON video_retention(timestamp_seconds);

-- ==============================================
-- 4. VIDEO PERFORMANCE DAILY TABLE
-- ==============================================
-- Pre-aggregated daily statistics for fast queries
CREATE TABLE video_performance_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    -- View metrics
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    total_watch_time INTEGER DEFAULT 0,  -- Seconds
    avg_view_duration FLOAT DEFAULT 0,
    avg_completion_rate FLOAT DEFAULT 0,

    -- Engagement metrics
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    bookmarks INTEGER DEFAULT 0,

    -- Traffic breakdown
    views_from_search INTEGER DEFAULT 0,
    views_from_browse INTEGER DEFAULT 0,
    views_from_recommended INTEGER DEFAULT 0,
    views_from_direct INTEGER DEFAULT 0,
    views_from_external INTEGER DEFAULT 0,
    views_from_social INTEGER DEFAULT 0,

    -- Device breakdown
    views_desktop INTEGER DEFAULT 0,
    views_mobile INTEGER DEFAULT 0,
    views_tablet INTEGER DEFAULT 0,

    -- Peak metrics
    peak_concurrent_viewers INTEGER DEFAULT 0,
    peak_hour INTEGER,  -- 0-23

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(video_id, date)
);

CREATE INDEX idx_video_performance_daily_video ON video_performance_daily(video_id);
CREATE INDEX idx_video_performance_daily_date ON video_performance_daily(date DESC);
CREATE INDEX idx_video_performance_daily_views ON video_performance_daily(views DESC);

-- ==============================================
-- 5. VIDEO TRAFFIC SOURCES TABLE
-- ==============================================
-- Detailed traffic source tracking
CREATE TABLE video_traffic_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    source_type VARCHAR(50) NOT NULL,  -- search, browse, recommended, direct, external, social
    source_detail VARCHAR(255),  -- e.g., specific social platform, search term
    referrer_domain VARCHAR(255),

    view_count INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    total_watch_time INTEGER DEFAULT 0,
    avg_completion_rate FLOAT DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_video_traffic_sources_unique
ON video_traffic_sources(video_id, date, source_type, COALESCE(source_detail, ''));

CREATE INDEX idx_video_traffic_sources_video ON video_traffic_sources(video_id);
CREATE INDEX idx_video_traffic_sources_date ON video_traffic_sources(date DESC);
CREATE INDEX idx_video_traffic_sources_type ON video_traffic_sources(source_type);

-- ==============================================
-- 6. VIDEO DEVICE STATS TABLE
-- ==============================================
-- Device and platform breakdown
CREATE TABLE video_device_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    device_type VARCHAR(50) NOT NULL,  -- desktop, mobile, tablet
    browser VARCHAR(100),
    operating_system VARCHAR(100),

    view_count INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    total_watch_time INTEGER DEFAULT 0,
    avg_view_duration FLOAT DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_video_device_stats_unique
ON video_device_stats(video_id, date, device_type, COALESCE(browser, ''), COALESCE(operating_system, ''));

CREATE INDEX idx_video_device_stats_video ON video_device_stats(video_id);
CREATE INDEX idx_video_device_stats_date ON video_device_stats(date DESC);
CREATE INDEX idx_video_device_stats_device ON video_device_stats(device_type);

-- ==============================================
-- 7. VIDEO GEOGRAPHIC STATS TABLE
-- ==============================================
-- Geographic distribution of views
CREATE TABLE video_geographic_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    country VARCHAR(100) NOT NULL,
    city VARCHAR(100),

    view_count INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    total_watch_time INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_video_geographic_stats_unique
ON video_geographic_stats(video_id, date, country, COALESCE(city, ''));

CREATE INDEX idx_video_geographic_stats_video ON video_geographic_stats(video_id);
CREATE INDEX idx_video_geographic_stats_date ON video_geographic_stats(date DESC);
CREATE INDEX idx_video_geographic_stats_country ON video_geographic_stats(country);

-- ==============================================
-- HELPER FUNCTIONS
-- ==============================================

-- Function to calculate video analytics summary
CREATE OR REPLACE FUNCTION get_video_analytics_summary(
    p_video_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
    total_views BIGINT,
    unique_views BIGINT,
    total_watch_time BIGINT,
    avg_view_duration FLOAT,
    avg_completion_rate FLOAT,
    engagement_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(vpd.views), 0)::BIGINT as total_views,
        COALESCE(SUM(vpd.unique_views), 0)::BIGINT as unique_views,
        COALESCE(SUM(vpd.total_watch_time), 0)::BIGINT as total_watch_time,
        COALESCE(AVG(vpd.avg_view_duration), 0)::FLOAT as avg_view_duration,
        COALESCE(AVG(vpd.avg_completion_rate), 0)::FLOAT as avg_completion_rate,
        COALESCE(SUM(vpd.likes + vpd.shares + vpd.bookmarks), 0)::BIGINT as engagement_count
    FROM video_performance_daily vpd
    WHERE vpd.video_id = p_video_id
        AND (p_start_date IS NULL OR vpd.date >= p_start_date)
        AND vpd.date <= p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to increment video view count (replace old one)
CREATE OR REPLACE FUNCTION increment_video_view_count(p_video_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE videos
    SET views = views + 1
    WHERE id = p_video_id;
END;
$$ LANGUAGE plpgsql;

-- Function to track video view with session
CREATE OR REPLACE FUNCTION track_video_view(
    p_video_id UUID,
    p_session_id VARCHAR(255),
    p_user_id UUID DEFAULT NULL,
    p_device_type VARCHAR(50) DEFAULT NULL,
    p_traffic_source VARCHAR(50) DEFAULT NULL,
    p_referrer_url TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_view_id UUID;
BEGIN
    INSERT INTO video_views (
        video_id,
        session_id,
        user_id,
        device_type,
        traffic_source,
        referrer_url
    ) VALUES (
        p_video_id,
        p_session_id,
        p_user_id,
        p_device_type,
        p_traffic_source,
        p_referrer_url
    )
    ON CONFLICT (session_id, video_id)
    DO UPDATE SET last_heartbeat_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_view_id;

    -- Increment video view count
    PERFORM increment_video_view_count(p_video_id);

    RETURN v_view_id;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- VIEWS FOR ANALYTICS
-- ==============================================

-- Real-time analytics view (last 24 hours)
CREATE OR REPLACE VIEW video_realtime_analytics AS
SELECT
    vv.video_id,
    COUNT(*) as views_last_24h,
    COUNT(DISTINCT vv.user_id) as unique_viewers_last_24h,
    SUM(vv.watch_duration) as total_watch_time_last_24h,
    AVG(vv.completion_percentage) as avg_completion_last_24h,
    COUNT(*) FILTER (WHERE vv.started_at >= NOW() - INTERVAL '1 hour') as views_last_hour
FROM video_views vv
WHERE vv.started_at >= NOW() - INTERVAL '24 hours'
GROUP BY vv.video_id;

-- Traffic source summary view
CREATE OR REPLACE VIEW video_traffic_summary AS
SELECT
    video_id,
    traffic_source,
    COUNT(*) as view_count,
    COUNT(DISTINCT user_id) as unique_viewers,
    AVG(completion_percentage) as avg_completion,
    SUM(watch_duration) as total_watch_time
FROM video_views
WHERE started_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY video_id, traffic_source;

-- Device breakdown view
CREATE OR REPLACE VIEW video_device_summary AS
SELECT
    video_id,
    device_type,
    browser,
    operating_system,
    COUNT(*) as view_count,
    AVG(watch_duration) as avg_watch_duration,
    AVG(completion_percentage) as avg_completion
FROM video_views
WHERE started_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY video_id, device_type, browser, operating_system;

-- ==============================================
-- COMMENTS
-- ==============================================
COMMENT ON TABLE video_views IS 'Detailed tracking of individual video views with device, location, and traffic source data';
COMMENT ON TABLE video_events IS 'All video player events (play, pause, seek, etc.) for behavioral analysis';
COMMENT ON TABLE video_retention IS 'Aggregated retention curve showing viewer drop-off at each timestamp';
COMMENT ON TABLE video_performance_daily IS 'Pre-aggregated daily statistics for fast analytics queries';
COMMENT ON TABLE video_traffic_sources IS 'Daily breakdown of traffic sources for each video';
COMMENT ON TABLE video_device_stats IS 'Daily device and platform statistics';
COMMENT ON TABLE video_geographic_stats IS 'Geographic distribution of video views';

COMMENT ON COLUMN video_views.completion_percentage IS 'Percentage of video watched (0-100)';
COMMENT ON COLUMN video_views.traffic_source IS 'How viewer found the video: search, browse, recommended, direct, external, social';
COMMENT ON COLUMN video_views.ip_address_hash IS 'SHA-256 hash of IP for privacy (used for unique visitor counting)';
