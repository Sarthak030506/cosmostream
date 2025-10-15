# CosmoStream Page Structure

## Overview

CosmoStream has two main content browsing pages with distinct purposes:

---

## 📺 Browse Page (`/browse`)

### **Purpose**
Native video uploads by creators (feature reserved for future)

### **Current Status**
🚧 Coming Soon - Shows promotional banner with planned features

### **What Will Be Displayed (Future)**
- Videos uploaded directly to CosmoStream by creators
- Stored in `videos` table
- Processed through media-processor service (AWS MediaConvert)
- HLS streaming with multiple resolutions (4K, 1080p, 720p, 480p)

### **Planned Features**
1. **📹 Video Upload** - Direct upload with automatic transcoding
2. **💰 Monetization** - Creator earnings from subscriptions
3. **📊 Analytics** - Detailed metrics on views, engagement, revenue

### **GraphQL Query** (Future)
```graphql
query GetVideos {
  videos(limit: 12, offset: 0) {
    id
    title
    description
    thumbnailUrl
    manifestUrl    # HLS manifest
    duration
    views
    status         # uploaded, processing, ready, failed
    tags
    category
    difficulty
    creator {
      id
      name
    }
  }
}
```

### **Current Implementation**
- ✅ Banner explaining coming soon features
- ✅ CTA button to explore YouTube content (redirects to /discover)
- ✅ Empty state with friendly message
- ✅ Filter UI ready for native videos (categories, difficulty, search)

### **Routes**
- Page: `/browse`
- Video detail: `/video/:id` (for native videos)

---

## ⭐ Discover Page (`/discover`)

### **Purpose**
Main content hub - educational astronomy content from all sources

### **Current Status**
✅ Active - Displaying YouTube videos and other content types

### **What Is Displayed**
All content from `content_items` table including:
- 🎬 YouTube videos (`sourceType: 'youtube'`)
- 📄 Articles (`contentType: 'article'`)
- 🎓 Tutorials (`contentType: 'tutorial'`)
- 📖 Guides (`contentType: 'guide'`)
- 📰 News (`contentType: 'news'`)

### **Data Source**
```sql
-- All content stored here:
SELECT * FROM content_items
WHERE source_type IN ('youtube', 'native', 'external')
  AND content_type IN ('video', 'article', 'tutorial', 'guide', 'news');
```

### **GraphQL Query**
```graphql
query DiscoverContent {
  discoverContent(
    filters: {
      categoryId: "uuid"
      difficultyLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT"
      contentType: "VIDEO" | "ARTICLE" | "TUTORIAL" | "GUIDE" | "NEWS"
    }
    sortBy: "TRENDING" | "RECENT" | "POPULAR" | "ENGAGEMENT"
    limit: 12
    offset: 0
  ) {
    items {
      id
      title
      description
      sourceType        # YOUTUBE, NATIVE, EXTERNAL
      contentType       # VIDEO, ARTICLE, etc.
      mediaUrls         # YouTube metadata for videos
      difficultyLevel
      upvotes
      downvotes
      viewCount
      isBookmarked
      userVote
      category {
        name
        iconEmoji
        slug
      }
      author {
        name
      }
    }
    hasMore
    totalCount
  }
}
```

### **Features**
1. **Personalized Recommendations** - Top section shows recommended content
2. **Advanced Filters**:
   - Category (from database, 370+ categories)
   - Difficulty level (All, Beginner, Intermediate, Advanced, Expert)
   - Content type (All, Video, Article, Tutorial, Guide, News)
   - Sort by (Trending, Recent, Popular, Engagement)
3. **Search** - Full-text search across title and description
4. **Social Features** - Upvote, downvote, bookmark on each card
5. **Infinite Scroll** - "Load More" button for pagination

### **Content Card Display**
Each card shows:
- Category header with emoji
- Content type icon (🎬 📄 🎓 📖 📰)
- Title and description
- Difficulty badge
- Tags (first 3)
- Author name
- View count
- Social actions (upvote/downvote/bookmark)

### **Routes**
- Page: `/discover`
- Content detail: `/content/:id`

---

## 🎯 Current Video Flow

### **YouTube Videos (Active Now)**

```
YouTube API
    ↓
Sync Service → content_items table (source_type='youtube')
    ↓
Discover Page → ContentCard component
    ↓
Content Detail Page → YouTubeEmbed component
    ↓
YouTube iframe (video streams from YouTube)
```

**Steps:**
1. Admin syncs category via GraphQL mutation or cron job
2. Videos imported into `content_items` with `source_type='youtube'`
3. Videos appear in Discover page with 🎬 icon
4. Clicking opens `/content/:id` with YouTube embed player
5. Video streams directly from YouTube servers

### **Native Videos (Future)**

```
Creator Upload
    ↓
S3 Bucket → SNS → Media Processor (Bull Queue)
    ↓
AWS MediaConvert (HLS transcoding)
    ↓
videos table (status='ready', manifestUrl)
    ↓
Browse Page → Video card
    ↓
Video Detail Page → Video.js HLS player
    ↓
CloudFront CDN (video streams from S3)
```

---

## 📊 Data Model Comparison

### **YouTube Videos**
```typescript
// Stored in: content_items table
{
  id: "uuid",
  source_type: "youtube",
  content_type: "video",
  title: "Amazing Space Video",
  description: "Description...",
  category_id: "uuid",
  author_id: "uuid",     // Admin user
  media_urls: {          // JSONB field
    youtube_id: "dQw4w9WgXcQ",
    thumbnail: "https://i.ytimg.com/vi/...",
    embed_url: "https://www.youtube.com/embed/...",
    watch_url: "https://www.youtube.com/watch?v=...",
    channel_id: "UCxxxxx",
    channel_name: "NASA",
    published_at: "2024-01-15T10:00:00Z",
    duration_seconds: 625
  },
  tags: ["astronomy", "space"],
  difficulty_level: "intermediate",
  view_count: 1234567,
  engagement_score: 12345,
  created_at: "2024-01-20T12:00:00Z"
}
```

### **Native Videos (Future)**
```typescript
// Stored in: videos table
{
  id: "uuid",
  title: "My Space Documentary",
  description: "Description...",
  creator_id: "uuid",     // Creator user
  thumbnail_url: "https://cdn.cosmostream.com/thumbs/...",
  manifest_url: "https://cdn.cosmostream.com/videos/.../manifest.m3u8",
  duration: 625,
  status: "ready",        // uploaded, processing, ready, failed
  views: 1234,
  category: "Astronomy",
  difficulty: "Intermediate",
  tags: ["space", "documentary"],
  created_at: "2024-01-20T12:00:00Z"
}
```

---

## 🚀 Navigation Summary

```
┌──────────────────────────────────────────────────────────┐
│                    CosmoStream Navigation                 │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  🏠 Home         → Landing page                          │
│  ⭐ Discover     → All content (YouTube + articles) ✓    │
│  📺 Browse       → Native videos (coming soon) 🚧        │
│  📂 Categories   → Category explorer                     │
│  👤 Profile      → User profile & settings               │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 💡 Key Decisions

### **Why Two Separate Pages?**

1. **Different Data Sources**
   - Discover: `content_items` table (YouTube, articles, guides)
   - Browse: `videos` table (native uploads)

2. **Different Business Models**
   - Discover: Free aggregated content, ads/subscriptions
   - Browse: Creator monetization, revenue sharing

3. **Different Technical Requirements**
   - YouTube: Embedding, attribution, quota management
   - Native: Upload flow, transcoding, CDN, storage costs

4. **User Experience**
   - Discover: Learning hub, explore all content types
   - Browse: Creator showcase, upload your own content

---

## 📝 Current Implementation Status

### ✅ **Completed**
- Discover page with YouTube videos
- Content detail page with YouTube player
- YouTube sync service with quota management
- Quality filtering and spam detection
- Social features (upvote, bookmark, share)
- Category-based organization (370+ categories)
- Database schema for YouTube integration
- GraphQL API for all YouTube operations

### 🚧 **Coming Soon (Browse Page)**
- Video upload interface
- Media processing pipeline
- HLS transcoding
- Creator dashboard
- Video analytics
- Monetization features

### 🎯 **Next Immediate Steps**
1. Sync more YouTube categories (99 configured, 1 synced)
2. Implement performance optimizations (bulk imports, caching)
3. Add Elasticsearch for better search
4. Implement video upload feature (when ready)

---

## 🔗 Related Documentation

- `YOUTUBE_INTEGRATION_SETUP.md` - YouTube API setup guide
- `YOUTUBE_IMPLEMENTATION_SUMMARY.md` - YouTube feature overview
- `YOUTUBE_SCALING_OPTIMIZATION.md` - Performance optimization guide
- `CLAUDE.md` - Project overview and architecture

---

**Last Updated:** 2025-10-13
**Status:** Browse page updated with "coming soon" banner ✓
