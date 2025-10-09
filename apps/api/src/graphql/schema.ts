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
  }

  type Subscription {
    videoProcessingUpdate(videoId: ID!): Video!
    newThreadPost(threadId: ID!): Post!
  }
`;
