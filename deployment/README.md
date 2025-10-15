# CosmoStream Deployment

Complete deployment configuration for AWS EC2 + Vercel + Neon + Upstash

## Quick Links

- **Quick Start (30 min)**: [QUICK_START.md](QUICK_START.md)
- **Full Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Status**: [../DEPLOYMENT_READY.md](../DEPLOYMENT_READY.md)

## Files in This Directory

| File | Description |
|------|-------------|
| `ecosystem.config.js` | PM2 configuration for process management |
| `nginx.conf` | Nginx reverse proxy configuration |
| `setup-ec2.sh` | Automated EC2 initial setup script |
| `deploy.sh` | Automated deployment script |
| `DEPLOYMENT_GUIDE.md` | Complete step-by-step deployment guide |
| `QUICK_START.md` | Fast 30-minute deployment guide |
| `README.md` | This file |

## Deployment Architecture

```
Vercel (Frontend)  →  AWS EC2 (Backend)  →  Neon (Database) + Upstash (Redis)
```

## Cost

- **Year 1**: $0 (AWS Free Tier)
- **After**: ~$10/month (EC2 only, others free forever)

## Prerequisites

- AWS Account
- Vercel Account
- GitHub Account
- Domain (optional)

## Quick Start

```bash
# 1. Launch EC2 instance on AWS
# 2. SSH into EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# 3. Run setup
./setup-ec2.sh

# 4. Clone and deploy
git clone YOUR_REPO
cd CosmoStream
./deployment/deploy.sh

# 5. Deploy frontend to Vercel (via dashboard)
```

See [QUICK_START.md](QUICK_START.md) for detailed instructions.

## Support

Check the troubleshooting section in [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
