-- Migration: Video Upload Enhancements
-- Adds columns for file size, processing progress, and error tracking

-- Add file_size column (in bytes)
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS file_size BIGINT DEFAULT 0;

-- Add processing_progress column (0-100)
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS processing_progress INTEGER DEFAULT 0 CHECK (processing_progress >= 0 AND processing_progress <= 100);

-- Add error_message column for failed uploads/processing
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add completed_at timestamp for when processing finished
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add index for creator dashboard queries (filter by creator + status)
CREATE INDEX IF NOT EXISTS idx_videos_creator_status ON videos(creator_id, status, created_at DESC);

-- Add index for status-based queries
CREATE INDEX IF NOT EXISTS idx_videos_status_created ON videos(status, created_at DESC);

-- Comment on new columns
COMMENT ON COLUMN videos.file_size IS 'Original uploaded file size in bytes';
COMMENT ON COLUMN videos.processing_progress IS 'Video processing progress percentage (0-100)';
COMMENT ON COLUMN videos.error_message IS 'Error details if status is failed';
COMMENT ON COLUMN videos.completed_at IS 'Timestamp when video processing completed successfully';
