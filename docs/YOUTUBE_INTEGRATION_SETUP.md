# YouTube Integration Setup Guide

This guide explains how to set up and use the YouTube video integration feature for CosmoStream.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Getting a YouTube API Key](#getting-a-youtube-api-key)
4. [Configuration](#configuration)
5. [Database Setup](#database-setup)
6. [Running the Sync](#running-the-sync)
7. [Customizing Category Mappings](#customizing-category-mappings)
8. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
9. [GraphQL API Reference](#graphql-api-reference)

---

## Overview

The YouTube integration allows CosmoStream to automatically populate all 370+ categories with relevant astronomy and space-related videos from YouTube. This provides immediate value to users while the creator community grows.

**Key Features:**
- Automated video discovery using keywords and channel IDs
- Quality filtering (view count, likes, content rating)
- Daily syncing with configurable schedules
- API quota management
- Full attribution to original creators
- User interactions (like, bookmark, share, comment) on CosmoStream

**Compliance:**
- Videos are embedded only (not downloaded or hosted)
- Clear attribution to original YouTube channels
- Compliance with YouTube Terms of Service
- Copyright notices on all embedded content

---

## Prerequisites

- Node.js 20+
- PostgreSQL database running
- Google Cloud account (for YouTube API key)

---

## Getting a YouTube API Key

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Name your project (e.g., "CosmoStream YouTube Integration")
4. Click "Create"

### Step 2: Enable YouTube Data API v3

1. In the Google Cloud Console, navigate to **APIs & Services > Library**
2. Search for "YouTube Data API v3"
3. Click on it and press **Enable**

### Step 3: Create API Credentials

1. Navigate to **APIs & Services > Credentials**
2. Click **Create Credentials** > **API Key**
3. Your API key will be generated
4. **IMPORTANT:** Click "Restrict Key" to secure it:
   - Under "API restrictions", select "Restrict key"
   - Choose "YouTube Data API v3" from the dropdown
   - Under "Application restrictions" (optional):
     - Select "IP addresses"
     - Add your server's IP address
5. Click **Save**

### Step 4: Configure Quota

The YouTube Data API v3 has a default quota of **10,000 units per day**.

**Quota Costs:**
- Search: 100 units
- Video details: 1 unit
- Channel details: 1 unit

With the default quota, you can perform approximately:
- 100 searches per day, OR
- Mix of operations (typical: 30-50 category syncs per day)

**To request higher quota:**
1. Navigate to **APIs & Services > Dashboard**
2. Click on "YouTube Data API v3"
3. Click "Quotas"
4. Request a quota increase if needed

---

## Configuration

### Environment Variables

Add the following to `apps/api/.env`:

```bash
# YouTube Integration
YOUTUBE_API_KEY=AIzaSyD...your-api-key-here
YOUTUBE_QUOTA_LIMIT=10000
YOUTUBE_SYNC_ENABLED=true
YOUTUBE_SYNC_CRON=0 2 * * *
YOUTUBE_SYNC_CATEGORIES_PER_RUN=10
```

**Configuration Options:**

| Variable | Description | Default |
|----------|-------------|---------|
| `YOUTUBE_API_KEY` | Your YouTube Data API v3 key | *Required* |
| `YOUTUBE_QUOTA_LIMIT` | Daily API quota limit | `10000` |
| `YOUTUBE_SYNC_ENABLED` | Enable/disable automated syncing | `true` |
| `YOUTUBE_SYNC_CRON` | Cron schedule for automated sync | `0 2 * * *` (2 AM daily) |
| `YOUTUBE_SYNC_CATEGORIES_PER_RUN` | Number of categories to sync per run | `10` |

**Cron Schedule Examples:**
- `0 2 * * *` - Daily at 2 AM
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Weekly on Sunday at midnight
- `0 3 * * 1,4` - Monday and Thursday at 3 AM

---

## Database Setup

### Run the Migration

```bash
# Navigate to database directory
cd database

# Run the YouTube integration migration
psql $DATABASE_URL -f migrations/005_youtube_integration.sql

# Seed YouTube category mappings
psql $DATABASE_URL -f seeds/youtube_category_keywords.sql
```

### Verify Setup

```sql
-- Check that category mappings were created
SELECT COUNT(*) FROM youtube_category_mappings;
-- Should return 370 (or number of categories you configured)

-- Check a sample mapping
SELECT
  cc.name,
  ycm.search_keywords,
  ycm.channel_ids,
  ycm.sync_enabled
FROM youtube_category_mappings ycm
INNER JOIN content_categories cc ON ycm.category_id = cc.id
LIMIT 5;
```

---

## Running the Sync

### Automated Sync (Production)

The cron job will run automatically based on your `YOUTUBE_SYNC_CRON` schedule. No manual intervention needed.

**Monitoring:**
```bash
# View API server logs
cd apps/api
npm run dev

# Look for:
# "YouTube sync completed: X categories synced, Y videos imported"
```

### Manual Sync (Development/Testing)

**Option 1: GraphQL Mutation (Recommended)**

```graphql
mutation SyncSingleCategory {
  syncYouTubeCategory(categoryId: "category-id-here", limit: 10) {
    jobId
    categoryName
    videosFetched
    videosImported
    videosSkipped
    quotaCost
    errors
  }
}
```

**Option 2: Sync All Categories**

```graphql
mutation SyncAllCategories {
  syncAllYouTubeCategories(limit: 10) {
    jobId
    categoryName
    videosImported
    quotaCost
  }
}
```

**Option 3: Database Query**

```sql
-- Get categories needing sync
SELECT * FROM get_categories_for_sync(10);

-- Then use GraphQL mutation to sync each
```

---

## Customizing Category Mappings

### Via GraphQL (Admin Only)

```graphql
mutation UpdateCategoryMapping {
  updateYouTubeCategoryMapping(
    categoryId: "category-id"
    keywords: ["black holes", "event horizon", "singularity"]
    channels: ["UCxyz123", "UCabc456"]
  ) {
    id
    searchKeywords
    channelIds
    lastSyncAt
  }
}
```

### Via Database

```sql
-- Update search keywords
UPDATE youtube_category_mappings
SET search_keywords = ARRAY['dark matter', 'dark energy', 'WIMP detection']
WHERE category_id = 'your-category-id';

-- Update channel IDs
UPDATE youtube_category_mappings
SET channel_ids = ARRAY['UCxyz123', 'UCabc456']
WHERE category_id = 'your-category-id';

-- Update quality thresholds
UPDATE youtube_category_mappings
SET quality_threshold = '{
  "min_views": 5000,
  "min_likes_ratio": 0.90,
  "min_subscribers": 100000,
  "content_rating": "family_friendly"
}'::jsonb
WHERE category_id = 'your-category-id';
```

### Disable Sync for Specific Categories

```sql
UPDATE youtube_category_mappings
SET sync_enabled = false
WHERE category_id = 'your-category-id';
```

---

## Monitoring & Troubleshooting

### Check Quota Usage

**GraphQL:**
```graphql
query QuotaUsage {
  youtubeQuotaUsage {
    used
    remaining
    limit
    date
  }
}
```

**Database:**
```sql
SELECT * FROM youtube_api_quota
WHERE date = CURRENT_DATE;
```

### View Sync Job History

**GraphQL:**
```graphql
query SyncJobs {
  youtubeSyncJobs(limit: 20) {
    id
    jobType
    categoryName
    status
    videosImported
    quotaCost
    errorMessage
    createdAt
  }
}
```

**Database:**
```sql
SELECT
  job_type,
  category_id,
  status,
  videos_imported,
  quota_cost,
  error_message,
  created_at
FROM youtube_sync_jobs
ORDER BY created_at DESC
LIMIT 20;
```

### Common Issues

**1. "Insufficient YouTube API quota"**
- **Cause:** Daily quota limit reached
- **Solution:** Wait until next day (quota resets at midnight Pacific Time) or request quota increase from Google

**2. "YOUTUBE_API_KEY not set"**
- **Cause:** Environment variable not configured
- **Solution:** Add `YOUTUBE_API_KEY` to `apps/api/.env`

**3. Videos not appearing**
- **Cause:** Quality filters too strict, or category keywords not matching content
- **Solution:** Adjust quality thresholds or update search keywords for the category

**4. "Channel is blacklisted"**
- **Cause:** Channel was manually blacklisted
- **Solution:** Check `youtube_channel_blacklist` table and remove if needed

### Blacklist Management

**Blacklist a channel:**
```graphql
mutation BlacklistChannel {
  blacklistYouTubeChannel(
    channelId: "UCxyz123"
    reason: "Spam content"
  )
}
```

**Blacklist a video:**
```graphql
mutation BlacklistVideo {
  blacklistYouTubeVideo(
    videoId: "dQw4w9WgXcQ"
    reason: "Off-topic content"
  )
}
```

**Remove from blacklist (database):**
```sql
DELETE FROM youtube_channel_blacklist WHERE channel_id = 'UCxyz123';
DELETE FROM youtube_video_blacklist WHERE youtube_video_id = 'dQw4w9WgXcQ';
```

---

## GraphQL API Reference

### Queries

**Get Sync Status:**
```graphql
query SyncStatus($categoryId: ID) {
  youtubeSyncStatus(categoryId: $categoryId) {
    categoryId
    categoryName
    lastSyncAt
    hoursSinceSync
    videoCount
    syncEnabled
  }
}
```

**Get Category Mapping:**
```graphql
query CategoryMapping($categoryId: ID!) {
  youtubeCategoryMapping(categoryId: $categoryId) {
    id
    searchKeywords
    channelIds
    qualityThreshold
    syncEnabled
    syncFrequency
    maxVideosPerSync
    lastSyncAt
  }
}
```

### Mutations (Admin Only)

**Sync Category:**
```graphql
mutation SyncCategory($categoryId: ID!, $limit: Int) {
  syncYouTubeCategory(categoryId: $categoryId, limit: $limit) {
    jobId
    categoryName
    videosFetched
    videosImported
    videosSkipped
    videosFailed
    quotaCost
    durationSeconds
    errors
  }
}
```

**Import Single Video:**
```graphql
mutation ImportVideo($videoId: String!, $categoryId: ID!) {
  importYouTubeVideo(videoId: $videoId, categoryId: $categoryId)
}
```

---

## Best Practices

1. **Start Small:** Sync 5-10 categories initially to test configuration
2. **Monitor Quota:** Check daily quota usage to avoid hitting limits
3. **Quality Over Quantity:** Adjust quality thresholds to ensure high-quality content
4. **Regular Review:** Periodically review imported videos and blacklist spam
5. **Customize Keywords:** Refine search keywords based on results
6. **Schedule Wisely:** Run syncs during low-traffic hours
7. **Test Locally:** Test category mappings in development before production

---

## Support

For issues or questions:
- Check server logs: `apps/api/logs/`
- Review sync job history in database
- Check YouTube API quota dashboard
- Verify environment variables are set correctly

---

## License & Compliance

**IMPORTANT:** This integration complies with YouTube's Terms of Service by:
- Only embedding videos (not downloading/hosting)
- Providing clear attribution to original creators
- Including links back to YouTube
- Displaying copyright notices

**Do NOT:**
- Download or re-host YouTube videos
- Remove attribution
- Modify video content
- Use content in ways that violate YouTube ToS

---

*Last Updated: January 2025*
