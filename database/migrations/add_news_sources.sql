-- News Sources Table
-- Stores trusted news sources and their API endpoints

CREATE TABLE IF NOT EXISTS news_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    api_endpoint TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('agency', 'media', 'journal', 'aggregator')),
    last_synced_at TIMESTAMP WITH TIME ZONE,
    sync_enabled BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_news_sources_active ON news_sources(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_news_sources_sync_enabled ON news_sources(sync_enabled) WHERE sync_enabled = TRUE;
CREATE INDEX idx_news_sources_priority ON news_sources(priority DESC);

-- Insert default trusted sources
INSERT INTO news_sources (name, display_name, url, api_endpoint, source_type, is_active, sync_enabled, priority)
VALUES
    (
        'spaceflight-news-api',
        'Spaceflight News',
        'https://spaceflightnewsapi.net',
        'https://api.spaceflightnewsapi.net/v4/articles',
        'aggregator',
        TRUE,
        TRUE,
        100
    ),
    (
        'nasa',
        'NASA',
        'https://www.nasa.gov',
        'https://www.nasa.gov/rss/dyn/breaking_news.rss',
        'agency',
        TRUE,
        FALSE,
        90
    ),
    (
        'esa',
        'European Space Agency',
        'https://www.esa.int',
        'https://www.esa.int/rssfeed/OurActivities',
        'agency',
        TRUE,
        FALSE,
        90
    ),
    (
        'space-com',
        'Space.com',
        'https://www.space.com',
        NULL,
        'media',
        TRUE,
        FALSE,
        80
    ),
    (
        'universe-today',
        'Universe Today',
        'https://www.universetoday.com',
        NULL,
        'media',
        TRUE,
        FALSE,
        80
    ),
    (
        'phys-org',
        'Phys.org',
        'https://phys.org/space-news',
        NULL,
        'media',
        TRUE,
        FALSE,
        75
    ),
    (
        'science-daily',
        'Science Daily',
        'https://www.sciencedaily.com/news/space_time',
        NULL,
        'media',
        TRUE,
        FALSE,
        75
    ),
    (
        'nature-astronomy',
        'Nature Astronomy',
        'https://www.nature.com/natastron',
        NULL,
        'journal',
        TRUE,
        FALSE,
        70
    ),
    (
        'arxiv',
        'arXiv Astrophysics',
        'https://arxiv.org/list/astro-ph/recent',
        NULL,
        'journal',
        TRUE,
        FALSE,
        65
    )
ON CONFLICT (name) DO NOTHING;

-- Add source_url column to content_items if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'content_items' AND column_name = 'source_url'
    ) THEN
        ALTER TABLE content_items ADD COLUMN source_url TEXT;
        CREATE INDEX idx_content_items_source_url ON content_items(source_url);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'content_items' AND column_name = 'source_id'
    ) THEN
        ALTER TABLE content_items ADD COLUMN source_id UUID REFERENCES news_sources(id) ON DELETE SET NULL;
        CREATE INDEX idx_content_items_source_id ON content_items(source_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'content_items' AND column_name = 'published_at'
    ) THEN
        ALTER TABLE content_items ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
        CREATE INDEX idx_content_items_published_at ON content_items(published_at DESC);
    END IF;
END $$;

-- Verify sources were inserted
SELECT name, display_name, source_type, is_active, priority
FROM news_sources
ORDER BY priority DESC, name;
