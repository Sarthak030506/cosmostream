# CosmoStream - Complete Implementation Guide

## 📚 Table of Contents
1. [What We Built](#what-we-built)
2. [How It All Works](#how-it-all-works)
3. [Project Structure](#project-structure)
4. [Current Features](#current-features)
5. [Technology Explained](#technology-explained)
6. [Code Walkthrough](#code-walkthrough)
7. [How to Extend](#how-to-extend)

---

## 🎯 What We Built

You now have a **full-stack video streaming platform** specifically designed for space, astronomy, and astrophysics content. Think of it as "YouTube meets NASA" with special features for space enthusiasts.

### The Big Picture

```
User's Browser
     ↓
Next.js Frontend (Port 3000) - What users see
     ↓
GraphQL API (Port 4000) - Handles requests
     ↓
PostgreSQL Database (Port 5432) - Stores all data
     +
Redis Cache (Port 6379) - Makes things faster
```

---

## 🏗️ How It All Works

### 1. **Frontend (What Users See)**

**Location**: `apps/web/`

When you visit http://localhost:3000, you're seeing a **Next.js application**. Think of Next.js as a supercharged React framework.

**What's Currently Working:**

- **Homepage** (`apps/web/src/app/page.tsx`)
  - Hero section with space gradient
  - Featured videos section (4 sample videos)
  - Features showcase (6 cards explaining the platform)
  - Navigation menu
  - Footer with links

**How It Works:**
```javascript
User types URL → Next.js router loads page.tsx → React renders components → Browser shows website
```

**Key Technologies:**
- **React**: JavaScript library for building user interfaces
- **Next.js**: Framework that adds routing, server-side rendering, and optimization
- **Tailwind CSS**: Utility-first CSS framework for styling

### 2. **Backend (The Brain)**

**Location**: `apps/api/`

This is the GraphQL API that handles all data operations.

**What It Does:**
- Receives requests from the frontend
- Authenticates users (checks if they're logged in)
- Fetches data from the database
- Sends responses back

**How It Works:**
```
Frontend sends query → API receives it → API checks database → API returns data → Frontend displays it
```

**Currently Implemented:**

#### Authentication System
```typescript
// User can sign up
mutation {
  signup(email: "user@example.com", password: "pass123", name: "John") {
    token
    user { id, email }
  }
}

// User can log in
mutation {
  login(email: "user@example.com", password: "pass123") {
    token
    user { id, name }
  }
}
```

#### Video Management
```graphql
# Get all videos
query {
  videos(limit: 10) {
    id
    title
    description
    creator { name }
    tags
    views
  }
}

# Get single video
query {
  video(id: "video-id-here") {
    title
    manifestUrl  # URL to video file
    creator { name }
  }
}
```

#### Forum System
```graphql
# Get forum threads
query {
  threads(category: "Astrophysics") {
    id
    title
    postCount
    creator { name }
  }
}

# Create a new thread
mutation {
  createThread(
    title: "Best telescopes for beginners?"
    category: "Equipment"
    content: "Looking for advice..."
  ) {
    id
    title
  }
}
```

### 3. **Database (The Storage)**

**Location**: PostgreSQL container (Docker)

This is where **ALL data is stored**.

**Current Database Structure:**

#### Users Table
```sql
users
├── id (unique identifier)
├── email (login email)
├── password_hash (encrypted password)
├── name (display name)
├── role (viewer/creator/admin)
└── created_at (when they joined)
```

**Sample Data:**
- `viewer@cosmostream.com` - Regular user
- `creator@cosmostream.com` - Content creator
- `admin@cosmostream.com` - Administrator

#### Videos Table
```sql
videos
├── id
├── title (e.g., "Introduction to Black Holes")
├── description
├── creator_id (who uploaded it)
├── status (uploading/processing/ready)
├── thumbnail_url
├── manifest_url (video file location)
├── duration (in seconds)
├── tags (array: ["physics", "astronomy"])
├── category
├── views
└── likes
```

**Sample Data:**
- 3 test videos about space topics

#### Forum Tables
```sql
threads
├── id
├── title
├── creator_id
├── category
└── tags

posts
├── id
├── thread_id
├── author_id
├── content
├── votes
└── is_expert_answer
```

**Sample Data:**
- 1 thread: "Best telescopes for beginners?"
- 2 posts in that thread

### 4. **Cache (Speed Booster)**

**Location**: Redis container (Docker)

Redis stores temporary data to make things faster:
- Session data (who's logged in)
- Frequently accessed content
- Rate limiting counters

---

## 📁 Project Structure Explained

```
CosmoStream/
│
├── apps/                          # All applications
│   ├── web/                       # Frontend (Next.js)
│   │   ├── src/
│   │   │   ├── app/              # Pages
│   │   │   │   ├── page.tsx      # Homepage (what you see at localhost:3000)
│   │   │   │   ├── layout.tsx    # Wraps all pages
│   │   │   │   ├── globals.css   # Global styles
│   │   │   │   └── providers.tsx # Apollo Client setup
│   │   │   └── components/       # Reusable UI pieces
│   │   │       ├── layout/
│   │   │       │   └── Navigation.tsx  # Top menu bar
│   │   │       └── home/
│   │   │           ├── Hero.tsx        # Big banner section
│   │   │           ├── FeaturedVideos.tsx
│   │   │           └── Features.tsx
│   │   ├── tailwind.config.js    # Tailwind CSS settings
│   │   └── package.json          # Dependencies
│   │
│   ├── api/                       # Backend (GraphQL)
│   │   ├── src/
│   │   │   ├── index.ts          # Server entry point
│   │   │   ├── context.ts        # Authentication context
│   │   │   ├── graphql/
│   │   │   │   ├── schema.ts     # GraphQL type definitions
│   │   │   │   └── resolvers/    # Business logic
│   │   │   │       ├── auth.ts   # Login/signup
│   │   │   │       ├── user.ts   # User queries
│   │   │   │       ├── video.ts  # Video CRUD
│   │   │   │       ├── forum.ts  # Forum operations
│   │   │   │       └── course.ts # Educational content
│   │   │   ├── db/               # Database connection
│   │   │   │   ├── index.ts      # PostgreSQL client
│   │   │   │   └── redis.ts      # Redis client
│   │   │   ├── utils/
│   │   │   │   ├── auth.ts       # JWT token handling
│   │   │   │   └── logger.ts     # Logging system
│   │   │   ├── middleware/
│   │   │   │   └── errorHandler.ts
│   │   │   └── services/
│   │   │       ├── s3.ts         # AWS file uploads
│   │   │       └── stripe.ts     # Payment processing
│   │   └── package.json
│   │
│   ├── media-processor/           # Video transcoding (not active yet)
│   │   └── src/
│   │       ├── index.ts
│   │       ├── queue/            # Job queue
│   │       └── processors/       # Video processing
│   │
│   └── realtime/                  # WebSocket server (not active yet)
│       └── src/
│           ├── index.ts
│           └── handlers/         # Chat, notifications
│
├── packages/
│   └── shared/                    # Shared code
│       └── src/
│           ├── types/            # TypeScript definitions
│           ├── schemas/          # Validation schemas
│           ├── constants/        # App constants
│           └── utils/            # Helper functions
│
├── database/
│   ├── schema.sql                # Database structure
│   └── seeds/
│       └── dev_data.sql         # Test data
│
├── docker-compose.yml            # Docker configuration
├── package.json                  # Root dependencies
└── turbo.json                    # Monorepo configuration
```

---

## ✅ Current Features (What's Working)

### 🟢 Fully Implemented

#### 1. **User Authentication**
- **Sign up**: Create new account
- **Log in**: Authenticate users
- **JWT tokens**: Secure session management
- **Password hashing**: Bcrypt encryption
- **Roles**: viewer, creator, admin

**Code Location**: `apps/api/src/graphql/resolvers/auth.ts`

#### 2. **User Profiles**
- **View profile**: Get user details
- **Update profile**: Change name, bio, avatar
- **Creator verification**: Apply to become content creator

**Code Location**: `apps/api/src/graphql/resolvers/user.ts`

#### 3. **Video Management**
- **List videos**: Browse all available videos
- **Get video details**: View single video
- **Search videos**: Full-text search (basic)
- **Create video**: Upload metadata
- **Update video**: Modify title, description, tags
- **Delete video**: Remove videos

**Code Location**: `apps/api/src/graphql/resolvers/video.ts`

#### 4. **Forum System**
- **Create threads**: Start discussions
- **Create posts**: Reply to threads
- **Vote on posts**: Upvote/downvote
- **Expert answers**: Badge verified responses
- **Categories**: Organize by topic

**Code Location**: `apps/api/src/graphql/resolvers/forum.ts`

#### 5. **Educational Platform**
- **Create courses**: Build learning paths
- **Add modules**: Organize content
- **Track progress**: Monitor completion
- **Enroll students**: Join courses

**Code Location**: `apps/api/src/graphql/resolvers/course.ts`

#### 6. **Database Schema**
- **15+ tables**: Complete data model
- **Relationships**: Foreign keys
- **Indexes**: Optimized queries
- **Sample data**: 3 test users, 3 videos, 1 forum thread

**Code Location**: `database/schema.sql`

#### 7. **Frontend UI**
- **Homepage**: Hero, featured videos, features
- **Navigation**: Top menu with links
- **Responsive**: Works on mobile & desktop
- **Dark theme**: Space-themed colors
- **Tailwind CSS**: Modern styling

**Code Location**: `apps/web/src/`

---

### 🟡 Partially Implemented (Structure Ready, Not Active)

#### 1. **Media Processing Service**
- Structure created
- AWS MediaConvert integration code
- Video transcoding pipeline
- **Status**: Not running yet (needs AWS credentials)

#### 2. **Real-time WebSocket Service**
- Structure created
- Socket.io setup
- Chat handlers
- **Status**: Not running yet

#### 3. **Subscription/Payments**
- Stripe integration code
- Database tables for subscriptions
- **Status**: Needs Stripe API keys

---

### 🔴 Not Implemented Yet (Planned Features)

1. **Actual video upload** (S3 integration needs AWS keys)
2. **Video playback** (Video.js player on frontend)
3. **Interactive sky maps** (Three.js visualization)
4. **Live mission tracking** (API integration)
5. **Real-time chat** (WebSocket activation)
6. **Email notifications** (SendGrid/Nodemailer)
7. **Search with Elasticsearch** (needs Elasticsearch setup)

---

## 🔧 Technology Explained (ELI5)

### Frontend Technologies

#### **React**
- Think of it as LEGO blocks for websites
- Each component is a reusable piece
- Example: `<Navigation />` component appears on every page

#### **Next.js**
- React on steroids
- Handles routing (URL → Page)
- Server-side rendering (faster initial load)
- Built-in optimization

#### **Tailwind CSS**
- Utility classes for styling
- Instead of writing CSS: `<div className="bg-blue-500 p-4 rounded">`
- Faster development

#### **TypeScript**
- JavaScript with type safety
- Catches errors before runtime
- Example:
  ```typescript
  // This will error if you pass wrong type
  function greet(name: string) {
    return `Hello ${name}`;
  }
  greet(123); // ERROR!
  ```

### Backend Technologies

#### **Node.js**
- JavaScript runtime for servers
- Handles HTTP requests
- Non-blocking I/O (fast!)

#### **GraphQL**
- API query language
- Client requests exactly what it needs
- Single endpoint for all queries

#### **Apollo Server**
- GraphQL server implementation
- Handles routing, validation, execution

#### **PostgreSQL**
- Relational database
- Tables with rows and columns
- SQL for querying

#### **Redis**
- In-memory data store
- Super fast (microsecond latency)
- Used for caching

### DevOps Technologies

#### **Docker**
- Containers for applications
- Like virtual machines but lighter
- Ensures consistency across environments

#### **Turborepo**
- Monorepo build system
- Manages multiple apps in one repo
- Speeds up builds with caching

---

## 💡 Code Walkthrough

### Example 1: How Homepage Works

**File**: `apps/web/src/app/page.tsx`

```typescript
// 1. Import components
import { Navigation } from '@/components/layout/Navigation';
import { Hero } from '@/components/home/Hero';
import { FeaturedVideos } from '@/components/home/FeaturedVideos';

// 2. Export page component
export default function HomePage() {
  return (
    <div>
      <Navigation />      {/* Top menu bar */}
      <Hero />           {/* Big banner */}
      <FeaturedVideos /> {/* Video grid */}
      <Footer />         {/* Bottom links */}
    </div>
  );
}
```

**Flow:**
1. User visits `http://localhost:3000`
2. Next.js router loads `page.tsx`
3. React renders each component
4. Browser displays the HTML

### Example 2: How Login Works

**Frontend** (`apps/web/src/app/providers.tsx`):
```typescript
// 1. User enters email/password
const login = async (email, password) => {
  // 2. Send GraphQL mutation
  const result = await apolloClient.mutate({
    mutation: LOGIN_MUTATION,
    variables: { email, password }
  });

  // 3. Store token in localStorage
  localStorage.setItem('token', result.data.login.token);
};
```

**Backend** (`apps/api/src/graphql/resolvers/auth.ts`):
```typescript
async login(_, { email, password }, { db }) {
  // 1. Find user in database
  const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);

  // 2. Verify password
  const valid = await bcrypt.compare(password, user.password_hash);

  // 3. Generate JWT token
  const token = jwt.sign({ userId: user.id }, JWT_SECRET);

  // 4. Return token and user data
  return { token, user };
}
```

### Example 3: How Data Flows

**Fetching Videos:**

```
1. User opens homepage
   ↓
2. FeaturedVideos.tsx loads
   ↓
3. Component makes GraphQL query:
   query { videos(limit: 4) { id, title } }
   ↓
4. Apollo Client sends HTTP POST to localhost:4000/graphql
   ↓
5. API receives request
   ↓
6. Video resolver executes:
   db.query('SELECT * FROM videos LIMIT 4')
   ↓
7. PostgreSQL returns data
   ↓
8. API sends JSON response
   ↓
9. Apollo Client caches result
   ↓
10. React updates UI with video cards
```

---

## 🚀 How to Extend

### Adding a New Page

1. **Create file**: `apps/web/src/app/browse/page.tsx`
2. **Add component**:
   ```typescript
   export default function BrowsePage() {
     return <div>Browse Videos</div>;
   }
   ```
3. **Access**: http://localhost:3000/browse

### Adding a New API Endpoint

1. **Define type** in `schema.ts`:
   ```graphql
   type Query {
     trendingVideos: [Video!]!
   }
   ```

2. **Add resolver** in `video.ts`:
   ```typescript
   Query: {
     async trendingVideos(_, __, { db }) {
       return await db.query('SELECT * FROM videos ORDER BY views DESC LIMIT 10');
     }
   }
   ```

3. **Use in frontend**:
   ```typescript
   const { data } = useQuery(gql`
     query { trendingVideos { id, title } }
   `);
   ```

### Adding a New Database Table

1. **Edit** `database/schema.sql`:
   ```sql
   CREATE TABLE comments (
     id UUID PRIMARY KEY,
     video_id UUID REFERENCES videos(id),
     user_id UUID REFERENCES users(id),
     content TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Apply migration**:
   ```bash
   docker exec cosmostream-postgres psql -U postgres -d cosmostream -f /path/to/migration.sql
   ```

---

## 📊 Current Status Summary

| Component | Status | What Works |
|-----------|--------|------------|
| **Frontend** | ✅ 80% | Homepage, navigation, styling complete |
| **GraphQL API** | ✅ 90% | All CRUD operations working |
| **Authentication** | ✅ 100% | Login, signup, JWT tokens |
| **Database** | ✅ 100% | Schema created, sample data loaded |
| **Video System** | 🟡 60% | Metadata works, upload needs AWS |
| **Forum** | ✅ 90% | Threads, posts, voting working |
| **Courses** | ✅ 80% | Structure complete, needs UI |
| **Payments** | 🟡 50% | Code ready, needs Stripe keys |
| **Real-time** | 🟡 30% | Structure ready, not active |
| **Media Processing** | 🟡 40% | Code ready, needs AWS |

**Legend:**
- ✅ Working
- 🟡 Partially done
- ⚠️ Needs work

---

## 🎓 Key Concepts to Understand

### 1. **Monorepo**
- One repository with multiple applications
- Shared code in `packages/`
- Managed by Turborepo

### 2. **GraphQL vs REST**
- **REST**: Multiple endpoints (`/api/users`, `/api/videos`)
- **GraphQL**: Single endpoint, client specifies what it needs
- More efficient, strongly typed

### 3. **JWT Tokens**
- JSON Web Tokens for authentication
- Signed by server
- Client includes in Authorization header
- Server verifies and extracts user info

### 4. **Environment Variables**
- Configuration stored in `.env` files
- Never commit secrets to git
- Examples: database passwords, API keys

### 5. **Docker Containers**
- Isolated environments
- Each service runs in its own container
- `docker-compose.yml` orchestrates multiple containers

---

## 🎯 What to Learn Next

To build on this project, focus on:

1. **React Fundamentals**
   - Components, props, state
   - Hooks: useState, useEffect
   - Context API

2. **GraphQL**
   - Queries vs Mutations
   - Resolvers
   - Apollo Client

3. **TypeScript Basics**
   - Types and interfaces
   - Type inference
   - Generics

4. **Database Concepts**
   - SQL queries
   - Relationships (foreign keys)
   - Indexes

5. **Authentication**
   - JWT tokens
   - Password hashing
   - Session management

---

## 📚 Resources

- **Next.js**: https://nextjs.org/learn
- **React**: https://react.dev/learn
- **GraphQL**: https://graphql.org/learn
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 🆘 Common Questions

**Q: Where is the actual video streaming?**
A: Video upload/streaming needs AWS S3 + MediaConvert. Code is ready in `apps/media-processor/`, but needs AWS credentials.

**Q: Can users actually sign up?**
A: Yes! The signup mutation works. Try it in GraphQL playground.

**Q: Where is the data stored?**
A: PostgreSQL database in Docker container. Data persists between restarts.

**Q: How do I add a new page?**
A: Create `apps/web/src/app/your-page/page.tsx`. Next.js handles routing automatically.

**Q: What's Turbo doing?**
A: Turborepo speeds up builds by caching and running tasks in parallel.

**Q: Why Docker?**
A: Ensures everyone has the same PostgreSQL, Redis versions. Easy setup.

---

That's the complete breakdown! You now have a solid understanding of how everything fits together. 🚀
