import { gql } from '@apollo/client';

export const GET_LATEST_NEWS = gql`
  query GetLatestNews($limit: Int, $offset: Int) {
    latestNews(limit: $limit, offset: $offset) {
      items {
        id
        title
        description
        contentType
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
        tags
        mediaUrls
        sourceUrl
        engagementScore
        viewCount
        userVote
        isBookmarked
        createdAt
        updatedAt
      }
      hasMore
      totalCount
    }
  }
`;

export const GET_FEATURED_NEWS = gql`
  query GetFeaturedNews {
    featuredNews {
      id
      title
      description
      bodyMarkdown
      contentType
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
      tags
      mediaUrls
      sourceUrl
      engagementScore
      viewCount
      userVote
      isBookmarked
      createdAt
      updatedAt
    }
  }
`;

export const GET_NEWS_BY_CATEGORY = gql`
  query GetNewsByCategory($categorySlug: String!, $limit: Int, $offset: Int) {
    newsByCategory(categorySlug: $categorySlug, limit: $limit, offset: $offset) {
      items {
        id
        title
        description
        contentType
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
        tags
        mediaUrls
        sourceUrl
        engagementScore
        viewCount
        userVote
        isBookmarked
        createdAt
        updatedAt
      }
      hasMore
      totalCount
    }
  }
`;

export const SEARCH_NEWS = gql`
  query SearchNews($query: String!, $limit: Int, $offset: Int) {
    searchNews(query: $query, limit: $limit, offset: $offset) {
      items {
        id
        title
        description
        contentType
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
        tags
        mediaUrls
        sourceUrl
        engagementScore
        viewCount
        userVote
        isBookmarked
        createdAt
        updatedAt
      }
      hasMore
      totalCount
    }
  }
`;

export const GET_NEWS_CATEGORIES = gql`
  query GetNewsCategories {
    categories(parentId: null, limit: 50) {
      id
      name
      slug
      description
      iconEmoji
      isFeatured
      subCategories {
        id
        name
        slug
        iconEmoji
      }
    }
  }
`;

export const GET_NEWS_BY_ID = gql`
  query GetNewsById($id: ID!) {
    contentItem(id: $id) {
      id
      title
      description
      bodyMarkdown
      contentType
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
      tags
      mediaUrls
      sourceUrl
      engagementScore
      viewCount
      userVote
      isBookmarked
      publishedAt
      createdAt
      updatedAt
    }
  }
`;
