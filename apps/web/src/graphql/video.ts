import { gql } from '@apollo/client';

// ====================================
// FRAGMENTS
// ====================================

export const VIDEO_FIELDS = gql`
  fragment VideoFields on Video {
    id
    title
    description
    status
    thumbnailUrl
    manifestUrl
    duration
    fileSize
    processingProgress
    errorMessage
    tags
    category
    difficulty
    views
    likes
    createdAt
    updatedAt
    completedAt
  }
`;

export const VIDEO_WITH_CREATOR = gql`
  ${VIDEO_FIELDS}
  fragment VideoWithCreator on Video {
    ...VideoFields
    creator {
      id
      name
      profile {
        avatar
      }
      creatorProfile {
        verified
      }
    }
  }
`;

// ====================================
// QUERIES
// ====================================

export const GET_VIDEO = gql`
  ${VIDEO_WITH_CREATOR}
  query GetVideo($id: ID!) {
    video(id: $id) {
      ...VideoWithCreator
    }
  }
`;

export const GET_MY_VIDEOS = gql`
  ${VIDEO_FIELDS}
  query GetMyVideos($status: VideoFilterStatus, $limit: Int, $offset: Int) {
    myVideos(status: $status, limit: $limit, offset: $offset) {
      items {
        ...VideoFields
        creator {
          id
          name
        }
      }
      hasMore
      totalCount
    }
  }
`;

export const GET_VIDEOS = gql`
  ${VIDEO_WITH_CREATOR}
  query GetVideos($limit: Int, $offset: Int, $category: String, $tags: [String!]) {
    videos(limit: $limit, offset: $offset, category: $category, tags: $tags) {
      ...VideoWithCreator
    }
  }
`;

export const SEARCH_VIDEOS = gql`
  ${VIDEO_WITH_CREATOR}
  query SearchVideos($query: String!, $limit: Int, $offset: Int) {
    searchVideos(query: $query, limit: $limit, offset: $offset) {
      ...VideoWithCreator
    }
  }
`;

// ====================================
// MUTATIONS
// ====================================

export const REQUEST_UPLOAD_URL = gql`
  mutation RequestUploadUrl(
    $title: String!
    $description: String
    $tags: [String!]
    $category: String
    $difficulty: String
  ) {
    requestUploadUrl(
      title: $title
      description: $description
      tags: $tags
      category: $category
      difficulty: $difficulty
    ) {
      uploadUrl
      videoId
    }
  }
`;

export const REQUEST_THUMBNAIL_UPLOAD_URL = gql`
  mutation RequestThumbnailUploadUrl($videoId: ID!) {
    requestThumbnailUploadUrl(videoId: $videoId) {
      uploadUrl
      videoId
    }
  }
`;

export const COMPLETE_VIDEO_UPLOAD = gql`
  ${VIDEO_FIELDS}
  mutation CompleteVideoUpload($videoId: ID!, $fileSize: Int!) {
    completeVideoUpload(videoId: $videoId, fileSize: $fileSize) {
      ...VideoFields
    }
  }
`;

export const UPDATE_VIDEO = gql`
  ${VIDEO_FIELDS}
  mutation UpdateVideo(
    $id: ID!
    $title: String
    $description: String
    $tags: [String!]
    $category: String
    $difficulty: String
    $thumbnailUrl: String
  ) {
    updateVideo(
      id: $id
      title: $title
      description: $description
      tags: $tags
      category: $category
      difficulty: $difficulty
      thumbnailUrl: $thumbnailUrl
    ) {
      ...VideoFields
    }
  }
`;

export const DELETE_VIDEO = gql`
  mutation DeleteVideo($id: ID!) {
    deleteVideo(id: $id)
  }
`;

// ====================================
// VIDEO ANALYTICS
// ====================================

export const GET_VIDEO_ANALYTICS = gql`
  query GetVideoAnalytics($videoId: ID!, $timeRange: AnalyticsTimeRange) {
    videoAnalytics(videoId: $videoId, timeRange: $timeRange) {
      videoId
      totalViews
      uniqueViews
      watchTime
      avgViewDuration
      completionRate
      retentionCurve {
        timestamp
        viewerPercentage
        viewerCount
        dropOffCount
      }
      trafficSources {
        source
        views
        uniqueViewers
        percentage
        avgCompletion
      }
      deviceStats {
        desktop
        mobile
        tablet
        browsers {
          browser
          count
          percentage
        }
        operatingSystems {
          os
          count
          percentage
        }
      }
      viewsByDate {
        date
        value
      }
      topCountries {
        country
        views
        percentage
      }
    }
  }
`;

export const GET_REALTIME_ANALYTICS = gql`
  query GetRealtimeAnalytics($videoId: ID!) {
    realtimeAnalytics(videoId: $videoId) {
      videoId
      currentViewers
      viewsLast24h
      viewsLastHour
      avgCompletionLast24h
    }
  }
`;

export const TRACK_VIDEO_VIEW = gql`
  mutation TrackVideoView($input: VideoViewInput!) {
    trackVideoView(input: $input)
  }
`;

export const TRACK_VIDEO_EVENT = gql`
  mutation TrackVideoEvent($input: VideoEventInput!) {
    trackVideoEvent(input: $input)
  }
`;
