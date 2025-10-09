# Getting Started with CosmoStream

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/your-org/cosmostream.git
cd cosmostream
npm install
```

### 2. Start Development Environment

```bash
# Start all services with Docker
docker-compose up -d

# Or run services individually
npm run dev --filter=web      # Frontend
npm run dev --filter=api      # GraphQL API
npm run dev --filter=realtime # WebSocket server
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **GraphQL Playground**: http://localhost:4000/graphql
- **WebSocket**: ws://localhost:4001

### 4. Test Credentials

```
Email: viewer@cosmostream.com
Password: password123

Email: creator@cosmostream.com
Password: password123
```

## Project Structure

```
cosmostream/
├── apps/
│   ├── web/              # Next.js frontend
│   ├── api/              # GraphQL API
│   ├── media-processor/  # Video processing service
│   └── realtime/         # WebSocket server
├── packages/
│   ├── shared/           # Shared types & utilities
│   └── ui/               # Component library (future)
├── database/             # SQL schemas & migrations
├── infrastructure/       # Terraform IaC
├── kubernetes/           # K8s manifests
└── docs/                 # Documentation
```

## Development Workflow

### Creating a New Feature

1. **Create a branch**
   ```bash
   git checkout -b feature/sky-map-ar-mode
   ```

2. **Make changes**
   - Update GraphQL schema in `apps/api/src/graphql/schema.ts`
   - Add resolvers in `apps/api/src/graphql/resolvers/`
   - Create React components in `apps/web/src/components/`

3. **Test locally**
   ```bash
   npm run test
   npm run lint
   ```

4. **Create PR**
   ```bash
   git push origin feature/sky-map-ar-mode
   ```

### Database Changes

1. **Create migration**
   ```bash
   cd database/migrations
   # Create new file: 002_add_ar_settings.sql
   ```

2. **Apply migration**
   ```bash
   docker exec cosmostream-postgres psql -U postgres -d cosmostream -f /path/to/migration.sql
   ```

### Adding Dependencies

```bash
# Add to specific app
npm install package-name --workspace=apps/api

# Add to shared package
npm install package-name --workspace=packages/shared
```

## Common Tasks

### Run Tests

```bash
npm test                    # All tests
npm test --filter=api       # API tests only
```

### Build for Production

```bash
npm run build
```

### Format Code

```bash
npm run format
```

### View Logs

```bash
# Docker logs
docker logs cosmostream-api -f
docker logs cosmostream-web -f

# Database logs
docker logs cosmostream-postgres -f
```

### Reset Database

```bash
docker-compose down -v
docker-compose up -d postgres
```

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Test connection
docker exec cosmostream-postgres psql -U postgres -c "SELECT 1"
```

### Redis Connection Issues

```bash
# Test Redis
docker exec cosmostream-redis redis-cli ping
```

## Next Steps

- Read [Architecture Documentation](./ARCHITECTURE.md)
- Review [API Documentation](./API.md)
- Check [Deployment Guide](./DEPLOYMENT.md)
- Explore [Contributing Guidelines](../CONTRIBUTING.md)
