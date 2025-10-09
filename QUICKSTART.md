# CosmoStream Quick Start Guide

## Prerequisites

### Required
- **Node.js 20+** ✅ (You have v22.16.0)
- **npm 10+** ✅

### Optional (for full stack)
- **Docker Desktop** ⚠️ (Not installed)
- **PostgreSQL 15+**
- **Redis 7+**
- **Elasticsearch 8+**

## Quick Start Options

### Option A: With Docker (Recommended)

1. **Install Docker Desktop**
   - Download: https://www.docker.com/products/docker-desktop
   - Install and restart your computer

2. **Setup and Run**
   ```bash
   npm install
   docker-compose up -d
   npm run dev
   ```

3. **Access Services**
   - Frontend: http://localhost:3000
   - GraphQL API: http://localhost:4000/graphql
   - WebSocket: ws://localhost:4001

### Option B: Frontend Only (No Docker)

If you want to start with just the frontend:

```bash
# 1. Install dependencies
npm install

# 2. Start only the frontend
cd apps/web
npm run dev
```

Access at: http://localhost:3000

**Note**: The frontend will need mock data since backend services aren't running.

### Option C: Manual Service Installation

1. **Install PostgreSQL**
   - Download: https://www.postgresql.org/download/windows/
   - Install with default settings
   - Remember your password

2. **Install Redis** (Optional)
   - Download: https://github.com/microsoftarchive/redis/releases
   - Or use WSL2: `wsl -d Ubuntu -e sudo apt install redis-server`

3. **Setup Database**
   ```bash
   # Create database
   psql -U postgres -c "CREATE DATABASE cosmostream;"

   # Run migrations
   psql -U postgres -d cosmostream -f database/schema.sql
   psql -U postgres -d cosmostream -f database/seeds/dev_data.sql
   ```

4. **Configure Environment**
   ```bash
   # Copy example files
   cp apps/api/.env.example apps/api/.env.local
   cp apps/web/.env.example apps/web/.env.local

   # Edit apps/api/.env.local with your PostgreSQL password
   ```

5. **Start Services**
   ```bash
   npm install
   npm run dev
   ```

## Current Installation Status

The npm install is currently running in the background. It may take 5-10 minutes depending on your internet connection.

## What's Being Installed?

```
📦 Installing packages for:
  - Root workspace (Turbo, TypeScript, Prettier)
  - apps/web (Next.js, React, Tailwind, Apollo Client)
  - apps/api (Apollo Server, Express, PostgreSQL client)
  - apps/media-processor (AWS SDK, Bull queue)
  - apps/realtime (Socket.io)
  - packages/shared (Zod, shared types)
```

## Next Steps After Installation

1. **Check Installation Status**
   ```bash
   npm list --depth=0
   ```

2. **Without Docker - Frontend Only**
   ```bash
   cd apps/web
   npm run dev
   ```

3. **With Docker - Full Stack**
   ```bash
   docker-compose up -d
   npm run dev
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## Troubleshooting

### npm install is slow
- This is normal for first install (300+ packages)
- Use `npm ci` for faster installs after first time

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or find and kill manually
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module not found errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Docker issues
- Ensure Docker Desktop is running
- Check Docker status: `docker ps`
- Restart Docker Desktop if needed

## Development Commands

```bash
# Install dependencies
npm install

# Start all services (requires Docker)
npm run dev

# Start specific service
npm run dev --filter=web
npm run dev --filter=api

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Build all
npm run build

# Clean install
npm run clean && npm install
```

## Using Makefile (Alternative)

```bash
# Setup everything
make install

# Start development
make dev

# Database operations
make db-migrate
make db-seed
make db-reset

# Docker operations
make docker-up
make docker-down
make docker-logs

# View logs
make logs-api
make logs-web
```

## Test Credentials

Once services are running:

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
│   ├── web/              # Next.js frontend (Port 3000)
│   ├── api/              # GraphQL API (Port 4000)
│   ├── media-processor/  # Video processing (Port 4002)
│   └── realtime/         # WebSocket (Port 4001)
├── packages/
│   └── shared/           # Shared TypeScript types
├── database/             # SQL schemas
├── infrastructure/       # Terraform (AWS)
├── kubernetes/           # K8s manifests
└── docs/                 # Documentation
```

## Getting Help

- **Documentation**: See `docs/` folder
- **Issues**: Check GitHub issues
- **Architecture**: Read `docs/ARCHITECTURE.md`
- **Contributing**: Read `CONTRIBUTING.md`

## What Works Without Docker?

✅ **Works**:
- Frontend development (with mock data)
- TypeScript compilation
- Linting and testing
- Code formatting
- Building for production

❌ **Needs Docker or Manual Install**:
- PostgreSQL database
- Redis cache
- Elasticsearch search
- Full API functionality
- Video processing
- Real-time features

## Recommended: Install Docker

For the best development experience, we strongly recommend installing Docker Desktop:

1. **Download**: https://www.docker.com/products/docker-desktop
2. **Install** and restart your computer
3. **Run**: `docker-compose up -d`
4. **Develop**: `npm run dev`

This gives you the complete stack with one command!
