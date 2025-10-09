#!/bin/bash

set -e

echo "🚀 Setting up CosmoStream (No Docker Mode)..."

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "⚠️  PostgreSQL CLI not found. Please install PostgreSQL manually." >&2; }

echo "✅ Node.js found: $(node --version)"

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

# Update environment files for local services
echo "⚙️  Configuring for local services..."
sed -i 's|postgresql://postgres:postgres@localhost:5432/cosmostream|postgresql://postgres:postgres@localhost:5432/cosmostream|g' apps/api/.env.local
sed -i 's|redis://localhost:6379|redis://localhost:6379|g' apps/api/.env.local

echo ""
echo "🎉 Basic setup complete!"
echo ""
echo "⚠️  IMPORTANT: You need to manually install and start:"
echo "  1. PostgreSQL (https://www.postgresql.org/download/)"
echo "  2. Redis (https://redis.io/download)"
echo "  3. Elasticsearch (https://www.elastic.co/downloads/elasticsearch)"
echo ""
echo "📝 After installing services, run:"
echo "  psql -U postgres -f database/schema.sql"
echo "  psql -U postgres -d cosmostream -f database/seeds/dev_data.sql"
echo ""
echo "Then start the development servers with:"
echo "  npm run dev"
