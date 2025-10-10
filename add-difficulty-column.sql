-- Add difficulty column to videos table
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50);

-- Update existing videos with sample difficulty levels
UPDATE videos SET difficulty = 'Beginner' WHERE id = '10000000-0000-0000-0000-000000000001';
UPDATE videos SET difficulty = 'Intermediate' WHERE id = '10000000-0000-0000-0000-000000000002';
UPDATE videos SET difficulty = 'Beginner' WHERE id = '10000000-0000-0000-0000-000000000003';

-- Verify the column was added
SELECT id, title, difficulty FROM videos;
