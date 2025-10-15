import gql from 'graphql-tag';

export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  type User {
    id: ID!
    email: String!
    name: String!
    role: Role!
    createdAt: DateTime!
    profile: UserProfile
    creatorProfile: CreatorProfile
  }

  type UserProfile {
    avatar: String
    bio: String
    location: String
    website: String
  }

  type CreatorProfile {
    verified: Boolean!
    approvalStatus: ApprovalStatus!
    credentials: String
    subscriberCount: Int!
    totalViews: Int!
  }

  enum Role {
    VIEWER
    CREATOR
    ADMIN
  }

  enum ApprovalStatus {
    PENDING
    APPROVED
    REJECTED
  }

  type Video {
    id: ID!
    title: String!
    description: String
    creator: User!
    status: VideoStatus!
    thumbnailUrl: String
    manifestUrl: String
    duration: Int
    tags: [String!]!
    category: String
    difficulty: String
    views: Int!
    likes: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum VideoStatus {
    UPLOADING
    PROCESSING
    READY
    FAILED
  }

  type Thread {
    id: ID!
    title: String!
    creator: User!
    category: String!
    tags: [String!]!
    posts: [Post!]!
    postCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Post {
    id: ID!
    thread: Thread!
    author: User!
    content: String!
    votes: Int!
    isExpertAnswer: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Course {
    id: ID!
    title: String!
    description: String!
    creator: User!
    modules: [CourseModule!]!
    enrollmentCount: Int!
    createdAt: DateTime!
  }

  type CourseModule {
    id: ID!
    title: String!
    order: Int!
    videos: [Video!]!
    quiz: Quiz
  }

  type Quiz {
    id: ID!
    questions: [QuizQuestion!]!
  }

  type QuizQuestion {
    id: ID!
    question: String!
    options: [String!]!
    correctAnswer: Int!
  }

  type Subscription {
    id: ID!
    user: User!
    tier: SubscriptionTier!
    status: SubscriptionStatus!
    currentPeriodEnd: DateTime!
    createdAt: DateTime!
  }

  enum SubscriptionTier {
    FREE
    PREMIUM
    INSTITUTIONAL
  }

  enum SubscriptionStatus {
    ACTIVE
    CANCELED
    PAST_DUE
    TRIALING
  }

  type AuthPayload {
    token: String!
    refreshToken: String!
    user: User!
  }

  type UploadUrl {
    uploadUrl: String!
    videoId: ID!
  }

  type Query {
    me: User
    user(id: ID!): User
    video(id: ID!): Video
    videos(limit: Int, offset: Int, category: String, tags: [String!]): [Video!]!
    searchVideos(query: String!, limit: Int, offset: Int): [Video!]!
    thread(id: ID!): Thread
    threads(category: String, limit: Int, offset: Int): [Thread!]!
    course(id: ID!): Course
    courses(limit: Int, offset: Int): [Course!]!

    # Content Discovery Queries
    categories(parentId: ID, difficultyLevel: DifficultyLevel, featured: Boolean, limit: Int, offset: Int): [ContentCategory!]!
    category(id: ID, slug: String): ContentCategory
    categoryStats: CategoryStats!

    contentItem(id: ID!): ContentItem
    discoverContent(filters: ContentFilters, sortBy: ContentSortBy, limit: Int, offset: Int): ContentFeed!
    searchContent(query: String!, filters: ContentFilters, limit: Int, offset: Int): ContentFeed!

    # Personalized content based on astronomy level
    recommendedForMe(limit: Int): [ContentItem!]!
    trendingContent(limit: Int): [ContentItem!]!

    # User profile
    myAstronomyProfile: UserAstronomyProfile
    userAstronomyProfile(userId: ID!): UserAstronomyProfile

    # User's content collections
    myFollowedCategories: [ContentCategory!]!
    myBookmarkedContent(limit: Int, offset: Int): [ContentItem!]!

    # Creator Analytics (CREATORS ONLY)
    myCreatorAnalytics(timeRange: AnalyticsTimeRange): CreatorAnalytics!

    # YouTube Integration (ADMIN/CREATORS)
    youtubeSyncStatus(categoryId: ID): YouTubeSyncStatus!
    youtubeSyncJobs(limit: Int): [YouTubeSyncJob!]!
    youtubeQuotaUsage: YouTubeQuotaUsage!
    youtubeCategoryMapping(categoryId: ID!): YouTubeCategoryMapping
  }

  type Mutation {
    # Auth
    signup(email: String!, password: String!, name: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    refreshToken(refreshToken: String!): AuthPayload!

    # User
    updateProfile(name: String, bio: String, avatar: String): User!
    applyForCreator(credentials: String!): CreatorProfile!

    # Video
    requestUploadUrl(title: String!, description: String, tags: [String!]): UploadUrl!
    updateVideo(id: ID!, title: String, description: String, tags: [String!]): Video!
    deleteVideo(id: ID!): Boolean!

    # Forum
    createThread(title: String!, category: String!, tags: [String!], content: String!): Thread!
    createPost(threadId: ID!, content: String!): Post!
    votePost(postId: ID!, value: Int!): Post!

    # Course
    createCourse(title: String!, description: String!): Course!
    addModuleToCourse(courseId: ID!, title: String!, videoIds: [ID!]!): CourseModule!
    enrollInCourse(courseId: ID!): Boolean!

    # Subscription
    createSubscription(tier: SubscriptionTier!): Subscription!
    cancelSubscription: Boolean!

    # Content Discovery Mutations

    # Onboarding and profile
    setAstronomyLevel(level: AstronomyLevel!, interests: [String!], preferredTopics: [String!]): UserAstronomyProfile!
    updateAstronomyProfile(level: AstronomyLevel, interests: [String!], preferredTopics: [String!]): UserAstronomyProfile!

    # Social actions
    followCategory(categoryId: ID!): Boolean!
    unfollowCategory(categoryId: ID!): Boolean!

    bookmarkContent(contentItemId: ID!, note: String, folder: String): Boolean!
    removeBookmark(contentItemId: ID!): Boolean!

    voteContent(contentItemId: ID!, value: Int!): ContentItem!
    removeVote(contentItemId: ID!): ContentItem!

    shareContent(contentItemId: ID!, platform: SharePlatform!): Boolean!

    # Content creation (future use)
    createContentItem(input: ContentItemInput!): ContentItem!
    updateContentItem(id: ID!, input: ContentItemInput!): ContentItem!
    deleteContentItem(id: ID!): Boolean!

    # Record view
    recordContentView(contentItemId: ID!, viewDuration: Int, completed: Boolean): Boolean!

    # YouTube Integration (ADMIN ONLY)
    syncYouTubeCategory(categoryId: ID!, limit: Int): YouTubeSyncResult!
    syncAllYouTubeCategories(limit: Int): [YouTubeSyncResult!]!
    syncAllYouTubeCategoriesParallel(limit: Int, concurrency: Int): YouTubeParallelSyncResult!
    importYouTubeVideo(videoId: String!, categoryId: ID!): Boolean!
    updateYouTubeCategoryMapping(categoryId: ID!, keywords: [String!], channels: [String!]): YouTubeCategoryMapping!
    blacklistYouTubeChannel(channelId: String!, reason: String!): Boolean!
    blacklistYouTubeVideo(videoId: String!, reason: String!): Boolean!
  }

  type Subscription {
    videoProcessingUpdate(videoId: ID!): Video!
    newThreadPost(threadId: ID!): Post!
  }

  # ====================================
  # CONTENT DISCOVERY SYSTEM
  # ====================================

  # Enums for content system
  enum AstronomyLevel {
    BEGINNER
    INTERMEDIATE
    ADVANCED
    EXPERT
  }

  enum DifficultyLevel {
    BEGINNER
    INTERMEDIATE
    ADVANCED
    EXPERT
    ALL
  }

  enum AgeGroup {
    KIDS
    TEENS
    ADULTS
    ALL
  }

  enum ContentType {
    VIDEO
    ARTICLE
    TUTORIAL
    GUIDE
    NEWS
  }

  enum ContentSortBy {
    TRENDING
    RECENT
    POPULAR
    RECOMMENDED
    ENGAGEMENT
  }

  enum SharePlatform {
    TWITTER
    FACEBOOK
    LINKEDIN
    REDDIT
    LINK
    EMAIL
  }

  # Category types
  type ContentCategory {
    id: ID!
    name: String!
    description: String
    slug: String!
    parentCategory: ContentCategory
    subCategories: [ContentCategory!]!
    difficultyLevel: DifficultyLevel!
    ageGroup: AgeGroup!
    tags: [String!]!
    iconEmoji: String
    sortOrder: Int!
    isFeatured: Boolean!
    contentCount: Int!
    followerCount: Int!
    isFollowing: Boolean
    featuredContent: [ContentItem!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Content item types
  type ContentItem {
    id: ID!
    title: String!
    description: String
    bodyMarkdown: String
    category: ContentCategory!
    author: User!
    contentType: ContentType!
    sourceType: ContentSource!
    difficultyLevel: DifficultyLevel!
    ageGroup: AgeGroup!
    tags: [String!]!
    mediaUrls: JSON
    video: Video
    engagementScore: Int!
    viewCount: Int!
    upvotes: Int!
    downvotes: Int!
    shareCount: Int!
    bookmarkCount: Int!
    userVote: Int
    isBookmarked: Boolean
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # User astronomy profile
  type UserAstronomyProfile {
    user: User!
    astronomyLevel: AstronomyLevel!
    interests: [String!]!
    preferredTopics: [String!]!
    onboardingCompleted: Boolean!
    followedCategoriesCount: Int!
    bookmarkedContentCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Feed result type
  type ContentFeed {
    items: [ContentItem!]!
    hasMore: Boolean!
    totalCount: Int!
  }

  # Category stats
  type CategoryStats {
    totalCategories: Int!
    byDifficulty: [DifficultyCount!]!
    byAgeGroup: [AgeGroupCount!]!
    mostPopular: [ContentCategory!]!
  }

  type DifficultyCount {
    difficulty: DifficultyLevel!
    count: Int!
  }

  type AgeGroupCount {
    ageGroup: AgeGroup!
    count: Int!
  }

  # Input types
  input ContentFilters {
    categoryId: ID
    categorySlug: String
    difficultyLevel: DifficultyLevel
    ageGroup: AgeGroup
    contentType: ContentType
    tags: [String!]
    authorId: ID
  }

  input ContentItemInput {
    title: String!
    description: String
    bodyMarkdown: String!
    categoryId: ID!
    contentType: ContentType!
    difficultyLevel: DifficultyLevel!
    ageGroup: AgeGroup!
    tags: [String!]
    mediaUrls: JSON
    videoId: ID
  }

  # ====================================
  # CREATOR ANALYTICS SYSTEM
  # ====================================

  enum AnalyticsTimeRange {
    LAST_7_DAYS
    LAST_30_DAYS
    LAST_90_DAYS
    ALL_TIME
  }

  type CreatorAnalytics {
    totalContent: Int!
    totalViews: Int!
    totalUpvotes: Int!
    totalBookmarks: Int!
    totalShares: Int!
    engagementRate: Float!
    topContent: [ContentItem!]!
    viewsOverTime: [TimeSeriesData!]!
    engagementOverTime: [TimeSeriesData!]!
    contentByCategory: [CategoryBreakdown!]!
    audienceLevel: [AudienceLevelBreakdown!]!
  }

  type TimeSeriesData {
    date: String!
    value: Int!
  }

  type CategoryBreakdown {
    category: ContentCategory!
    contentCount: Int!
    totalViews: Int!
    totalEngagement: Int!
  }

  type AudienceLevelBreakdown {
    level: DifficultyLevel!
    count: Int!
    percentage: Float!
  }

  # ====================================
  # YOUTUBE INTEGRATION SYSTEM
  # ====================================

  type YouTubeSyncStatus {
    categoryId: ID
    categoryName: String
    lastSyncAt: DateTime
    hoursSinceSync: Float
    videoCount: Int!
    syncEnabled: Boolean!
  }

  type YouTubeSyncJob {
    id: ID!
    jobType: String!
    categoryId: ID
    categoryName: String
    status: String!
    videosFetched: Int!
    videosImported: Int!
    videosSkipped: Int!
    videosFailed: Int!
    quotaCost: Int!
    durationSeconds: Int
    errorMessage: String
    startedAt: DateTime
    completedAt: DateTime
    createdAt: DateTime!
  }

  type YouTubeSyncResult {
    jobId: ID!
    categoryId: ID!
    categoryName: String!
    videosFetched: Int!
    videosImported: Int!
    videosSkipped: Int!
    videosFailed: Int!
    quotaCost: Int!
    durationSeconds: Int!
    errors: [String!]!
  }

  type YouTubeParallelSyncResult {
    success: Boolean!
    totalCategories: Int!
    results: [YouTubeSyncResult!]!
  }

  type YouTubeQuotaUsage {
    used: Int!
    remaining: Int!
    limit: Int!
    date: String!
  }

  type YouTubeCategoryMapping {
    id: ID!
    categoryId: ID!
    category: ContentCategory!
    searchKeywords: [String!]!
    channelIds: [String!]!
    qualityThreshold: JSON!
    syncEnabled: Boolean!
    syncFrequency: String!
    maxVideosPerSync: Int!
    lastSyncAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum ContentSource {
    NATIVE
    YOUTUBE
    EXTERNAL
  }
`;

