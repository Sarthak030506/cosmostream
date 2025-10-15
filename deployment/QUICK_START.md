# CosmoStream Deployment - Quick Start

## What We've Set Up

### Completed:
- ✅ Neon PostgreSQL database (Free forever)
- ✅ Upstash Redis (Free forever)
- ✅ Production environment configurations
- ✅ AWS EC2 deployment scripts
- ✅ Vercel configuration
- ✅ Nginx reverse proxy configuration
- ✅ PM2 process manager setup
- ✅ SSL/TLS support

### Your Credentials:

**Neon PostgreSQL**:
```
Host: ep-holy-poetry-ad30aapq-pooler.c-2.us-east-1.aws.neon.tech
Database: neondb
User: neondb_owner
Connection URL: Already configured in apps/api/.env.production
```

**Upstash Redis**:
```
URL: https://heroic-manatee-13363.upstash.io
Already configured in apps/api/.env.production
```

---

## Deployment Steps (30 minutes)

### Phase 1: AWS EC2 Setup (10 minutes)

1. **Launch EC2 Instance**:
   - Go to AWS Console → EC2 → Launch Instance
   - Choose Ubuntu 22.04 LTS
   - Instance type: t2.micro (Free tier)
   - Create/select key pair
   - Security group: Allow SSH (22), HTTP (80), HTTPS (443), Custom TCP (4000, 4001)

2. **Connect to EC2**:
   ```bash
   ssh -i your-key.pem ubuntu@YOUR_EC2_IP
   ```

3. **Run Setup Script**:
   ```bash
   # Update system
   sudo apt-get update && sudo apt-get upgrade -y

   # Install Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install tools
   sudo apt-get install -y build-essential git nginx certbot python3-certbot-nginx
   sudo npm install -g pm2

   # Configure firewall
   sudo ufw allow OpenSSH
   sudo ufw allow 'Nginx Full'
   sudo ufw --force enable
   ```

### Phase 2: Deploy Backend (10 minutes)

1. **Clone Repository**:
   ```bash
   cd /home/ubuntu
   git clone YOUR_REPO_URL
   cd CosmoStream
   ```

2. **Configure Environment**:
   ```bash
   cd apps/api

   # The .env.production is already created with your Neon & Upstash credentials!
   # Just need to generate secure JWT secrets:

   nano .env.production

   # Replace these lines with secure random strings:
   # JWT_SECRET=<paste random string here>
   # JWT_REFRESH_SECRET=<paste random string here>
   ```

   Generate secure secrets:
   ```bash
   openssl rand -base64 32  # Use for JWT_SECRET
   openssl rand -base64 32  # Use for JWT_REFRESH_SECRET
   ```

3. **Build and Deploy**:
   ```bash
   cd /home/ubuntu/CosmoStream

   # Install dependencies
   npm install

   # Build
   npm run build

   # Start services
   pm2 start deployment/ecosystem.config.js
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx**:
   ```bash
   # Copy config
   sudo cp deployment/nginx.conf /etc/nginx/sites-available/cosmostream

   # Edit domain/IP
   sudo nano /etc/nginx/sites-available/cosmostream
   # Change "your-domain.com" to your EC2 IP or domain

   # Enable site
   sudo ln -s /etc/nginx/sites-available/cosmostream /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **Test API**:
   ```bash
   curl http://localhost:4000/health
   # Should return: {"status":"ok"}
   ```

### Phase 3: Deploy Frontend to Vercel (10 minutes)

1. **Update Frontend Environment**:
   ```bash
   # On your local machine:
   cd C:\Users\hp\Desktop\CosmoStream\apps\web
   notepad .env.production
   ```

   Update with your EC2 IP:
   ```env
   NEXT_PUBLIC_API_URL=http://YOUR_EC2_IP/graphql
   NEXT_PUBLIC_WS_URL=ws://YOUR_EC2_IP:4001
   ```

2. **Commit Changes**:
   ```bash
   cd C:\Users\hp\Desktop\CosmoStream
   git add .
   git commit -m "Add production configurations"
   git push origin main
   ```

3. **Deploy to Vercel**:
   - Go to https://vercel.com/dashboard
   - Click "Add New Project"
   - Import your GitHub repository
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && npm run build --filter=web`
   - **Install Command**: `cd ../.. && npm install`
   - Add environment variables:
     - `NEXT_PUBLIC_API_URL`: `http://YOUR_EC2_IP/graphql`
     - `NEXT_PUBLIC_WS_URL`: `ws://YOUR_EC2_IP:4001`
     - `NEXT_PUBLIC_NASA_API_KEY`: `DEMO_KEY`
   - Click "Deploy"

4. **Update CORS on Backend**:
   ```bash
   # SSH to EC2
   ssh -i your-key.pem ubuntu@YOUR_EC2_IP

   # Edit environment
   cd /home/ubuntu/CosmoStream/apps/api
   nano .env.production

   # Update CORS_ORIGIN to your Vercel URL
   CORS_ORIGIN=https://your-app.vercel.app

   # Restart API
   pm2 restart cosmostream-api
   ```

---

## Testing

### Test Backend:
```bash
# Health check
curl http://YOUR_EC2_IP/api/health

# GraphQL
curl -X POST http://YOUR_EC2_IP/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}'
```

### Test Frontend:
1. Visit: `https://your-app.vercel.app`
2. Try to register/login
3. Check browser console for errors

---

## Files Created

```
CosmoStream/
├── apps/
│   ├── api/
│   │   └── .env.production          ← Production config (Neon + Upstash)
│   └── web/
│       ├── .env.production          ← Frontend config
│       └── vercel.json              ← Vercel deployment config
└── deployment/
    ├── ecosystem.config.js          ← PM2 configuration
    ├── nginx.conf                   ← Nginx reverse proxy
    ├── setup-ec2.sh                 ← EC2 initial setup
    ├── deploy.sh                    ← Deployment script
    ├── DEPLOYMENT_GUIDE.md          ← Full guide
    └── QUICK_START.md               ← This file
```

---

## Important Notes

### Before Going to Production:
1. **Change JWT secrets** in `.env.production` to random secure strings
2. **Get a domain name** ($8-15/year) for SSL/HTTPS
3. **Setup SSL** with Let's Encrypt (free)
4. **Update CORS** to your actual frontend domain
5. **Add AWS credentials** if you want video upload/processing

### Cost:
- **Months 1-12**: $0 (AWS Free Tier)
- **After 12 months**: ~$10/month (EC2 t2.micro)
- **Neon + Upstash + Vercel**: FREE FOREVER

---

## Useful Commands

```bash
# On EC2:
pm2 status               # View services status
pm2 logs                 # View all logs
pm2 logs api             # View API logs
pm2 restart all          # Restart all services
pm2 monit                # Monitor resources

# Update deployment:
cd /home/ubuntu/CosmoStream
git pull origin main
npm install
npm run build
pm2 restart all
```

---

## Next Steps

After deployment:
1. **Setup Domain & SSL** (recommended)
2. **Configure AWS S3** for video uploads (optional)
3. **Add Monitoring** (PM2 Plus, Sentry, etc.)
4. **Setup CI/CD** with GitHub Actions
5. **Add Custom Domain** to Vercel

---

## Need Help?

- Full guide: `deployment/DEPLOYMENT_GUIDE.md`
- Check logs: `pm2 logs`
- Check Nginx: `sudo tail -f /var/log/nginx/error.log`
- Test database: `node apps/api/test-db-connection.js`

---

**You're all set!** 🚀

The hardest part is done. Just follow the phases above and you'll have your app deployed in 30 minutes!
