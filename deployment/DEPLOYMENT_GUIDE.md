# CosmoStream Deployment Guide

Complete guide to deploy CosmoStream to AWS EC2 (API) + Vercel (Frontend)

## Table of Contents
- [Prerequisites](#prerequisites)
- [Part 1: AWS EC2 Setup](#part-1-aws-ec2-setup)
- [Part 2: Deploy Backend to EC2](#part-2-deploy-backend-to-ec2)
- [Part 3: Deploy Frontend to Vercel](#part-3-deploy-frontend-to-vercel)
- [Part 4: Testing](#part-4-testing)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### What You Need:
- ✅ AWS Account (Free Tier eligible)
- ✅ Vercel Account (Free)
- ✅ Neon PostgreSQL database (already set up)
- ✅ Upstash Redis (already set up)
- ✅ Domain name (optional but recommended)
- ✅ GitHub account

### Cost Breakdown:
- **Months 1-12**: $0 (AWS Free Tier)
- **After 12 months**: ~$10-15/month (EC2 t2.micro)
- **Neon + Upstash + Vercel**: FREE FOREVER

---

## Part 1: AWS EC2 Setup

### Step 1.1: Launch EC2 Instance

1. **Go to AWS Console**: https://console.aws.amazon.com/ec2/

2. **Click "Launch Instance"**

3. **Configure Instance**:
   - Name: `CosmoStream-API`
   - AMI: **Ubuntu Server 22.04 LTS** (Free tier eligible)
   - Instance type: **t2.micro** (Free tier eligible)
   - Key pair: Create new or use existing (DOWNLOAD AND SAVE IT!)

4. **Network Settings**:
   - Create security group with these rules:
     - SSH (22) - Your IP only
     - HTTP (80) - Anywhere (0.0.0.0/0)
     - HTTPS (443) - Anywhere (0.0.0.0/0)
     - Custom TCP (4000) - Anywhere (for GraphQL API)
     - Custom TCP (4001) - Anywhere (for WebSocket)

5. **Storage**: 8 GB gp2 (Free tier eligible)

6. **Click "Launch Instance"**

7. **Note your Public IP**: Copy the Public IPv4 address (e.g., `3.85.123.45`)

### Step 1.2: Connect to EC2

**Windows (PowerShell)**:
```powershell
ssh -i "C:\path\to\your-key.pem" ubuntu@YOUR_EC2_IP
```

**Mac/Linux**:
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### Step 1.3: Initial EC2 Setup

Once connected, run the setup script:

```bash
# Download and run setup script
wget https://raw.githubusercontent.com/YOUR_USERNAME/CosmoStream/main/deployment/setup-ec2.sh
chmod +x setup-ec2.sh
./setup-ec2.sh
```

Or manually run:
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install other tools
sudo apt-get install -y build-essential git nginx certbot python3-certbot-nginx
sudo npm install -g pm2

# Configure firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create directories
mkdir -p /home/ubuntu/logs
```

---

## Part 2: Deploy Backend to EC2

### Step 2.1: Clone Repository

```bash
cd /home/ubuntu

# Option 1: HTTPS (easier, but need token for private repos)
git clone https://github.com/YOUR_USERNAME/CosmoStream.git

# Option 2: SSH (recommended for private repos)
# First, generate SSH key and add to GitHub
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
cat ~/.ssh/id_rsa.pub  # Copy this and add to GitHub
git clone git@github.com:YOUR_USERNAME/CosmoStream.git

cd CosmoStream
```

### Step 2.2: Configure Environment

```bash
# Copy production env file
cd /home/ubuntu/CosmoStream/apps/api
cp .env.production .env

# Edit if needed (already has Neon and Upstash configured)
nano .env
```

**IMPORTANT: Update these values in .env**:
```bash
# Change JWT secrets to random secure strings!
JWT_SECRET=YOUR_RANDOM_SECRET_HERE
JWT_REFRESH_SECRET=YOUR_RANDOM_REFRESH_SECRET_HERE

# Update CORS origin (will update after Vercel deployment)
CORS_ORIGIN=https://your-app.vercel.app
```

Generate secure secrets:
```bash
# Generate random secrets
openssl rand -base64 32
```

### Step 2.3: Build and Deploy

```bash
cd /home/ubuntu/CosmoStream

# Install dependencies
npm install

# Build all apps
npm run build

# Start with PM2
pm2 start deployment/ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### Step 2.4: Configure Nginx

```bash
# Copy Nginx config
sudo cp /home/ubuntu/CosmoStream/deployment/nginx.conf /etc/nginx/sites-available/cosmostream

# Update domain name in config
sudo nano /etc/nginx/sites-available/cosmostream
# Replace "your-domain.com" with your actual domain or EC2 IP

# Enable site
sudo ln -s /etc/nginx/sites-available/cosmostream /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 2.5: Setup SSL (Optional but Recommended)

**If you have a domain**:
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

**If you don't have a domain**, you can:
1. Use HTTP only (not recommended for production)
2. Buy a domain from Namecheap ($8-15/year)
3. Use a free subdomain from services like FreeDNS

### Step 2.6: Verify API is Running

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs

# Test API
curl http://localhost:4000/health
```

Your API should now be accessible at:
- HTTP: `http://YOUR_EC2_IP/graphql`
- HTTPS: `https://your-domain.com/graphql` (if you set up SSL)

---

## Part 3: Deploy Frontend to Vercel

### Step 3.1: Prepare Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub
3. Connect your GitHub repository

### Step 3.2: Update Environment Variables

**Before deploying**, update your frontend environment:

```bash
# On your local machine
cd C:\Users\hp\Desktop\CosmoStream\apps\web

# Edit .env.production
notepad .env.production
```

Update with your EC2 URL:
```env
NEXT_PUBLIC_API_URL=https://your-domain.com/graphql
NEXT_PUBLIC_WS_URL=wss://your-domain.com:4001
NEXT_PUBLIC_NASA_API_KEY=DEMO_KEY
```

### Step 3.3: Deploy to Vercel

**Method 1: Vercel Dashboard (Easiest)**

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository
4. **Framework Preset**: Next.js
5. **Root Directory**: `apps/web`
6. **Build Command**: `cd ../.. && npm run build --filter=web`
7. **Output Directory**: `.next`
8. **Install Command**: `cd ../.. && npm install`
9. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://your-domain.com/graphql`
   - `NEXT_PUBLIC_WS_URL`: `wss://your-domain.com`
   - `NEXT_PUBLIC_NASA_API_KEY`: `DEMO_KEY`
10. Click "Deploy"

**Method 2: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd apps/web
vercel --prod
```

### Step 3.4: Update CORS on Backend

After Vercel gives you a URL (e.g., `cosmostream.vercel.app`), update CORS on EC2:

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Update API environment
cd /home/ubuntu/CosmoStream/apps/api
nano .env

# Change CORS_ORIGIN to your Vercel URL
CORS_ORIGIN=https://cosmostream.vercel.app

# Restart API
pm2 restart cosmostream-api
```

---

## Part 4: Testing

### Test Backend:

```bash
# Health check
curl https://your-domain.com/api/health

# GraphQL introspection
curl -X POST https://your-domain.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __schema { types { name } } }"}'
```

### Test Frontend:

1. Visit your Vercel URL: `https://cosmostream.vercel.app`
2. Try to sign up/login
3. Check browser console for errors
4. Verify API connection

### Test Database:

```bash
# SSH into EC2
cd /home/ubuntu/CosmoStream

# Test database connection
node apps/api/test-db-connection.js
```

---

## Useful Commands

### EC2 (via SSH):

```bash
# View PM2 status
pm2 status

# View logs
pm2 logs
pm2 logs api
pm2 logs realtime

# Restart services
pm2 restart all
pm2 restart cosmostream-api

# Stop services
pm2 stop all

# Monitor resources
pm2 monit

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Local Development:

```bash
# Update code
git pull origin main

# Rebuild
npm run build

# Redeploy
./deployment/deploy.sh
```

---

## Troubleshooting

### Issue: "Failed to fetch" in frontend

**Solution**:
1. Check if API is running: `pm2 status`
2. Verify CORS is configured correctly
3. Check browser console for exact error
4. Verify `NEXT_PUBLIC_API_URL` in Vercel environment variables

### Issue: Redis connection failed

**Solution**:
1. Verify Upstash credentials in `.env`
2. Check if TLS is enabled (should be for Upstash)
3. Test Redis connection:
   ```bash
   redis-cli -h heroic-manatee-13363.upstash.io -p 6379 -a YOUR_PASSWORD --tls
   ```

### Issue: Database connection failed

**Solution**:
1. Verify Neon connection string in `.env`
2. Check if database is accessible from EC2 IP
3. Test connection:
   ```bash
   psql "postgresql://neondb_owner:password@host/neondb?sslmode=require"
   ```

### Issue: Port already in use

**Solution**:
```bash
# Find process using port
sudo lsof -i :4000

# Kill process
sudo kill -9 PID
```

### Issue: Nginx 502 Bad Gateway

**Solution**:
1. Check if API is running: `pm2 status`
2. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify upstream servers in Nginx config
4. Test API directly: `curl http://localhost:4000/health`

### Issue: SSL Certificate error

**Solution**:
```bash
# Renew certificate
sudo certbot renew

# If renewal fails, remove and recreate
sudo certbot delete
sudo certbot --nginx -d your-domain.com
```

---

## Monitoring & Maintenance

### Setup Monitoring:

```bash
# Install PM2 monitoring (free tier)
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Regular Maintenance:

```bash
# Update system packages (monthly)
sudo apt-get update && sudo apt-get upgrade -y

# Update Node.js packages (as needed)
cd /home/ubuntu/CosmoStream
npm update

# Renew SSL certificate (auto-renewal is configured, but check)
sudo certbot renew --dry-run

# Clear old logs
pm2 flush
```

---

## Cost Optimization

### After Free Tier Expires:

1. **Use Reserved Instances**: Save 30-40% on EC2 costs
2. **Use Spot Instances**: Save up to 90% (but can be interrupted)
3. **Downgrade to t2.nano**: $4.75/month (for small traffic)
4. **Use Lightsail instead**: $3.50-5/month (simpler, fixed price)

### Scaling Up:

When your app grows:
1. Upgrade to t3.small or t3.medium
2. Add load balancer (ALB)
3. Add Auto Scaling Group
4. Use RDS instead of Neon (if needed)
5. Use ElastiCache instead of Upstash (if needed)

---

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check Vercel deployment logs
4. Create an issue on GitHub

---

## Security Checklist

- [ ] Changed default JWT secrets
- [ ] SSH key authentication only (no password)
- [ ] Security group rules configured correctly
- [ ] SSL certificate installed and auto-renewal enabled
- [ ] Database uses SSL connection
- [ ] Redis uses TLS encryption
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled
- [ ] Regular security updates installed

---

Good luck with your deployment! 🚀
