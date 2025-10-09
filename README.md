# CosmoStream

A niche video streaming platform for space, astronomy, and astrophysics content.

## Features

- High-quality video streaming with adaptive bitrate (HLS)
- Interactive sky visualizations with real-time ephemeris data
- Community forums and Q&A
- Live mission tracking with WebSocket updates
- Educational tools: learning paths, quizzes, progress tracking
- Creator dashboard with analytics
- Subscription tiers (Free, Premium, Institutional)

## Technology Stack

**Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS

**Backend:** Node.js 20, Express, GraphQL (Apollo Server)

**Database:** PostgreSQL, Redis, Elasticsearch

**Video:** AWS MediaConvert, CloudFront CDN, HLS streaming

**Infrastructure:** Docker, Kubernetes (EKS), Terraform

**Monitoring:** Prometheus, Grafana, Sentry

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- AWS CLI configured
- PostgreSQL 15+

### Installation

```bash
# Install dependencies
npm install

# Start development environment
docker-compose up -d
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
STRIPE_SECRET_KEY=...
```

## Project Structure

```
cosmostream/
├── apps/
│   ├── web/              # Next.js frontend
│   ├── api/              # GraphQL API
│   ├── media-processor/  # Video ingestion service
│   └── realtime/         # WebSocket server
├── packages/
│   ├── shared/           # Shared TypeScript types
│   ├── ui/               # Component library
│   └── config/           # Shared configurations
├── infrastructure/       # Terraform IaC
└── .github/              # CI/CD workflows
```

## Development

```bash
# Run all services
npm run dev

# Run specific app
npm run dev --filter=web
npm run dev --filter=api

# Build for production
npm run build

# Run tests
npm run test

# Lint and format
npm run lint
npm run format
```

## Deployment

See [deployment documentation](./docs/deployment.md) for AWS infrastructure setup.

## License

Proprietary
