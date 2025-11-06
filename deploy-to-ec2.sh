#!/bin/bash

# CosmoStream EC2 Deployment Script
# Run this on your EC2 instance after SSH connection

set -e  # Exit on error

echo "🚀 Starting CosmoStream Backend Deployment..."
echo "================================================"

# 1. Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install PostgreSQL
echo "📦 Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# 4. Install Redis
echo "📦 Installing Redis..."
sudo apt install -y redis-server

# 5. Install Git
echo "📦 Installing Git..."
sudo apt install -y git

# 6. Install PM2
echo "📦 Installing PM2 globally..."
sudo npm install -g pm2

# 7. Start services
echo "🔧 Starting PostgreSQL and Redis..."
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 8. Setup PostgreSQL database
echo "🗄️  Setting up PostgreSQL database..."
sudo -u postgres psql -c "CREATE DATABASE cosmostream;" 2>/dev/null || echo "Database already exists"
sudo -u postgres psql -c "CREATE USER cosmostream_user WITH PASSWORD 'CosmoSecure2024!';" 2>/dev/null || echo "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE cosmostream TO cosmostream_user;"

# 9. Create logs directory
echo "📁 Creating logs directory..."
mkdir -p /home/ubuntu/logs

# 10. Clone repository
echo "📥 Cloning CosmoStream repository..."
cd /home/ubuntu
if [ -d "cosmostream" ]; then
    echo "Repository already exists, pulling latest..."
    cd cosmostream
    git pull origin main
else
    git clone https://github.com/Sarthak030506/cosmostream.git
    cd cosmostream
fi

# 11. Install dependencies
echo "📦 Installing project dependencies..."
npm install

# 12. Install API dependencies
echo "📦 Installing API dependencies..."
cd apps/api
npm install

# 13. Create .env file
echo "⚙️  Creating .env file..."
cat > .env << 'EOF'
PORT=4000
NODE_ENV=production

DATABASE_URL=postgresql://cosmostream_user:CosmoSecure2024!@localhost:5432/cosmostream
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

REDIS_URL=redis://localhost:6379

JWT_SECRET=cosmostream-jwt-secret-production-change-this-xyz123abc
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=cosmostream-refresh-secret-change-this-def456ghi
JWT_REFRESH_EXPIRES_IN=30d

AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=AKIAVP5QRMTCNXLR4W7P
AWS_SECRET_ACCESS_KEY=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
AWS_S3_BUCKET=cosmostream-videos-prod
AWS_S3_UPLOAD_BUCKET=cosmostream-videos-prod

CORS_ORIGIN=*

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

echo "✅ .env file created"

# 14. Run database migrations
echo "🗄️  Running database migrations..."
cd /home/ubuntu/cosmostream
PGPASSWORD='CosmoSecure2024!' psql -U cosmostream_user -d cosmostream -h localhost -f database/schema.sql

# 15. Start application with PM2
echo "🚀 Starting application with PM2..."
cd /home/ubuntu/cosmostream/apps/api
pm2 delete cosmostream-api 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# 16. Setup PM2 to start on boot
echo "⚙️  Configuring PM2 startup..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo ""
echo "✅ Deployment Complete!"
echo "================================================"
echo "Your API is now running at: http://13.49.245.29:4000/graphql"
echo ""
echo "Useful commands:"
echo "  pm2 status          - Check application status"
echo "  pm2 logs            - View application logs"
echo "  pm2 restart all     - Restart application"
echo "  pm2 monit           - Monitor CPU/Memory"
echo ""
echo "🎉 CosmoStream Backend is live!"
