#!/bin/bash

set -e

echo "🚀 Setting up CosmoStream development environment..."

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment files
echo "⚙️  Setting up environment files..."
for app in api web media-processor realtime; do
  if [ ! -f "apps/$app/.env.local" ]; then
    cp "apps/$app/.env.example" "apps/$app/.env.local"
    echo "✅ Created apps/$app/.env.local"
  fi
done

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis elasticsearch

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if PostgreSQL is ready
until docker exec cosmostream-postgres pg_isready -U postgres > /dev/null 2>&1; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done
echo "✅ PostgreSQL is ready"

# Check if Redis is ready
until docker exec cosmostream-redis redis-cli ping > /dev/null 2>&1; do
  echo "Waiting for Redis..."
  sleep 2
done
echo "✅ Redis is ready"

# Initialize database
echo "🗄️  Initializing database..."
docker exec cosmostream-postgres psql -U postgres -c "CREATE DATABASE IF NOT EXISTS cosmostream;"
docker exec cosmostream-postgres psql -U postgres -d cosmostream -f /docker-entrypoint-initdb.d/01-schema.sql
docker exec cosmostream-postgres psql -U postgres -d cosmostream -f /docker-entrypoint-initdb.d/02-seeds.sql
echo "✅ Database initialized"

# Build shared packages
echo "🔨 Building shared packages..."
npm run build --workspace=packages/shared

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "To start the development servers, run:"
echo "  npm run dev"
echo ""
echo "Available services:"
echo "  - Frontend: http://localhost:3000"
echo "  - GraphQL API: http://localhost:4000/graphql"
echo "  - WebSocket: ws://localhost:4001"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo "  - Elasticsearch: http://localhost:9200"
echo ""
echo "Test credentials:"
echo "  Email: viewer@cosmostream.com"
echo "  Password: password123"
