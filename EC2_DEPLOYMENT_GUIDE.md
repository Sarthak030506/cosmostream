# CosmoStream Backend Deployment Guide - AWS EC2

Complete guide to deploy the CosmoStream GraphQL API backend to AWS EC2.

## Prerequisites

- AWS Account with EC2 access
- Your AWS credentials (already have for S3)
- Domain name (optional but recommended)

---

## Part 1: Launch EC2 Instance

### Step 1: Go to EC2 Console
1. Log into AWS Console: https://console.aws.amazon.com/ec2
2. Click **"Launch Instance"**

### Step 2: Configure Instance

**Name:** `cosmostream-api`

**AMI:** Ubuntu Server 22.04 LTS (Free tier eligible)

**Instance Type:**
- Development: `t2.micro` (Free tier - 1 GB RAM)
- Production: `t3.small` or `t3.medium` (Recommended)

**Key Pair:**
- Create new key pair
- Name: `cosmostream-key`
- Type: RSA
- Format: `.pem` (for SSH)
- **Download and save it safely!**

**Network Settings:**
- Click "Edit"
- Auto-assign public IP: **Enable**
- Create new security group: `cosmostream-api-sg`

**Firewall Rules (Security Group):**
```
Type            Protocol    Port Range    Source
SSH             TCP         22            My IP (or 0.0.0.0/0)
Custom TCP      TCP         4000          0.0.0.0/0  (GraphQL API)
Custom TCP      TCP         4001          0.0.0.0/0  (WebSocket)
HTTP            TCP         80            0.0.0.0/0  (Optional - for Nginx)
HTTPS           TCP         443           0.0.0.0/0  (Optional - for SSL)
```

**Storage:** 20 GB gp3 (minimum)

**Click "Launch Instance"**

---

## Part 2: Connect to EC2

### Windows (using PowerShell or Command Prompt):

```bash
# Move your key file to a safe location
mv C:\Users\hp\Downloads\cosmostream-key.pem C:\Users\hp\.ssh\

# Connect to EC2 (replace with your instance IP)
ssh -i "C:\Users\hp\.ssh\cosmostream-key.pem" ubuntu@<YOUR-EC2-PUBLIC-IP>
```

---

## Part 3: Install Dependencies on EC2

Once connected to your EC2 instance:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x
npm --version

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Start services
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Install Git
sudo apt install -y git

# Create logs directory
mkdir -p /home/ubuntu/logs
```

---

## Part 4: Setup PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside PostgreSQL:
CREATE DATABASE cosmostream;
CREATE USER cosmostream_user WITH PASSWORD 'your-secure-password-here';
GRANT ALL PRIVILEGES ON DATABASE cosmostream TO cosmostream_user;
\q

# Test connection
psql -U cosmostream_user -d cosmostream -h localhost

# Run migrations (we'll do this after cloning the repo)
```

---

## Part 5: Clone and Setup Application

```bash
# Clone your repository
cd /home/ubuntu
git clone https://github.com/Sarthak030506/cosmostream.git
cd cosmostream

# Install dependencies
npm install

# Go to API directory
cd apps/api

# Install API dependencies
npm install
```

---

## Part 6: Configure Environment Variables

```bash
# Create production .env file
nano .env

# Paste the following (update with your actual values):
```

```env
# Server
PORT=4000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://cosmostream_user:your-secure-password-here@localhost:5432/cosmostream
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key-production-change-this
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-production-change-this
JWT_REFRESH_EXPIRES_IN=30d

# AWS (Your existing credentials)
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=cosmostream-videos-prod
AWS_S3_UPLOAD_BUCKET=cosmostream-videos-prod

# Leave MediaConvert empty for S3-only mode
AWS_MEDIACONVERT_ENDPOINT=
AWS_MEDIACONVERT_ROLE=

# CORS (Your Vercel frontend URL)
CORS_ORIGIN=https://your-app.vercel.app

# Optional - Stripe, Email, etc.
STRIPE_SECRET_KEY=
YOUTUBE_API_KEY=
```

**Save:** Press `Ctrl+O`, `Enter`, then `Ctrl+X`

---

## Part 7: Run Database Migrations

```bash
# Still in /home/ubuntu/cosmostream/apps/api

# Run migrations SQL file
psql -U cosmostream_user -d cosmostream -h localhost -f ../../database/schema.sql

# Optional: Seed with test data
psql -U cosmostream_user -d cosmostream -h localhost -f ../../database/seeds/dev_data.sql
```

---

## Part 8: Start Application with PM2

```bash
# Still in /home/ubuntu/cosmostream/apps/api

# Start with PM2
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs cosmostream-api

# Save PM2 process list
pm2 save

# Setup PM2 to start on system reboot
pm2 startup
# Copy and run the command it shows

# Monitor
pm2 monit
```

---

## Part 9: Test Your API

From your local machine:

```bash
# Test GraphQL endpoint (replace with your EC2 public IP)
curl http://<YOUR-EC2-IP>:4000/graphql -H "Content-Type: application/json" -d '{"query": "{ __typename }"}'

# Should return: {"data":{"__typename":"Query"}}
```

Or visit in browser: `http://<YOUR-EC2-IP>:4000/graphql`

---

## Part 10: (Optional) Setup Nginx + SSL

For production, use Nginx as reverse proxy and add SSL:

```bash
# Install Nginx
sudo apt install -y nginx certbot python3-certbot-nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/cosmostream

# Add:
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # Replace with your domain

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /graphql {
        proxy_pass http://localhost:4000/graphql;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/cosmostream /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Get SSL certificate (if you have a domain)
sudo certbot --nginx -d api.yourdomain.com
```

---

## Common PM2 Commands

```bash
# Restart app
pm2 restart cosmostream-api

# Stop app
pm2 stop cosmostream-api

# Delete app from PM2
pm2 delete cosmostream-api

# View logs
pm2 logs cosmostream-api

# View logs with filter
pm2 logs cosmostream-api --err  # Error logs only

# Monitor CPU/Memory
pm2 monit

# Show app info
pm2 describe cosmostream-api
```

---

## Updating Your Application

```bash
# SSH into EC2
ssh -i "C:\Users\hp\.ssh\cosmostream-key.pem" ubuntu@<YOUR-EC2-IP>

# Pull latest code
cd /home/ubuntu/cosmostream
git pull origin main

# Install new dependencies (if any)
npm install
cd apps/api
npm install

# Restart application
pm2 restart cosmostream-api
```

---

## Troubleshooting

### Check if services are running:
```bash
sudo systemctl status postgresql
sudo systemctl status redis-server
pm2 status
```

### Check logs:
```bash
pm2 logs cosmostream-api
tail -f /home/ubuntu/logs/api-error.log
tail -f /home/ubuntu/logs/api-out.log
```

### Database connection issues:
```bash
# Check PostgreSQL is listening
sudo netstat -plunt | grep postgres

# Test connection
psql -U cosmostream_user -d cosmostream -h localhost
```

### Port already in use:
```bash
# Find process using port 4000
sudo lsof -i :4000

# Kill it
sudo kill -9 <PID>
```

### Application won't start:
```bash
# Check environment variables
cd /home/ubuntu/cosmostream/apps/api
cat .env

# Try running directly (for debugging)
npm run dev
```

---

## Your API Endpoints

Once deployed, your backend will be available at:

- **GraphQL API:** `http://<YOUR-EC2-IP>:4000/graphql`
- **WebSocket:** `ws://<YOUR-EC2-IP>:4001`
- **Health Check:** `http://<YOUR-EC2-IP>:4000/health` (if implemented)

**With Nginx + Domain:**
- **GraphQL API:** `https://api.yourdomain.com/graphql`
- **WebSocket:** `wss://api.yourdomain.com`

---

## Security Checklist

- [ ] Changed all default passwords
- [ ] Updated JWT secrets
- [ ] Configured firewall (security groups)
- [ ] Enabled automatic security updates
- [ ] Backed up database regularly
- [ ] Set up monitoring (CloudWatch)
- [ ] Enabled SSL/HTTPS (if using domain)
- [ ] Restricted SSH access to your IP only

---

## Next Steps

1. Note your EC2 Public IP: `<YOUR-EC2-IP>`
2. Your backend URL will be: `http://<YOUR-EC2-IP>:4000/graphql`
3. Use this URL when deploying frontend to Vercel

---

## Need Help?

- **EC2 Instance not accessible:** Check security groups, ensure port 4000 is open
- **Database errors:** Verify DATABASE_URL in .env
- **PM2 won't start:** Check logs with `pm2 logs`
- **Out of memory:** Consider upgrading to t3.small or larger instance

Good luck with your deployment! 🚀
