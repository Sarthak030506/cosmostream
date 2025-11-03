-- Reset YouTube API Quota
-- Run this to reset the daily quota counter

-- Delete old quota records (keeps only last 7 days)
DELETE FROM youtube_api_quota
WHERE date < CURRENT_DATE - INTERVAL '7 days';

-- Reset today's quota to 0
INSERT INTO youtube_api_quota (date, quota_used, quota_limit, requests_count)
VALUES (CURRENT_DATE, 0, 10000, 0)
ON CONFLICT (date)
DO UPDATE SET
    quota_used = 0,
    requests_count = 0,
    updated_at = CURRENT_TIMESTAMP;

-- Verify
SELECT
    date,
    quota_used,
    quota_limit,
    (quota_limit - quota_used) as remaining,
    requests_count
FROM youtube_api_quota
WHERE date = CURRENT_DATE;
