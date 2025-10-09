# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CosmoStream is a niche video streaming platform for space, astronomy, and astrophysics content built as a microservices architecture using a Turborepo monorepo structure.

**Tech Stack:** Next.js 14, Node.js 20, GraphQL (Apollo Server), PostgreSQL, Redis, Elasticsearch, TypeScript, Tailwind CSS

## Development Commands

### Starting the Development Environment

```bash
# Install all dependencies
npm install

# Start all services with Docker (PostgreSQL, Redis, Elasticsearch)
docker-compose up -d

# Run all services in development mode
npm run dev

# Run specific app only
npm run dev --filter=web
npm run dev --filter=api
```

### Testing & Quality

```bash
# Run all tests across monorepo
npm test

# Run tests in specific app
cd apps/api && npm test
cd apps/web && npm test

# Lint all code
npm run lint

# Format code with Prettier
npm run format

# Type check (build without running)
npm run build
```

### Database Operations (via Makefile)

```bash
# Run migrations
make db-migrate

# Seed database with test data
make db-seed

# Reset database completely
make db-reset

# Backup database
make db-backup

# Access database shell
make db-shell

# Access Redis CLI
make redis-shell
```

### Docker Management

```bash
# Start services
make docker-up

# Stop services
make docker-down

# View logs
make docker-logs

# View specific service logs
make logs-api
make logs-web
```

## Architecture

### Monorepo Structure

**Apps** (located in `apps/`):
- `web/` - Next.js 14 frontend (port 3000)
- `api/` - GraphQL API with Apollo Server (port 4000)
- `media-processor/` - Video transcoding service using AWS MediaConvert and Bull queue (port 4002)
- `realtime/` - Socket.io WebSocket server for live features (port 4001)

**Packages** (located in `packages/`):
- `shared/` - Shared TypeScript types and utilities
- `ui/` - Component library
- `config/` - Shared configurations

### Data Flow & Service Communication

1. **Web App** → GraphQL API (Apollo Client) → PostgreSQL/Redis/Elasticsearch
2. **Web App** ↔ Realtime Server (Socket.io) → Redis Pub/Sub
3. **Media Processor** processes video upload jobs via Bull queue backed by Redis

### Key Services & Responsibilities

**GraphQL API (`apps/api`)**:
- Authentication: JWT tokens with 7-day expiry, refresh tokens with 30-day expiry
- Authorization: Role-based access control (viewer, creator, admin)
- Rate limiting via express-rate-limit
- Resolvers organized by domain: auth, user, video, forum, course, subscription
- Entry point: `src/index.ts`
- Context creation: `src/context.ts` (includes user authentication context)

**Web App (`apps/web`)**:
- Next.js 14 with App Router
- State management: Zustand
- Data fetching: Apollo Client + TanStack Query
- Video player: Video.js with HLS support
- 3D visualizations: Three.js via @react-three/fiber
- Charts: D3.js
- Real-time: Socket.io client
- Styling: Tailwind CSS with custom theme (dark mode default)

**Media Processor (`apps/media-processor`)**:
- Processes video uploads using AWS MediaConvert
- Generates multiple renditions: 4K, 1080p, 720p, 480p
- Creates HLS manifests for adaptive streaming
- Extracts thumbnails
- Queue-based processing with Bull (Redis-backed)

**Realtime Server (`apps/realtime`)**:
- WebSocket channels:
  - `thread:{id}` - Forum thread chat
  - `mission:{id}` - Live mission updates
  - `video:{id}` - Video processing status
  - `watch:{id}` - Watch party synchronization
- Uses Redis Pub/Sub for horizontal scaling

### External Dependencies

**AWS Services** (configured via environment variables):
- S3: Video storage, uploads, thumbnails
- MediaConvert: Video transcoding
- CloudFront: CDN for video delivery

**Third-party APIs**:
- Stripe: Subscription payments
- NASA APIs: Ephemeris data for sky maps
- SendGrid/Nodemailer: Transactional emails

## Code Standards

### Commit Message Format

Follow Conventional Commits:
- `feat(api): add video search endpoint`
- `fix(web): resolve Safari playback issue`
- `docs: update API documentation`
- `refactor(api): restructure auth middleware`
- `test: add integration tests for video upload`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Naming Conventions

- Files: kebab-case (`video-player.tsx`)
- Components: PascalCase (`VideoPlayer`)
- Functions: camelCase (`calculateDistance`)
- Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

### TypeScript

- Always use explicit types for function parameters and return values
- Use interfaces for object shapes
- Prefer `const` over `let`
- Enable strict mode (configured in tsconfig.json)

## Environment Setup

### Required Environment Variables

Create `.env.local` files in relevant apps:

**API** (`apps/api/.env`):
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cosmostream
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
ELASTICSEARCH_NODE=http://localhost:9200
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
STRIPE_SECRET_KEY=your-stripe-key
```

**Web** (`apps/web/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:4001
```

### Prerequisites

- Node.js 20+
- npm 10+
- Docker & Docker Compose
- AWS CLI configured (for media processing)
- PostgreSQL 15+ (via Docker)

## Database Schema

Key tables in PostgreSQL:
- `users` - User accounts with role-based permissions
- `videos` - Video metadata and processing status
- `threads` & `posts` - Forum discussions
- `courses` & `course_modules` - Educational content structure
- `subscriptions` - User subscription tiers (Free, Premium, Institutional)

Migrations located in: `database/schema.sql`
Seed data located in: `database/seeds/dev_data.sql`

## Testing Strategy

- **Unit Tests**: Jest for business logic and utilities
- **Integration Tests**: Test GraphQL resolvers with test database
- **Test Coverage Target**: 80%+
- Mock external dependencies (AWS, Stripe, email)

## Infrastructure & Deployment

**Production Environment**: AWS EKS (Kubernetes)

Terraform configuration: `infrastructure/terraform/`
Kubernetes manifests: `kubernetes/`

```bash
# Terraform operations
make terraform-init
make terraform-plan
make terraform-apply

# Kubernetes operations
make k8s-apply
make k8s-logs
```

**Monitoring**: Prometheus, Grafana, CloudWatch, Sentry

## Turborepo Pipeline

Defined in `turbo.json`:
- `build`: Builds with dependency chain (depends on `^build`)
- `dev`: No caching, persistent processes
- `test`: Runs after dependencies are built
- `lint`: Independent linting
- `clean`: Clears build artifacts (no cache)

## Common Patterns

### Adding a New GraphQL Resolver

1. Define types in `apps/api/src/graphql/schema.ts`
2. Create resolver file in `apps/api/src/graphql/resolvers/`
3. Import and merge in `apps/api/src/graphql/resolvers/index.ts`
4. Access database via context: `context.db`
5. Use context.user for authenticated operations

### Adding a New Page (Web)

1. Create route in `apps/web/src/app/[route]/page.tsx`
2. Use Server Components by default for SSR
3. Add `'use client'` directive only when needed (interactivity, hooks)
4. Fetch data with Apollo Client or TanStack Query
5. Use shared components from `src/components/`

### Video Upload Flow

1. Client requests presigned S3 URL from API
2. Client uploads directly to S3
3. S3 event triggers SNS notification
4. Media processor receives job in Redis queue (Bull)
5. MediaConvert job processes video into multiple renditions
6. Database updated with video metadata and HLS manifest URL
7. Realtime server broadcasts processing status updates

### WebSocket Connection

1. Client connects to realtime server with JWT token
2. Server validates token and creates Socket.io connection
3. Client subscribes to specific channels (thread, mission, etc.)
4. Events broadcast via Redis Pub/Sub for multi-instance support
