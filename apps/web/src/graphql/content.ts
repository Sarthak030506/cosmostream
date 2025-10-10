import { gql } from '@apollo/client';

// ====================================
// FRAGMENTS
// ====================================

export const CONTENT_CATEGORY_FIELDS = gql`
  fragment ContentCategoryFields on ContentCategory {
    id
    name
    description
    slug
    difficultyLevel
    ageGroup
    tags
    iconEmoji
    sortOrder
    isFeatured
    contentCount
    followerCount
    isFollowing
    createdAt
    updatedAt
  }
`;

export const CONTENT_ITEM_FIELDS = gql`
  fragment ContentItemFields on ContentItem {
    id
    title
    description
    bodyMarkdown
    contentType
    difficultyLevel
    ageGroup
    tags
    mediaUrls
    engagementScore
    viewCount
    upvotes
    downvotes
    shareCount
    bookmarkCount
    userVote
    isBookmarked
    createdAt
    updatedAt
  }
`;

export const USER_ASTRONOMY_PROFILE_FIELDS = gql`
  fragment UserAstronomyProfileFields on UserAstronomyProfile {
    astronomyLevel
    interests
    preferredTopics
    onboardingCompleted
    followedCategoriesCount
    bookmarkedContentCount
    createdAt
    updatedAt
  }
`;

// ====================================
// QUERIES
// ====================================

export const GET_CATEGORIES = gql`
  ${CONTENT_CATEGORY_FIELDS}
  query GetCategories(
    $parentId: ID
    $difficultyLevel: DifficultyLevel
    $featured: Boolean
    $limit: Int
    $offset: Int
  ) {
    categories(
      parentId: $parentId
      difficultyLevel: $difficultyLevel
      featured: $featured
      limit: $limit
      offset: $offset
    ) {
      ...ContentCategoryFields
    }
  }
`;

export const GET_CATEGORY = gql`
  ${CONTENT_CATEGORY_FIELDS}
  ${CONTENT_ITEM_FIELDS}
  query GetCategory($id: ID, $slug: String) {
    category(id: $id, slug: $slug) {
      ...ContentCategoryFields
      parentCategory {
        id
        name
        slug
      }
      subCategories {
        id
        name
        slug
        iconEmoji
        contentCount
      }
      featuredContent {
        ...ContentItemFields
        category {
          id
          name
          slug
        }
        author {
          id
          name
        }
      }
    }
  }
`;

export const GET_CATEGORY_STATS = gql`
  query GetCategoryStats {
    categoryStats {
      totalCategories
      byDifficulty {
        difficulty
        count
      }
      byAgeGroup {
        ageGroup
        count
      }
      mostPopular {
        id
        name
        slug
        iconEmoji
        followerCount
        contentCount
      }
    }
  }
`;

export const GET_CONTENT_ITEM = gql`
  ${CONTENT_ITEM_FIELDS}
  query GetContentItem($id: ID!) {
    contentItem(id: $id) {
      ...ContentItemFields
      category {
        id
        name
        slug
        iconEmoji
      }
      author {
        id
        name
        profile {
          avatar
        }
      }
      video {
        id
        title
        manifestUrl
        thumbnailUrl
      }
    }
  }
`;

export const DISCOVER_CONTENT = gql`
  ${CONTENT_ITEM_FIELDS}
  query DiscoverContent(
    $filters: ContentFilters
    $sortBy: ContentSortBy
    $limit: Int
    $offset: Int
  ) {
    discoverContent(
      filters: $filters
      sortBy: $sortBy
      limit: $limit
      offset: $offset
    ) {
      items {
        ...ContentItemFields
        category {
          id
          name
          slug
          iconEmoji
        }
        author {
          id
          name
        }
      }
      hasMore
      totalCount
    }
  }
`;

export const SEARCH_CONTENT = gql`
  ${CONTENT_ITEM_FIELDS}
  query SearchContent(
    $query: String!
    $filters: ContentFilters
    $limit: Int
    $offset: Int
  ) {
    searchContent(
      query: $query
      filters: $filters
      limit: $limit
      offset: $offset
    ) {
      items {
        ...ContentItemFields
        category {
          id
          name
          slug
        }
        author {
          id
          name
        }
      }
      hasMore
      totalCount
    }
  }
`;

export const GET_RECOMMENDED_CONTENT = gql`
  ${CONTENT_ITEM_FIELDS}
  query GetRecommendedContent($limit: Int) {
    recommendedForMe(limit: $limit) {
      ...ContentItemFields
      category {
        id
        name
        slug
        iconEmoji
      }
      author {
        id
        name
      }
    }
  }
`;

export const GET_TRENDING_CONTENT = gql`
  ${CONTENT_ITEM_FIELDS}
  query GetTrendingContent($limit: Int) {
    trendingContent(limit: $limit) {
      ...ContentItemFields
      category {
        id
        name
        slug
      }
      author {
        id
        name
      }
    }
  }
`;

export const GET_MY_ASTRONOMY_PROFILE = gql`
  ${USER_ASTRONOMY_PROFILE_FIELDS}
  query GetMyAstronomyProfile {
    myAstronomyProfile {
      ...UserAstronomyProfileFields
      user {
        id
        name
        email
      }
    }
  }
`;

export const GET_MY_FOLLOWED_CATEGORIES = gql`
  ${CONTENT_CATEGORY_FIELDS}
  query GetMyFollowedCategories {
    myFollowedCategories {
      ...ContentCategoryFields
    }
  }
`;

export const GET_MY_BOOKMARKED_CONTENT = gql`
  ${CONTENT_ITEM_FIELDS}
  query GetMyBookmarkedContent($limit: Int, $offset: Int) {
    myBookmarkedContent(limit: $limit, offset: $offset) {
      ...ContentItemFields
      category {
        id
        name
        slug
      }
      author {
        id
        name
      }
    }
  }
`;

// ====================================
// MUTATIONS
// ====================================

export const SET_ASTRONOMY_LEVEL = gql`
  ${USER_ASTRONOMY_PROFILE_FIELDS}
  mutation SetAstronomyLevel(
    $level: AstronomyLevel!
    $interests: [String!]
    $preferredTopics: [String!]
  ) {
    setAstronomyLevel(
      level: $level
      interests: $interests
      preferredTopics: $preferredTopics
    ) {
      ...UserAstronomyProfileFields
    }
  }
`;

export const UPDATE_ASTRONOMY_PROFILE = gql`
  ${USER_ASTRONOMY_PROFILE_FIELDS}
  mutation UpdateAstronomyProfile(
    $level: AstronomyLevel
    $interests: [String!]
    $preferredTopics: [String!]
  ) {
    updateAstronomyProfile(
      level: $level
      interests: $interests
      preferredTopics: $preferredTopics
    ) {
      ...UserAstronomyProfileFields
    }
  }
`;

export const FOLLOW_CATEGORY = gql`
  mutation FollowCategory($categoryId: ID!) {
    followCategory(categoryId: $categoryId)
  }
`;

export const UNFOLLOW_CATEGORY = gql`
  mutation UnfollowCategory($categoryId: ID!) {
    unfollowCategory(categoryId: $categoryId)
  }
`;

export const BOOKMARK_CONTENT = gql`
  mutation BookmarkContent($contentItemId: ID!, $note: String, $folder: String) {
    bookmarkContent(contentItemId: $contentItemId, note: $note, folder: $folder)
  }
`;

export const REMOVE_BOOKMARK = gql`
  mutation RemoveBookmark($contentItemId: ID!) {
    removeBookmark(contentItemId: $contentItemId)
  }
`;

export const VOTE_CONTENT = gql`
  ${CONTENT_ITEM_FIELDS}
  mutation VoteContent($contentItemId: ID!, $value: Int!) {
    voteContent(contentItemId: $contentItemId, value: $value) {
      ...ContentItemFields
    }
  }
`;

export const REMOVE_VOTE = gql`
  ${CONTENT_ITEM_FIELDS}
  mutation RemoveVote($contentItemId: ID!) {
    removeVote(contentItemId: $contentItemId) {
      ...ContentItemFields
    }
  }
`;

export const SHARE_CONTENT = gql`
  mutation ShareContent($contentItemId: ID!, $platform: SharePlatform!) {
    shareContent(contentItemId: $contentItemId, platform: $platform)
  }
`;

export const RECORD_CONTENT_VIEW = gql`
  mutation RecordContentView(
    $contentItemId: ID!
    $viewDuration: Int
    $completed: Boolean
  ) {
    recordContentView(
      contentItemId: $contentItemId
      viewDuration: $viewDuration
      completed: $completed
    )
  }
`;

export const CREATE_CONTENT_ITEM = gql`
  ${CONTENT_ITEM_FIELDS}
  mutation CreateContentItem($input: ContentItemInput!) {
    createContentItem(input: $input) {
      ...ContentItemFields
    }
  }
`;
