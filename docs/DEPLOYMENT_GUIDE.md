# CosmoStream Deployment Guide - AWS EC2 + Free Services

## 🎯 Architecture Overview

**Total Cost: $0 for 12 months, then ~$10/month**

```
┌─────────────────────────────────────────────────────────────┐
│                     Production Architecture                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (Vercel)              FREE FOREVER ✅              │
│  ↓                                                           │
│  API Server (AWS EC2 t2.micro)  FREE 12 months ✅           │
│  ↓                                                           │
│  PostgreSQL (Neon.tech)         FREE FOREVER ✅              │
│  Redis (Upstash)                FREE FOREVER ✅              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ AWS Account (free tier eligible)
- ✅ GitHub account
- ✅ Credit card (for AWS verification - won't be charged)
- ✅ Your YouTube API key
- ✅ This codebase pushed to GitHub

---

## 🗄️ Step 1: Set Up Neon PostgreSQL (5 minutes)

### **1.1 Create Neon Account**

1. Go to: https://neon.tech
2. Click **"Sign Up"**
3. Sign up with GitHub (easiest)

### **1.2 Create Database**

1. Click **"Create Project"**
2. Project name: `cosmostream-prod`
3. Region: Choose closest to your users (e.g., US East for USA)
4. PostgreSQL version: **15** (recommended)
5. Click **"Create Project"**

### **1.3 Get Connection String**

After creation, you'll see:

```
Connection string:
postgresql://username:password@ep-xxxxx.region.aws.neon.tech/cosmostream?sslmode=require
```

**Save this!** You'll need it later.

**Example:**
```
postgresql://cosmostream_user:AbCdEf123456@ep-cool-darkness-12345.us-east-2.aws.neon.tech/cosmostream?sslmode=require
```

### **1.4 Run Database Migrations**

From your local machine, connect to Neon and run migrations:

```bash
# Set the connection string
export DATABASE_URL="postgresql://username:password@ep-xxxxx.region.aws.neon.tech/cosmostream?sslmode=require"

# Run migrations
psql $DATABASE_URL -f database/schema.sql
psql $DATABASE_URL -f database/migrations/005_youtube_integration.sql

# Seed categories (if you have seed files)
psql $DATABASE_URL -f database/seeds/categories.sql
psql $DATABASE_URL -f database/seeds/youtube_category_keywords.sql
```

**Or use the migration tool if you have one:**
```bash
npm run migrate:production
```

---

## 🔴 Step 2: Set Up Upstash Redis (3 minutes)

### **2.1 Create Upstash Account**

1. Go to: https://upstash.com
2. Click **"Sign Up"**
3. Sign up with GitHub

### **2.2 Create Redis Database**

1. Click **"Create Database"**
2. Name: `cosmostream-redis`
3. Type: **Regional** (cheaper than Global)
4. Region: Choose same as Neon (e.g., US-East-1)
5. Click **"Create"**

### **2.3 Get Connection Details**

After creation, click on your database and copy:

**REST API:**
- REST URL: `https://xxxx.upstash.io`
- REST Token: `AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ`

**Or Redis URL:**
```
redis://default:password@region.upstash.io:6379
```

**Save both!** You'll need them for the API.

---

## ☁️ Step 3: Set Up AWS EC2 (15 minutes)

### **3.1 Create AWS Account**

1. Go to: https://aws.amazon.com/free
2. Click **"Create a Free Account"**
3. Follow signup process (credit card required for verification)
4. Choose **Basic Support** (Free)

### **3.2 Launch EC2 Instance**

1. Go to AWS Console: https://console.aws.amazon.com
2. Navigate to **EC2 Dashboard**
3. Click **"Launch Instance"**

**Configure Instance:**

**Step 1: Name and Tags**
- Name: `cosmostream-api`

**Step 2: Choose AMI (Operating System)**
- Select: **Ubuntu Server 22.04 LTS (Free tier eligible)**

**Step 3: Choose Instance Type**
- Select: **t2.micro** (Free tier eligible: 1 vCPU, 1GB RAM)

**Step 4: Key Pair**
- Click **"Create new key pair"**
- Name: `cosmostream-key`
- Type: **RSA**
- Format: **.pem** (for SSH)
- Click **"Create key pair"** (downloads `cosmostream-key.pem`)
- **SAVE THIS FILE!** You need it to SSH into the server

**Step 5: Network Settings**
- Click **"Edit"**
- **Firewall (Security Groups):**
  - ✅ Allow SSH (port 22) from **My IP** (your current IP)
  - ✅ Add rule: HTTP (port 80) from **Anywhere (0.0.0.0/0)**
  - ✅ Add rule: HTTPS (port 443) from **Anywhere (0.0.0.0/0)**
  - ✅ Add rule: Custom TCP (port 4000) from **Anywhere (0.0.0.0/0)** - for API

**Step 6: Storage**
- Default: **8 GB gp3** (Free tier allows up to 30GB)
- Increase to: **20 GB** (recommended for logs and node_modules)

**Step 7: Advanced Details**
- Leave defaults

**Review and Launch:**
- Click **"Launch Instance"**
- Wait 2-3 minutes for instance to start

### **3.3 Get Public IP Address**

1. Click on your instance
2. Copy **Public IPv4 address** (e.g., `3.145.123.45`)
3. Copy **Public IPv4 DNS** (e.g., `ec2-3-145-123-45.us-east-2.compute.amazonaws.com`)

**Save these!**

---

## 🔧 Step 4: Configure EC2 Instance (10 minutes)

### **4.1 SSH into EC2**

**On Windows:**
```bash
# Move the key file to a safe location
move cosmostream-key.pem C:\Users\YourName\.ssh\

# Set proper permissions (Windows)
icacls C:\Users\YourName\.ssh\cosmostream-key.pem /inheritance:r
icacls C:\Users\YourName\.ssh\cosmostream-key.pem /grant:r "%USERNAME%:R"

# SSH into EC2 (replace IP with yours)
ssh -i C:\Users\YourName\.ssh\cosmostream-key.pem ubuntu@3.145.123.45
```

**On Mac/Linux:**
```bash
# Move the key file
mv cosmostream-key.pem ~/.ssh/

# Set proper permissions
chmod 400 ~/.ssh/cosmostream-key.pem

# SSH into EC2 (replace IP with yours)
ssh -i ~/.ssh/cosmostream-key.pem ubuntu@3.145.123.45
```

### **4.2 Install Node.js and Dependencies**

Once connected to EC2:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x

# Install PM2 (process manager to keep API running)
sudo npm install -g pm2

# Install Git
sudo apt install -y git

# Install build essentials (for native modules)
sudo apt install -y build-essential
```

### **4.3 Clone Your Repository**

```bash
# Clone your repo (replace with your GitHub URL)
git clone https://github.com/yourusername/CosmoStream.git
cd CosmoStream

# Install dependencies
npm install

# Build the API
cd apps/api
npm run build  # If you have a build step
```

### **4.4 Set Up Environment Variables**

```bash
# Create production .env file
nano apps/api/.env
```

**Add the following (replace with your actual values):**

```bash
# Node Environment
NODE_ENV=production
PORT=4000

# Database (from Neon)
DATABASE_URL=postgresql://username:password@ep-xxxxx.region.aws.neon.tech/cosmostream?sslmode=require

# Redis (from Upstash)
REDIS_URL=redis://default:password@region.upstash.io:6379

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# YouTube API
YOUTUBE_API_KEY=your-youtube-api-key-here
YOUTUBE_QUOTA_LIMIT=10000
YOUTUBE_SYNC_ENABLED=true
YOUTUBE_SYNC_CRON=0 2 * * *
YOUTUBE_SYNC_CATEGORIES_PER_RUN=10

# CORS (your frontend domain)
CORS_ORIGIN=https://your-app.vercel.app

# Server
API_URL=http://your-ec2-ip:4000
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

### **4.5 Start API with PM2**

```bash
# Start the API
cd /home/ubuntu/CosmoStream
pm2 start apps/api/src/index.ts --name cosmostream-api --interpreter tsx

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Copy and run the command it outputs (starts with 'sudo')

# View logs
pm2 logs cosmostream-api

# Check status
pm2 status
```

### **4.6 Test API**

```bash
# From EC2
curl http://localhost:4000/graphql -I

# From your local machine (replace IP with yours)
curl http://3.145.123.45:4000/graphql -I
```

You should see `HTTP/1.1 400` (expected for GET request to GraphQL).

---

## 🌐 Step 5: Set Up Domain (Optional but Recommended)

### **Option A: Use Elastic IP (Free)**

1. AWS Console → EC2 → **Elastic IPs**
2. Click **"Allocate Elastic IP address"**
3. Click **"Allocate"**
4. Select the new IP → **Actions** → **"Associate Elastic IP address"**
5. Choose your instance → **"Associate"**

**Benefit:** IP won't change when you restart the instance.

### **Option B: Use Custom Domain**

1. Buy domain from Namecheap/GoDaddy (~$10-15/year)
2. Add DNS A record:
   - Name: `api`
   - Value: Your EC2 IP
   - TTL: 300

**Result:** `api.cosmostream.com` → Your API

---

## 🔒 Step 6: Set Up HTTPS with SSL (Optional)

### **6.1 Install Nginx as Reverse Proxy**

```bash
# On EC2
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/cosmostream
```

**Add:**

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Or EC2 public DNS

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable site:**

```bash
sudo ln -s /etc/nginx/sites-available/cosmostream /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **6.2 Add SSL with Let's Encrypt (Free)**

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d api.cosmostream.com

# Auto-renewal is set up automatically
```

**Now your API is accessible at:** `https://api.cosmostream.com`

---

## ▲ Step 7: Deploy Frontend to Vercel (5 minutes)

### **7.1 Prepare Frontend**

Update `apps/web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://your-ec2-ip:4000/graphql
# Or if using domain: https://api.cosmostream.com/graphql

NEXT_PUBLIC_WS_URL=wss://your-ec2-ip:4001
# Or: wss://api.cosmostream.com
```

### **7.2 Deploy to Vercel**

1. Go to: https://vercel.com
2. Sign up with GitHub
3. Click **"New Project"**
4. Import your repository
5. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

6. **Environment Variables:**
   - Add `NEXT_PUBLIC_API_URL`
   - Add `NEXT_PUBLIC_WS_URL`

7. Click **"Deploy"**

**Your frontend will be live at:** `https://your-app.vercel.app`

---

## 🔄 Step 8: Set Up Auto-Deploy (Optional)

### **8.1 GitHub Actions for EC2**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to EC2

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_KEY }}
          script: |
            cd /home/ubuntu/CosmoStream
            git pull origin main
            npm install
            cd apps/api
            npm install
            pm2 restart cosmostream-api
```

**Add GitHub Secrets:**
- `EC2_HOST`: Your EC2 IP
- `EC2_KEY`: Contents of your `.pem` file

---

## 📊 Step 9: Monitoring & Maintenance

### **Check API Status**

```bash
# On EC2
pm2 status
pm2 logs cosmostream-api
pm2 monit  # Live monitoring
```

### **View Database**

```bash
# Connect to Neon from local machine
psql "postgresql://username:password@ep-xxxxx.region.aws.neon.tech/cosmostream?sslmode=require"

# Check video count
SELECT COUNT(*) FROM content_items WHERE source_type = 'youtube';
```

### **Check Costs**

- AWS Billing Dashboard: https://console.aws.amazon.com/billing/
- Should show **$0.00** for first 12 months

---

## 🎯 Final Checklist

Before going live:

- [ ] API accessible at public URL
- [ ] Database migrations run successfully
- [ ] Environment variables set correctly
- [ ] YouTube API key configured
- [ ] Frontend deployed to Vercel
- [ ] Frontend can connect to API
- [ ] Test user login/signup
- [ ] Test YouTube video display
- [ ] PM2 configured to restart on boot
- [ ] SSL certificate installed (optional)
- [ ] Monitoring set up

---

## 💰 Cost Breakdown

| Service | Free Period | After Free Period |
|---------|-------------|-------------------|
| AWS EC2 t2.micro | 12 months | ~$10/month |
| Neon PostgreSQL | Forever | $0 |
| Upstash Redis | Forever | $0 |
| Vercel | Forever | $0 |
| **Total** | **$0** | **$10/month** |

---

## 🆘 Troubleshooting

### **API won't start**
```bash
# Check logs
pm2 logs cosmostream-api --lines 100

# Check if port 4000 is available
sudo netstat -tulpn | grep 4000

# Restart
pm2 restart cosmostream-api
```

### **Can't connect to database**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check firewall (Neon has no firewall by default)
```

### **Frontend can't reach API**
- Check CORS settings in API
- Verify API_URL in frontend .env
- Check EC2 security group allows port 4000
- Test API directly: `curl http://your-ip:4000/graphql`

---

## 🚀 Next Steps

1. Set up custom domain
2. Enable HTTPS
3. Set up GitHub Actions auto-deploy
4. Configure monitoring (AWS CloudWatch)
5. Set up backup strategy
6. Plan for scaling (upgrade to larger EC2 instance when needed)

---

**Congratulations! Your CosmoStream platform is now LIVE!** 🎉

Total deployment time: ~45 minutes
Total cost: **$0 for 12 months!**
