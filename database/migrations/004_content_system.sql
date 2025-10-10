-- Content Discovery System Migration
-- Phase 4: Social Content Platform with 370+ Categories

-- ==============================================
-- 1. CONTENT CATEGORIES TABLE
-- ==============================================
-- Stores 370+ astronomy topic categories in hierarchical structure
CREATE TABLE content_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_category_id UUID REFERENCES content_categories(id) ON DELETE SET NULL,
    difficulty_level VARCHAR(50) NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert', 'all')),
    age_group VARCHAR(50) NOT NULL CHECK (age_group IN ('kids', 'teens', 'adults', 'all')),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    icon_emoji VARCHAR(10),
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_categories_slug ON content_categories(slug);
CREATE INDEX idx_content_categories_parent ON content_categories(parent_category_id);
CREATE INDEX idx_content_categories_difficulty ON content_categories(difficulty_level);
CREATE INDEX idx_content_categories_tags ON content_categories USING GIN(tags);
CREATE INDEX idx_content_categories_featured ON content_categories(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_content_categories_sort ON content_categories(sort_order);

-- ==============================================
-- 2. CONTENT ITEMS TABLE
-- ==============================================
-- Individual content pieces (articles, tutorials, guides)
CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    body_markdown TEXT,
    category_id UUID NOT NULL REFERENCES content_categories(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('video', 'article', 'tutorial', 'guide', 'news')),
    difficulty_level VARCHAR(50) NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    age_group VARCHAR(50) NOT NULL CHECK (age_group IN ('kids', 'teens', 'adults', 'all')),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    media_urls JSONB DEFAULT '{}'::jsonb,
    video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
    engagement_score INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_items_category ON content_items(category_id);
CREATE INDEX idx_content_items_author ON content_items(author_id);
CREATE INDEX idx_content_items_difficulty ON content_items(difficulty_level);
CREATE INDEX idx_content_items_type ON content_items(content_type);
CREATE INDEX idx_content_items_tags ON content_items USING GIN(tags);
CREATE INDEX idx_content_items_engagement ON content_items(engagement_score DESC);
CREATE INDEX idx_content_items_views ON content_items(view_count DESC);
CREATE INDEX idx_content_items_created ON content_items(created_at DESC);
CREATE INDEX idx_content_items_video ON content_items(video_id) WHERE video_id IS NOT NULL;

-- ==============================================
-- 3. USER ASTRONOMY PROFILES TABLE
-- ==============================================
-- User's self-declared astronomy knowledge level (NOT progress tracking)
CREATE TABLE user_astronomy_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    astronomy_level VARCHAR(50) NOT NULL CHECK (astronomy_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    interests TEXT[] DEFAULT ARRAY[]::TEXT[],
    preferred_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_astronomy_level ON user_astronomy_profiles(astronomy_level);
CREATE INDEX idx_user_astronomy_interests ON user_astronomy_profiles USING GIN(interests);

-- ==============================================
-- 4. CATEGORY FOLLOWS TABLE
-- ==============================================
-- Users following specific categories
CREATE TABLE category_follows (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES content_categories(id) ON DELETE CASCADE,
    followed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, category_id)
);

CREATE INDEX idx_category_follows_user ON category_follows(user_id);
CREATE INDEX idx_category_follows_category ON category_follows(category_id);
CREATE INDEX idx_category_follows_date ON category_follows(followed_at DESC);

-- ==============================================
-- 5. CONTENT BOOKMARKS TABLE
-- ==============================================
-- User saved/bookmarked content
CREATE TABLE content_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    note TEXT,
    folder VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, content_item_id)
);

CREATE INDEX idx_content_bookmarks_user ON content_bookmarks(user_id);
CREATE INDEX idx_content_bookmarks_content ON content_bookmarks(content_item_id);
CREATE INDEX idx_content_bookmarks_folder ON content_bookmarks(folder) WHERE folder IS NOT NULL;
CREATE INDEX idx_content_bookmarks_created ON content_bookmarks(created_at DESC);

-- ==============================================
-- 6. CONTENT VOTES TABLE
-- ==============================================
-- Upvotes/downvotes on content
CREATE TABLE content_votes (
    content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    value INTEGER NOT NULL CHECK (value IN (-1, 1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (content_item_id, user_id)
);

CREATE INDEX idx_content_votes_content ON content_votes(content_item_id);
CREATE INDEX idx_content_votes_user ON content_votes(user_id);

-- ==============================================
-- 7. CONTENT SHARES TABLE
-- ==============================================
-- Track content shares for engagement metrics
CREATE TABLE content_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('twitter', 'facebook', 'linkedin', 'reddit', 'link', 'email')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_shares_content ON content_shares(content_item_id);
CREATE INDEX idx_content_shares_user ON content_shares(user_id);
CREATE INDEX idx_content_shares_platform ON content_shares(platform);
CREATE INDEX idx_content_shares_created ON content_shares(created_at DESC);

-- ==============================================
-- 8. CONTENT VIEWS TABLE
-- ==============================================
-- Track individual content views for analytics
CREATE TABLE content_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    view_duration INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_views_content ON content_views(content_item_id);
CREATE INDEX idx_content_views_user ON content_views(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_content_views_created ON content_views(created_at DESC);

-- ==============================================
-- TRIGGERS
-- ==============================================

-- Apply updated_at trigger to new tables
CREATE TRIGGER update_content_categories_updated_at BEFORE UPDATE ON content_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON content_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_astronomy_profiles_updated_at BEFORE UPDATE ON user_astronomy_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- ENGAGEMENT SCORE CALCULATION
-- ==============================================
-- Function to calculate engagement score based on votes, shares, bookmarks, and views
CREATE OR REPLACE FUNCTION calculate_engagement_score(p_content_item_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_upvotes INTEGER;
    v_downvotes INTEGER;
    v_shares INTEGER;
    v_bookmarks INTEGER;
    v_views INTEGER;
    v_score INTEGER;
BEGIN
    -- Count upvotes
    SELECT COUNT(*) INTO v_upvotes
    FROM content_votes
    WHERE content_item_id = p_content_item_id AND value = 1;

    -- Count downvotes
    SELECT COUNT(*) INTO v_downvotes
    FROM content_votes
    WHERE content_item_id = p_content_item_id AND value = -1;

    -- Count shares
    SELECT COUNT(*) INTO v_shares
    FROM content_shares
    WHERE content_item_id = p_content_item_id;

    -- Count bookmarks
    SELECT COUNT(*) INTO v_bookmarks
    FROM content_bookmarks
    WHERE content_item_id = p_content_item_id;

    -- Get view count
    SELECT view_count INTO v_views
    FROM content_items
    WHERE id = p_content_item_id;

    -- Calculate weighted score
    -- Formula: (upvotes * 3) + (shares * 5) + (bookmarks * 2) - (downvotes * 2) + (views * 0.1)
    v_score := (v_upvotes * 3) + (v_shares * 5) + (v_bookmarks * 2) - (v_downvotes * 2) + FLOOR(v_views * 0.1);

    RETURN GREATEST(v_score, 0); -- Ensure score is never negative
END;
$$ LANGUAGE plpgsql;

-- Trigger to update engagement score after vote
CREATE OR REPLACE FUNCTION update_content_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE content_items
        SET engagement_score = calculate_engagement_score(OLD.content_item_id)
        WHERE id = OLD.content_item_id;
        RETURN OLD;
    ELSE
        UPDATE content_items
        SET engagement_score = calculate_engagement_score(NEW.content_item_id)
        WHERE id = NEW.content_item_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to recalculate engagement score
CREATE TRIGGER content_vote_engagement_trigger
AFTER INSERT OR UPDATE OR DELETE ON content_votes
FOR EACH ROW EXECUTE FUNCTION update_content_engagement_score();

CREATE TRIGGER content_share_engagement_trigger
AFTER INSERT OR DELETE ON content_shares
FOR EACH ROW EXECUTE FUNCTION update_content_engagement_score();

CREATE TRIGGER content_bookmark_engagement_trigger
AFTER INSERT OR DELETE ON content_bookmarks
FOR EACH ROW EXECUTE FUNCTION update_content_engagement_score();

-- ==============================================
-- VIEW COUNT INCREMENT
-- ==============================================
-- Function to safely increment view count
CREATE OR REPLACE FUNCTION increment_content_view_count(p_content_item_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE content_items
    SET view_count = view_count + 1
    WHERE id = p_content_item_id;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- HELPER VIEWS
-- ==============================================

-- View for content with aggregated stats
CREATE OR REPLACE VIEW content_items_with_stats AS
SELECT
    ci.*,
    COALESCE(upvotes.count, 0) as upvote_count,
    COALESCE(downvotes.count, 0) as downvote_count,
    COALESCE(shares.count, 0) as share_count,
    COALESCE(bookmarks.count, 0) as bookmark_count,
    cc.name as category_name,
    cc.slug as category_slug,
    u.name as author_name
FROM content_items ci
LEFT JOIN (
    SELECT content_item_id, COUNT(*) as count
    FROM content_votes
    WHERE value = 1
    GROUP BY content_item_id
) upvotes ON ci.id = upvotes.content_item_id
LEFT JOIN (
    SELECT content_item_id, COUNT(*) as count
    FROM content_votes
    WHERE value = -1
    GROUP BY content_item_id
) downvotes ON ci.id = downvotes.content_item_id
LEFT JOIN (
    SELECT content_item_id, COUNT(*) as count
    FROM content_shares
    GROUP BY content_item_id
) shares ON ci.id = shares.content_item_id
LEFT JOIN (
    SELECT content_item_id, COUNT(*) as count
    FROM content_bookmarks
    GROUP BY content_item_id
) bookmarks ON ci.id = bookmarks.content_item_id
LEFT JOIN content_categories cc ON ci.category_id = cc.id
LEFT JOIN users u ON ci.author_id = u.id;

-- View for category stats
CREATE OR REPLACE VIEW content_categories_with_stats AS
SELECT
    cc.*,
    COALESCE(content_count.count, 0) as content_count,
    COALESCE(follower_count.count, 0) as follower_count
FROM content_categories cc
LEFT JOIN (
    SELECT category_id, COUNT(*) as count
    FROM content_items
    GROUP BY category_id
) content_count ON cc.id = content_count.category_id
LEFT JOIN (
    SELECT category_id, COUNT(*) as count
    FROM category_follows
    GROUP BY category_id
) follower_count ON cc.id = follower_count.category_id;

-- ==============================================
-- COMMENTS
-- ==============================================
COMMENT ON TABLE content_categories IS 'Hierarchical categories for astronomy content (370+ topics)';
COMMENT ON TABLE content_items IS 'Individual content pieces (articles, tutorials, guides)';
COMMENT ON TABLE user_astronomy_profiles IS 'User self-declared astronomy knowledge level for personalized recommendations';
COMMENT ON TABLE category_follows IS 'Users following specific content categories';
COMMENT ON TABLE content_bookmarks IS 'User saved/bookmarked content items';
COMMENT ON TABLE content_votes IS 'Upvotes and downvotes on content items';
COMMENT ON TABLE content_shares IS 'Track content shares for engagement metrics';
COMMENT ON TABLE content_views IS 'Individual content view tracking for analytics';

COMMENT ON COLUMN content_items.engagement_score IS 'Calculated score: (upvotes*3) + (shares*5) + (bookmarks*2) - (downvotes*2) + (views*0.1)';
COMMENT ON COLUMN user_astronomy_profiles.astronomy_level IS 'Self-declared knowledge level, NOT progress tracking';
