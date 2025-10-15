#!/bin/bash
# CosmoStream Deployment Script for AWS EC2
# Run this script on your EC2 instance after initial setup

set -e  # Exit on error

echo "🚀 Starting CosmoStream deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/ubuntu/CosmoStream"
LOG_DIR="/home/ubuntu/logs"

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as ubuntu user
if [ "$(whoami)" != "ubuntu" ]; then
    print_error "This script must be run as ubuntu user"
    exit 1
fi

# Create log directory
mkdir -p $LOG_DIR
print_success "Log directory created"

# Navigate to project directory
cd $PROJECT_DIR
print_success "Navigated to project directory"

# Pull latest code from git
print_warning "Pulling latest code from git..."
git pull origin main
print_success "Code updated"

# Install dependencies
print_warning "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Build all apps
print_warning "Building applications..."
npm run build
print_success "Build completed"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 not found, installing..."
    npm install -g pm2
    print_success "PM2 installed"
fi

# Stop existing PM2 processes
print_warning "Stopping existing processes..."
pm2 stop all || true
print_success "Processes stopped"

# Start services with PM2
print_warning "Starting services with PM2..."
pm2 start $PROJECT_DIR/deployment/ecosystem.config.js
print_success "Services started"

# Save PM2 process list
pm2 save
print_success "PM2 process list saved"

# Setup PM2 to start on boot
pm2 startup systemd -u ubuntu --hp /home/ubuntu
print_success "PM2 configured to start on boot"

# Show status
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📋 Recent logs:"
pm2 logs --lines 10 --nostream

echo ""
print_success "🎉 Deployment completed successfully!"
echo ""
echo "Useful commands:"
echo "  pm2 status           - View service status"
echo "  pm2 logs             - View all logs"
echo "  pm2 logs api         - View API logs"
echo "  pm2 restart all      - Restart all services"
echo "  pm2 stop all         - Stop all services"
echo "  pm2 monit            - Monitor services in real-time"
