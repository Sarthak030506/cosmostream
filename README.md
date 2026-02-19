# CosmoStream

> A niche video streaming platform dedicated to space, astronomy, and astrophysics content — built for enthusiasts, educators, and explorers of the cosmos.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development Commands](#development-commands)
- [Application Routes](#application-routes)
- [GraphQL API](#graphql-api)
- [Database](#database)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

CosmoStream is a full-stack microservices streaming platform built with a Turborepo monorepo. It delivers high-quality space video content alongside unique interactive features like a real-time 3D sky map, live mission tracking, and community forums — all tailored to the space and astronomy community.

---

## Features

### Core Platform
- Adaptive bitrate video streaming (HLS) with 4K, 1080p, 720p, and 480p renditions
- Video upload with direct-to-S3 presigned URL flow
- Automated video transcoding via AWS MediaConvert
- CloudFront CDN delivery for low-latency global streaming

### User Experience
- JWT-based authentication with refresh token rotation (7-day access / 30-day refresh)
- Role-based access control: `viewer`, `creator`, `admin`
- Google OAuth sign-in support
- Subscription tiers: Free, Premium, Institutional (Stripe-powered)
- User profiles, watch history, saved videos, and social following

### Unique Space Features
- Interactive 3D sky map using Three.js and real-time NASA ephemeris data
- Live space mission tracking with WebSocket telemetry updates
- ISS tracker and rocket launch countdowns

### Community & Education
- Forum threads with real-time chat (Socket.io + Redis Pub/Sub)
- Learning paths, course modules, quizzes, and progress tracking
- News feed for space and astronomy updates

### Creator Tools
- Creator dashboard with upload management
- Video processing status updates in real time
- Analytics: views, watch time, engagement, and revenue tracking
- D3.js-powered charts for audience insights

### Watch Parties
- Synchronized video playback with real-time chat
- Invite-based watch party rooms

### Admin Dashboard
- User and content management
- System analytics and moderation tools

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| **State Management** | Zustand, TanStack Query |
| **Data Fetching** | Apollo Client (GraphQL) |
| **3D & Visualization** | Three.js, @react-three/fiber, D3.js |
| **Video Player** | Video.js with HLS.js |
| **Backend API** | Node.js 20, Express, Apollo Server (GraphQL) |
| **Real-time** | Socket.io, Redis Pub/Sub |
| **Databases** | PostgreSQL 15, Redis 7, Elasticsearch 8 |
| **Queue** | Bull (Redis-backed job queue) |
| **Video Processing** | AWS MediaConvert, AWS S3, AWS CloudFront |
| **Payments** | Stripe |
| **Emails** | SendGrid / Nodemailer |
| **External APIs** | NASA Ephemeris API, YouTube Data API |
| **Infrastructure** | Docker, AWS EKS (Kubernetes), Terraform |
| **Monitoring** | Prometheus, Grafana, CloudWatch, Sentry |
| **CI/CD** | GitHub Actions |
| **Build System** | Turborepo |

---

## Architecture

CosmoStream follows a microservices architecture. All services are managed in a single Turborepo monorepo.

```
Client (Browser)
     │
     ├── GraphQL (Apollo Client) ────────► GraphQL API (port 4000)
     │                                          │
     ├── WebSocket (Socket.io) ──────────► Realtime Server (port 4001)
     │                                          │
     └── Video (HLS) ────────────────────► CloudFront CDN
                                               │
                       PostgreSQL ◄────────────┤
                       Redis      ◄────────────┤
                       Elasticsearch ◄─────────┘
                                               │
                                    Media Processor (port 4002)
                                    (Bull queue → AWS MediaConvert)
```

### Service Responsibilities

**GraphQL API** — Core business logic: authentication, users, videos, forums, courses, subscriptions, news, analytics, YouTube sync, and admin operations.

**Web App** — Next.js 14 frontend with Server Components by default, client-side interactivity where required, and hybrid rendering.

**Media Processor** — Listens to Bull queue jobs backed by Redis. Processes video uploads through AWS MediaConvert to generate multi-resolution HLS manifests and thumbnails.

**Realtime Server** — Manages Socket.io connections authenticated by JWT. Broadcasts events over Redis Pub/Sub for horizontal scaling across channels:
- `thread:{id}` — Forum thread real-time chat
- `mission:{id}` — Live mission telemetry
- `video:{id}` — Video processing status
- `watch:{id}` — Watch party synchronization

---

## Project Structure

```
cosmostream/
├── apps/
│   ├── web/                    # Next.js 14 frontend (port 3000)
│   │   └── src/
│   │       ├── app/            # App Router pages
│   │       └── components/     # Shared UI components
│   ├── api/                    # GraphQL API (port 4000)
│   │   └── src/
│   │       ├── graphql/
│   │       │   ├── schema.ts
│   │       │   └── resolvers/  # auth, user, video, forum, course, ...
│   │       ├── db/             # Database client
│   │       ├── services/       # Business logic services
│   │       ├── middleware/     # Auth and rate limiting
│   │       ├── context.ts      # Apollo context (user auth)
│   │       └── index.ts        # Entry point
│   ├── media-processor/        # Video transcoding service (port 4002)
│   └── realtime/               # Socket.io WebSocket server (port 4001)
├── packages/
│   ├── shared/                 # Shared TypeScript types and utilities
│   ├── ui/                     # Shared component library
│   └── config/                 # Shared ESLint, TSConfig, etc.
├── database/
│   ├── schema.sql              # PostgreSQL schema
│   ├── migrations/             # Database migrations
│   └── seeds/
│       └── dev_data.sql        # Development seed data
├── docs/                       # Architecture and guide documentation
├── deployment/                 # EC2 deployment scripts and configs
├── infrastructure/             # Terraform IaC (AWS EKS)
├── kubernetes/                 # Kubernetes manifests
├── scripts/                    # Utility scripts
├── docker-compose.yml
├── turbo.json
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **npm** 10+
- **Docker** & Docker Compose
- **AWS CLI** configured (for media processing and S3)
- PostgreSQL 15+ is provided via Docker

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/cosmostream.git
cd cosmostream

# 2. Install all monorepo dependencies
npm install

# 3. Start infrastructure services (PostgreSQL, Redis, Elasticsearch)
docker-compose up -d postgres redis elasticsearch

# 4. Start all development servers
npm run dev
```

Services will be available at:
- **Frontend:** http://localhost:3000
- **GraphQL API:** http://localhost:4000/graphql
- **Realtime:** ws://localhost:4001
- **Media Processor:** http://localhost:4002

---

## Environment Variables

Create `.env` files in the relevant app directories.

### API (`apps/api/.env`)

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cosmostream

# Cache & Queue
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-super-secret-jwt-key

# Search
ELASTICSEARCH_NODE=http://localhost:9200

# AWS
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=cosmostream-videos
CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net
MEDIACONVERT_ENDPOINT=https://your-endpoint.mediaconvert.region.amazonaws.com

# Payments
STRIPE_SECRET_KEY=sk_test_...

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email
SENDGRID_API_KEY=SG....

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Web (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:4001
NEXT_PUBLIC_CLOUDFRONT_URL=https://your-cloudfront-domain.cloudfront.net
```

---

## Development Commands

### Monorepo (root)

```bash
npm run dev          # Start all services in development mode
npm run build        # Build all apps for production
npm run test         # Run all tests across the monorepo
npm run lint         # Lint all code
npm run format       # Format all code with Prettier
npm run clean        # Remove all build artifacts and node_modules
```

### Individual Apps

```bash
# Run only a specific app
npm run dev --filter=web
npm run dev --filter=api

# Tests in a specific app
cd apps/api && npm test
cd apps/web && npm test
```

### Database Operations (via Makefile)

```bash
make db-migrate      # Run pending migrations
make db-seed         # Seed database with development data
make db-reset        # Drop and recreate the database
make db-backup       # Backup the database
make db-shell        # Open a PostgreSQL shell
make redis-shell     # Open a Redis CLI
```

### Docker Management

```bash
make docker-up       # Start all Docker services
make docker-down     # Stop all Docker services
make docker-logs     # Tail all Docker service logs
make logs-api        # Tail API service logs
make logs-web        # Tail web service logs
```

### Kubernetes & Terraform

```bash
make terraform-init   # Initialize Terraform
make terraform-plan   # Preview infrastructure changes
make terraform-apply  # Apply infrastructure changes

make k8s-apply        # Apply Kubernetes manifests
make k8s-logs         # View Kubernetes pod logs
```

---

## Application Routes

### Public Pages

| Route | Description |
|---|---|
| `/` | Homepage / landing |
| `/browse` | Browse and search all videos |
| `/video/[id]` | Video watch page |
| `/discover` | Discover trending content |
| `/categories` | Browse by category |
| `/category/[slug]` | Category-specific video listings |
| `/news` | Space and astronomy news feed |
| `/missions` | Live space mission tracking |
| `/sky-map` | Interactive 3D star map |
| `/forums` | Community forum listing |
| `/forums/[id]` | Forum thread detail with live chat |
| `/about` | About CosmoStream |

### Authentication

| Route | Description |
|---|---|
| `/login` | Sign in |
| `/signup` | Create account |
| `/forgot-password` | Password reset request |
| `/reset-password` | Password reset form |
| `/onboarding` | New user onboarding flow |

### User

| Route | Description |
|---|---|
| `/profile` | My profile |
| `/profile/[userId]` | Public user profile |
| `/settings` | Account settings |
| `/dashboard` | User dashboard |
| `/analytics` | Creator analytics |

### Creator

| Route | Description |
|---|---|
| `/upload` | Video upload interface |
| `/create` | Create new content |
| `/content` | Manage uploaded content |

### Admin

| Route | Description |
|---|---|
| `/admin` | Admin dashboard |

---

## GraphQL API

The API is built with Apollo Server and organized by domain. Each domain has its own resolver file.

### Resolvers

| Resolver | Description |
|---|---|
| `auth.ts` | Login, signup, refresh tokens, Google OAuth |
| `user.ts` | User CRUD, profile, follow/unfollow |
| `video.ts` | Video CRUD, search, upload URL generation |
| `video-analytics.ts` | View counts, watch time, engagement metrics |
| `forum.ts` | Forum threads, posts, likes |
| `course.ts` | Learning paths, modules, quizzes, progress |
| `subscription.ts` | Stripe subscriptions and plans |
| `news.ts` | Space news articles |
| `analytics.ts` | Platform-wide analytics |
| `youtube.ts` | YouTube content sync and import |
| `admin.ts` | Admin user and content management |
| `content.ts` | Content moderation |

### Adding a New Resolver

1. Define types in `apps/api/src/graphql/schema.ts`
2. Create resolver file in `apps/api/src/graphql/resolvers/`
3. Import and merge in `apps/api/src/graphql/resolvers/index.ts`
4. Use `context.db` for database access
5. Use `context.user` for the authenticated user

---

## Database

PostgreSQL 15 is the primary database. Schema is in `database/schema.sql`.

### Key Tables

| Table | Description |
|---|---|
| `users` | Accounts with role-based permissions (`viewer`, `creator`, `admin`) |
| `videos` | Video metadata, processing status, HLS manifest URLs |
| `threads` | Forum thread entries |
| `posts` | Forum replies |
| `courses` | Educational course definitions |
| `course_modules` | Individual course modules and lessons |
| `subscriptions` | User subscription tier and Stripe data |

### Video Upload Flow

```
1. Client requests presigned S3 URL from GraphQL API
2. Client uploads video file directly to S3
3. S3 event triggers SNS notification
4. Media Processor picks up job from Redis/Bull queue
5. AWS MediaConvert generates HLS renditions (4K, 1080p, 720p, 480p)
6. Thumbnails extracted and uploaded to S3
7. Database updated with video metadata and HLS manifest URL
8. Realtime server broadcasts processing status to client
```

---

## Deployment

CosmoStream is deployed on AWS infrastructure.

### Production Stack

- **Compute:** AWS EKS (Kubernetes) or EC2 with PM2
- **Database:** RDS PostgreSQL or self-hosted
- **Cache:** ElastiCache Redis or self-hosted
- **Search:** Elasticsearch on EC2
- **Video:** S3 + MediaConvert + CloudFront CDN
- **Region:** Mumbai (`ap-south-1`) for Indian users

### Quick EC2 Deployment

```bash
# On the EC2 instance
chmod +x deploy-to-ec2.sh
./deploy-to-ec2.sh
```

See [`deployment/DEPLOYMENT_GUIDE.md`](./deployment/DEPLOYMENT_GUIDE.md) and [`EC2_DEPLOYMENT_GUIDE.md`](./EC2_DEPLOYMENT_GUIDE.md) for detailed instructions.

### Kubernetes Deployment

```bash
make k8s-apply
```

Manifests are in `kubernetes/`. Terraform configuration for provisioning the EKS cluster is in `infrastructure/terraform/`.

---

## Testing

```bash
# Run all tests
npm test

# Run tests in specific app
cd apps/api && npm test
cd apps/web && npm test
```

### Strategy

- **Unit Tests:** Jest for business logic and utilities
- **Integration Tests:** GraphQL resolvers tested against a test database
- **Coverage Target:** 80%+
- External dependencies (AWS, Stripe, email) are mocked

---

## Contributing

We welcome contributions! Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the full guide.

### Quick Start

```bash
# Fork and clone
git clone https://github.com/your-username/cosmostream.git
cd cosmostream
npm install

# Create a feature branch
git checkout -b feat/your-feature-name

# Make changes, then commit using Conventional Commits
git commit -m "feat(api): add live mission telemetry endpoint"

# Push and open a Pull Request
git push origin feat/your-feature-name
```

### Commit Convention

```
feat(scope): description     # New feature
fix(scope): description      # Bug fix
docs: description            # Documentation
refactor(scope): description # Refactoring
test: description            # Tests
chore: description           # Maintenance
```

### Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Files | kebab-case | `video-player.tsx` |
| Components | PascalCase | `VideoPlayer` |
| Functions | camelCase | `calculateDistance` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |

---

## License

Proprietary — All rights reserved.
