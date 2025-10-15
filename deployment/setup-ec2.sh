#!/bin/bash
# Initial EC2 Setup Script for CosmoStream
# Run this script ONCE on a fresh EC2 instance

set -e  # Exit on error

echo "🛠️  Setting up AWS EC2 for CosmoStream..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Update system
print_warning "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y
print_success "System updated"

# Install Node.js 20
print_warning "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
print_success "Node.js $(node --version) installed"
print_success "npm $(npm --version) installed"

# Install build essentials
print_warning "Installing build essentials..."
sudo apt-get install -y build-essential git curl wget
print_success "Build essentials installed"

# Install PM2
print_warning "Installing PM2..."
sudo npm install -g pm2
print_success "PM2 installed"

# Install Nginx
print_warning "Installing Nginx..."
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
print_success "Nginx installed and started"

# Install Certbot for SSL
print_warning "Installing Certbot for SSL..."
sudo apt-get install -y certbot python3-certbot-nginx
print_success "Certbot installed"

# Configure firewall
print_warning "Configuring UFW firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
print_success "Firewall configured"

# Create directories
print_warning "Creating project directories..."
mkdir -p /home/ubuntu/logs
print_success "Directories created"

# Clone repository (you'll need to provide your repo URL)
print_warning "Ready to clone repository"
echo ""
echo "To clone your repository, run:"
echo "  cd /home/ubuntu"
echo "  git clone https://github.com/YOUR_USERNAME/CosmoStream.git"
echo ""

# Setup SSH key for GitHub (optional)
if [ ! -f ~/.ssh/id_rsa ]; then
    print_warning "Generating SSH key for GitHub..."
    ssh-keygen -t rsa -b 4096 -C "your-email@example.com" -f ~/.ssh/id_rsa -N ""
    print_success "SSH key generated"
    echo ""
    echo "Add this SSH key to your GitHub account:"
    cat ~/.ssh/id_rsa.pub
    echo ""
fi

print_success "✅ EC2 initial setup completed!"
echo ""
echo "Next steps:"
echo "1. Clone your repository:"
echo "   cd /home/ubuntu"
echo "   git clone YOUR_REPO_URL"
echo ""
echo "2. Copy your .env.production file to apps/api/.env.production"
echo ""
echo "3. Configure Nginx:"
echo "   sudo cp /home/ubuntu/CosmoStream/deployment/nginx.conf /etc/nginx/sites-available/cosmostream"
echo "   sudo ln -s /etc/nginx/sites-available/cosmostream /etc/nginx/sites-enabled/"
echo "   sudo rm /etc/nginx/sites-enabled/default  # Remove default site"
echo "   sudo nginx -t  # Test configuration"
echo "   sudo systemctl reload nginx"
echo ""
echo "4. Setup SSL with Let's Encrypt:"
echo "   sudo certbot --nginx -d your-domain.com -d www.your-domain.com"
echo ""
echo "5. Run deployment script:"
echo "   cd /home/ubuntu/CosmoStream"
echo "   chmod +x deployment/deploy.sh"
echo "   ./deployment/deploy.sh"
