-- News Sync Jobs Tracking Table
-- Tracks history and status of automated news sync operations

CREATE TABLE IF NOT EXISTS news_sync_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(50) NOT NULL DEFAULT 'auto_sync',
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    articles_fetched INTEGER DEFAULT 0,
    articles_imported INTEGER DEFAULT 0,
    articles_skipped INTEGER DEFAULT 0,
    articles_failed INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_news_sync_jobs_status ON news_sync_jobs(status);
CREATE INDEX idx_news_sync_jobs_created ON news_sync_jobs(created_at DESC);
CREATE INDEX idx_news_sync_jobs_type ON news_sync_jobs(job_type);

-- Comment
COMMENT ON TABLE news_sync_jobs IS 'Tracks automated news article synchronization from external APIs';
COMMENT ON COLUMN news_sync_jobs.job_type IS 'Type of sync job: auto_sync, manual_sync, backfill';
COMMENT ON COLUMN news_sync_jobs.status IS 'Current status of the sync job';
COMMENT ON COLUMN news_sync_jobs.articles_fetched IS 'Number of articles fetched from API';
COMMENT ON COLUMN news_sync_jobs.articles_imported IS 'Number of new articles successfully imported';
COMMENT ON COLUMN news_sync_jobs.articles_skipped IS 'Number of articles skipped (duplicates or filtered out)';
COMMENT ON COLUMN news_sync_jobs.articles_failed IS 'Number of articles that failed to import';
COMMENT ON COLUMN news_sync_jobs.duration_seconds IS 'Total time taken for the sync job in seconds';
COMMENT ON COLUMN news_sync_jobs.config IS 'Configuration used for this sync job (JSON)';
