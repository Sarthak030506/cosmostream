# YouTube Video Sync Guide

## Overview

CosmoStream can automatically import thousands of high-quality astronomy and space videos from YouTube. The system has pre-configured mappings for 370+ categories with curated search keywords and trusted channels.

## Quick Start - Sync Thousands of Videos

### Option 1: Sync All Categories (Recommended for initial setup)

```bash
cd apps/api
npx ts-node scripts/bulk-youtube-sync.ts --all --limit 100 --parallel 5
```

This will:
- Sync **ALL** mapped categories
- Import up to **100 videos per category**
- Process **5 categories in parallel**
- Estimated time: **30-60 minutes** for thousands of videos
- Estimated result: **5,000-10,000+ videos**

### Option 2: Sync Specific Category

```bash
npx ts-node scripts/bulk-youtube-sync.ts --category black-holes --limit 50
```

### Option 3: Conservative Sync (Lower API quota usage)

```bash
npx ts-node scripts/bulk-youtube-sync.ts --all --limit 20 --parallel 2
```

This will:
- Import up to 20 videos per category
- Process 2 categories at a time
- Use less YouTube API quota
- Estimated result: **2,000-3,000 videos**

## Parameters Explained

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `--all` | Sync all categories with YouTube mappings | - | `--all` |
| `--category <slug>` | Sync a specific category by slug | - | `--category exoplanets` |
| `--limit <number>` | Max videos to import per category | 50 | `--limit 100` |
| `--parallel <number>` | Categories to sync simultaneously | 3 | `--parallel 5` |

## YouTube API Quota

- YouTube API has a daily quota limit (usually 10,000 units)
- Each video search costs ~100 units
- Each channel lookup costs ~1 unit
- Monitor your quota at: https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas

### Quota Estimates:
- **Small sync** (20 videos/category, 100 categories): ~2,000 units
- **Medium sync** (50 videos/category, 200 categories): ~5,000 units
- **Large sync** (100 videos/category, all categories): ~10,000 units

## Pre-Configured Categories

The system has mappings for:

### Beginner Categories
- What is Space, Astronomy, Stars, Planets, etc.
- Solar System Facts
- Astronomy Basics
- Space for Kids

### Observational Astronomy
- Telescope Reviews
- Night Sky Tours
- Meteor Showers
- Lunar/Planetary Observation

### Astrophotography
- DSLR/Smartphone Photography
- Milky Way Photography
- Image Processing Tutorials

### Advanced Topics
- Black Holes & Relativity
- Cosmology & Dark Matter
- Exoplanets
- Stellar Evolution
- Quantum Mechanics in Space

### Space Missions
- NASA Missions
- SpaceX launches
- Mars Exploration
- ISS Updates

### ...and 300+ more!

## Trusted YouTube Channels

Videos are sourced from high-quality channels including:

- 🚀 **NASA** - Official NASA channel
- 🛰️ **SpaceX** - Rocket launches and updates
- 🇪🇺 **ESA** - European Space Agency
- 🌌 **Fraser Cain** - Universe Today
- 👩‍🔬 **Dr. Becky** - Astrophysicist
- ⚡ **PBS Space Time** - Deep physics
- 🎓 **Scott Manley** - Spaceflight expert
- 🔬 **SciShow Space** - Science education
- 🌍 **Kurzgesagt** - Animated explanations
- 🪐 **Cool Worlds** - Exoplanet science
- 🎬 **Anton Petrov** - Daily space news

## Quality Filters

All imported videos must meet quality thresholds:

- **Minimum views**: 2,000-5,000 (varies by category)
- **Minimum like ratio**: 85-90%
- **Minimum channel subscribers**: 15,000-50,000
- **Content rating**: Family-friendly
- **Relevance**: Must match category keywords

## Example Workflows

### Scenario 1: First-time setup (Get to 10,000 videos fast)

```bash
# Step 1: Import 100 videos per category across all categories
npx ts-node scripts/bulk-youtube-sync.ts --all --limit 100 --parallel 5

# Wait 30-60 minutes

# Step 2: Verify import
# Visit http://localhost:3000/discover
```

### Scenario 2: Target specific topics

```bash
# Sync black holes content
npx ts-node scripts/bulk-youtube-sync.ts --category black-holes --limit 50

# Sync exoplanets
npx ts-node scripts/bulk-youtube-sync.ts --category exoplanets --limit 50

# Sync Mars exploration
npx ts-node scripts/bulk-youtube-sync.ts --category mars-exploration --limit 50
```

### Scenario 3: Daily updates (Keep content fresh)

```bash
# Run this daily to get new videos (lower limit to stay within quota)
npx ts-node scripts/bulk-youtube-sync.ts --all --limit 5 --parallel 10
```

## Monitoring Progress

The script provides real-time progress:

```
🔄 Syncing batch 1/50
   Categories: Black Holes, Exoplanets, Mars Exploration
   ✅ Batch complete. Total: 150 imported / 200 fetched
   ⏸️  Cooling down for 5 seconds...
```

## Viewing Imported Videos

After sync:

1. **Browse by Category**: http://localhost:3000/categories
2. **Discover Feed**: http://localhost:3000/discover
3. **Search**: Use the search bar to find specific topics

## Troubleshooting

### Error: YouTube API quota exceeded

**Solution**: Wait 24 hours for quota reset, or reduce `--limit` and `--parallel` values

### Error: No videos imported

**Possible causes**:
- YouTube API key not configured in `.env`
- Category has no YouTube mapping
- Quality filters too strict

**Check `.env` file**:
```
YOUTUBE_API_KEY=your_api_key_here
```

### Error: Category not found

**Solution**: Check category slug is correct:
```bash
# List all available categories
psql -d cosmostream -c "SELECT slug, name FROM content_categories WHERE id IN (SELECT category_id FROM youtube_category_mappings)"
```

## Advanced: Add Custom Category Mappings

To add YouTube sync for categories not yet mapped:

```sql
-- Add mapping for a custom category
INSERT INTO youtube_category_mappings (
  category_id,
  search_keywords,
  channel_ids,
  quality_threshold,
  sync_frequency,
  max_videos_per_sync
)
SELECT
  id,
  ARRAY['keyword1', 'keyword2', 'keyword3'],
  ARRAY['UCChannelID1', 'UCChannelID2'],
  '{
    "min_views": 3000,
    "min_likes_ratio": 0.85,
    "min_subscribers": 25000,
    "content_rating": "family_friendly"
  }'::jsonb,
  'weekly',
  25
FROM content_categories
WHERE slug = 'your-category-slug';
```

## Best Practices

1. **Start conservative** - Use `--limit 20` for first sync to test
2. **Monitor quota** - Check Google Cloud Console
3. **Batch processing** - Use `--parallel 3-5` to avoid rate limits
4. **Schedule regular syncs** - Run daily with low limits for fresh content
5. **Review imported content** - Check quality and relevance

## Summary

To go from 90 videos to **10,000+ videos**:

```bash
cd apps/api
npx ts-node scripts/bulk-youtube-sync.ts --all --limit 100 --parallel 5
```

Wait 30-60 minutes, and you'll have a massive library of high-quality astronomy content!
