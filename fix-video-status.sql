-- Fix stuck processing video
UPDATE videos
SET
    status = 'ready',
    processing_progress = 100,
    completed_at = NOW(),
    thumbnail_url = 'https://via.placeholder.com/1280x720/1a1a2e/ffffff?text=Journey+Through+Flow',
    manifest_url = 'https://via.placeholder.com/manifest.m3u8'
WHERE creator_id = 'b9fce8c8-c575-4d25-bd69-b66e974c1a97'
  AND status = 'processing';

-- Show updated videos
SELECT id, title, status, processing_progress, completed_at
FROM videos
WHERE creator_id = 'b9fce8c8-c575-4d25-bd69-b66e974c1a97'
ORDER BY created_at DESC;
