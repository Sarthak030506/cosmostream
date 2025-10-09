# CosmoStream Architecture

## System Overview

CosmoStream is built as a modern microservices architecture deployed on AWS EKS with a React frontend, GraphQL API gateway, and specialized backend services.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Next.js Web App  │  Mobile App (Future)  │  Smart TV (Future) │
└─────────────┬───────────────────────────────────────────────────┘
              │
         CloudFront CDN
              │
┌─────────────┴───────────────────────────────────────────────────┐
│                      API Gateway / Load Balancer                 │
└─────────────┬───────────────────────────────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───▼────┐        ┌─────▼──────┐
│GraphQL │        │ WebSocket  │
│  API   │        │  Server    │
└───┬────┘        └─────┬──────┘
    │                   │
    ├───────┬───────────┼──────────┬─────────────┐
    │       │           │          │             │
┌───▼──┐ ┌──▼───┐   ┌──▼────┐  ┌──▼───┐    ┌───▼────┐
│Video │ │Media │   │Redis  │  │Elastic│    │  S3    │
│ DB   │ │Proc. │   │Cache  │  │search │    │Buckets │
│(RDS) │ │Queue │   └───────┘  └───────┘    └────────┘
└──────┘ └──────┘
```

## Core Services

### 1. Web Application (`apps/web`)

**Technology**: Next.js 14, React 18, TypeScript, Tailwind CSS

**Responsibilities**:
- Server-side rendering for SEO
- Client-side routing
- Video player integration
- Interactive visualizations (Three.js, D3.js)
- Real-time chat UI
- State management (Zustand)

**Key Features**:
- Adaptive HLS video streaming
- Interactive sky maps with NASA API integration
- Forum and Q&A interface
- Course player with progress tracking
- Subscription management

### 2. GraphQL API (`apps/api`)

**Technology**: Node.js 20, Apollo Server, Express, PostgreSQL

**Responsibilities**:
- Data fetching and mutations
- Authentication (JWT + OAuth2)
- Authorization (RBAC)
- Business logic
- Rate limiting
- Input validation

**Key Endpoints**:
- User management (signup, login, profile)
- Video CRUD operations
- Forum threads and posts
- Course management
- Subscription handling

### 3. Media Processor (`apps/media-processor`)

**Technology**: Node.js, Bull Queue, AWS MediaConvert

**Responsibilities**:
- Video transcoding to multiple resolutions
- HLS manifest generation
- Thumbnail extraction
- Metadata extraction
- Job queue management

**Processing Pipeline**:
1. Upload to S3 triggers SNS notification
2. Job added to Redis queue
3. MediaConvert job created
4. Multiple renditions generated (4K, 1080p, 720p, 480p)
5. HLS manifest created
6. Thumbnails generated
7. Database updated with video metadata

### 4. Realtime Service (`apps/realtime`)

**Technology**: Socket.io, Redis Pub/Sub

**Responsibilities**:
- WebSocket connection management
- Live chat for forums and missions
- Video processing status updates
- Watch party synchronization
- Mission telemetry broadcasting

**Channels**:
- `thread:{id}` - Forum thread chat
- `mission:{id}` - Live mission updates
- `video:{id}` - Processing status
- `watch:{id}` - Watch party sync

## Data Layer

### PostgreSQL (RDS)

**Schema**:
- `users` - User accounts
- `videos` - Video metadata
- `threads` & `posts` - Forum data
- `courses` & `course_modules` - Educational content
- `subscriptions` - User subscriptions

**Optimization**:
- Indexed on frequently queried columns
- Connection pooling
- Read replicas for analytics

### Redis (ElastiCache)

**Usage**:
- Session storage
- API response caching
- Rate limiting counters
- Job queue (Bull)
- WebSocket session management

**Cache Strategy**:
- Cache-aside pattern
- TTL-based expiration
- Cache warming for popular content

### Elasticsearch

**Usage**:
- Full-text search for videos
- Creator search
- Forum search
- Auto-suggest
- Analytics aggregations

**Indexing**:
- Real-time indexing via queue
- Bulk indexing for existing data
- Synonym support

## Infrastructure

### AWS Services

- **EKS** - Kubernetes cluster for container orchestration
- **RDS PostgreSQL** - Primary database (Multi-AZ)
- **ElastiCache Redis** - Caching and queues
- **S3** - Video storage, uploads, thumbnails
- **CloudFront** - CDN for video delivery
- **MediaConvert** - Video transcoding
- **Route 53** - DNS management
- **ACM** - SSL certificates
- **Secrets Manager** - Credentials storage
- **CloudWatch** - Logging and metrics
- **ECR** - Docker image registry

### Kubernetes Architecture

**Namespaces**:
- `production` - Prod environment
- `staging` - Staging environment
- `monitoring` - Prometheus & Grafana

**Deployments**:
- API: 3+ replicas with HPA
- Web: 3+ replicas with HPA
- Media Processor: 2 replicas
- Realtime: 2 replicas

**Services**:
- LoadBalancer for public-facing services
- ClusterIP for internal services

## Security

### Authentication Flow

1. User submits credentials
2. API validates against database
3. JWT token generated (7 day expiry)
4. Refresh token generated (30 day expiry)
5. Tokens returned to client
6. Client includes token in Authorization header
7. API middleware validates token
8. User context attached to request

### Authorization

Role-based access control (RBAC):
- `viewer` - Watch videos, access forums
- `creator` - Upload videos, create courses
- `admin` - Full access, moderation

### Data Protection

- TLS in transit (HTTPS/WSS)
- Encryption at rest (S3, RDS)
- Secrets in AWS Secrets Manager
- WAF rules on CloudFront
- VPC security groups

## Scalability

### Horizontal Scaling

- **API**: Auto-scales based on CPU (70%) and memory (80%)
- **Web**: Auto-scales based on request rate
- **Media Processor**: Scales based on queue depth
- **Database**: Read replicas for query offloading

### Vertical Scaling

- RDS instance size adjustable via Terraform
- EKS node groups can use larger instances

### Performance Optimizations

- CDN caching (CloudFront)
- Redis caching for API responses
- Database query optimization
- Connection pooling
- Lazy loading on frontend
- Image optimization (Next.js)

## Monitoring & Observability

### Metrics (Prometheus)

- Request rate and latency
- Error rates
- Database connections
- Queue depth
- Memory and CPU usage

### Logs (CloudWatch)

- Structured JSON logs
- Log aggregation by service
- Error tracking with Sentry

### Dashboards (Grafana)

- Service health overview
- API performance
- Video processing metrics
- User engagement

### Alerting

- PagerDuty for critical alerts
- Slack notifications for warnings
- Email for daily summaries

## Disaster Recovery

### Backups

- RDS automated backups (7-day retention)
- S3 versioning enabled
- Database snapshots before deployments

### Recovery Procedures

- RDS point-in-time recovery
- S3 object restoration
- Kubernetes rolling rollback
- Terraform state recovery

### High Availability

- Multi-AZ RDS deployment
- EKS nodes across 3 AZs
- CloudFront global distribution
- Automatic failover for RDS

## Future Enhancements

### Phase 2
- Mobile apps (React Native)
- AR/VR support for sky maps
- Machine learning recommendations
- Live streaming capability

### Phase 3
- Multi-region deployment
- Edge computing with Lambda@Edge
- Real-time collaboration tools
- Advanced analytics dashboard

## Technology Decisions

### Why Next.js?
- SEO requirements for content discovery
- Excellent developer experience
- Built-in optimizations
- Strong TypeScript support

### Why GraphQL?
- Flexible data fetching
- Strong typing with TypeScript
- Efficient network usage
- Great tooling (Apollo)

### Why PostgreSQL?
- ACID compliance for transactions
- JSON support for flexible schemas
- Excellent performance
- Strong ecosystem

### Why Kubernetes?
- Industry standard for orchestration
- Auto-scaling capabilities
- Self-healing
- Declarative configuration

## Performance Targets

- **Page Load**: <2s (LCP)
- **Video Start**: <3s (TTFB)
- **API Response**: p95 <500ms
- **Uptime**: 99.9% SLA
- **Concurrent Users**: 100k+
- **Video Streams**: 10k concurrent
