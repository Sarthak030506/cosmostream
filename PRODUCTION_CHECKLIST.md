# 🚀 Production Deployment Checklist

Quick checklist to make CosmoStream production-ready with AWS S3.

---

## 📋 Pre-Deployment Checklist

### ☐ 1. AWS Account Setup
- [ ] Create AWS account (https://aws.amazon.com)
- [ ] Add payment method
- [ ] Verify email and phone
- [ ] Choose AWS region (e.g., us-east-1)

### ☐ 2. S3 Buckets
- [ ] Create upload bucket (`cosmostream-uploads-prod`)
- [ ] Create videos bucket (`cosmostream-videos-prod`)
- [ ] Configure CORS on upload bucket
- [ ] Make videos bucket public
- [ ] Add bucket policy for public read access

### ☐ 3. IAM User & Permissions
- [ ] Create IAM user (`cosmostream-app`)
- [ ] Create custom IAM policy (S3 + MediaConvert access)
- [ ] Attach policy to user
- [ ] Generate access keys
- [ ] **Save access keys securely!**

### ☐ 4. MediaConvert Setup
- [ ] Get MediaConvert endpoint URL
- [ ] Create MediaConvert IAM role
- [ ] Copy role ARN

### ☐ 5. CloudFront CDN (Optional)
- [ ] Create CloudFront distribution
- [ ] Point to videos bucket
- [ ] Wait for deployment (5-10 minutes)
- [ ] Copy CloudFront domain name

### ☐ 6. Environment Configuration
- [ ] Copy `.env.example` to `.env` in `apps/api/`
- [ ] Fill in AWS credentials
- [ ] Fill in S3 bucket names
- [ ] Fill in MediaConvert endpoint and role
- [ ] Fill in CloudFront domain (if using)
- [ ] Update database URL (if different)
- [ ] Update Redis URL (if different)
- [ ] Change JWT secrets to random strings

### ☐ 7. Test Configuration
```bash
# Run configuration checker
npx ts-node scripts/check-aws-config.ts
```
- [ ] All checks pass ✅

### ☐ 8. Test Upload
- [ ] Start all services
- [ ] Upload a test video
- [ ] Verify appears in S3 buckets
- [ ] Verify MediaConvert job runs
- [ ] Verify video appears on /browse

### ☐ 9. Security Hardening
- [ ] Rotate default passwords
- [ ] Use long random JWT secrets
- [ ] Enable HTTPS in production
- [ ] Set up firewall rules
- [ ] Configure rate limiting
- [ ] Set up monitoring/alerts

### ☐ 10. Production Database
- [ ] Run all migrations
- [ ] Set up backups
- [ ] Use connection pooling
- [ ] Enable SSL for database connection

---

## 📚 Documentation References

- **Detailed AWS Setup:** `AWS_S3_PRODUCTION_SETUP.md` (read this first!)
- **Video Upload Guide:** `VIDEO_UPLOAD_COMPLETE.md`
- **General Setup:** `SETUP_COMPLETE.md`
- **Project Overview:** `CLAUDE.md`

---

## 🧪 Testing Commands

```bash
# Check AWS configuration
npx ts-node scripts/check-aws-config.ts

# Test S3 access via CLI
aws s3 ls s3://cosmostream-uploads-prod
aws s3 ls s3://cosmostream-videos-prod

# Upload test file
echo "test" > test.txt
aws s3 cp test.txt s3://cosmostream-uploads-prod/test.txt
aws s3 rm s3://cosmostream-uploads-prod/test.txt
rm test.txt

# Run migrations
make db-migrate
# OR
psql -U postgres -d cosmostream -f database/migrations/*.sql

# Start services
docker-compose up -d
npm run dev --filter=api
npm run dev --filter=media-processor
npm run dev --filter=web
```

---

## 💰 Cost Estimation

### Free Tier (First 12 Months)
- S3: 5 GB storage free
- Data transfer: 15 GB/month free
- MediaConvert: 20 minutes/month free

### After Free Tier
**Small scale (100 videos, 1000 views/month):**
- S3 storage (5 GB): ~$0.12/month
- S3 requests: ~$0.05/month
- MediaConvert (10 hours): ~$9/month
- CloudFront (50 GB): ~$4.25/month
- **Total: ~$13-15/month**

**Medium scale (1000 videos, 10K views/month):**
- S3 storage (50 GB): ~$1.15/month
- S3 requests: ~$0.50/month
- MediaConvert (100 hours): ~$90/month
- CloudFront (500 GB): ~$42.50/month
- **Total: ~$134/month**

---

## 🚨 Common Issues & Solutions

### Issue: "InvalidAccessKeyId"
**Solution:** Regenerate access keys in IAM and update .env

### Issue: "Access Denied" when uploading
**Solution:** Check IAM policy includes s3:PutObject permission

### Issue: Videos stuck in "processing"
**Solution:**
1. Check MediaConvert endpoint is correct
2. Verify MediaConvert role has S3 access
3. Check media-processor service logs

### Issue: "CORS error" in browser
**Solution:** Update CORS configuration in upload bucket to include your domain

### Issue: Can't view videos after processing
**Solution:** Make sure videos bucket has public read policy

---

## ✅ Success Criteria

Before going to production, verify:

- [ ] Can upload videos from web interface
- [ ] Videos appear in S3 upload bucket
- [ ] MediaConvert jobs complete successfully
- [ ] Processed videos appear in videos bucket
- [ ] Videos visible on /browse page
- [ ] Videos playable (HLS manifest works)
- [ ] CloudFront delivers videos fast (if using)
- [ ] No AWS costs exceeding budget
- [ ] Billing alerts configured
- [ ] Backups configured
- [ ] Monitoring set up

---

## 🎯 Quick Start (Minimum Viable Setup)

If you just want to get started quickly:

1. **Create AWS account**
2. **Create 2 S3 buckets** (upload + videos)
3. **Create IAM user** with S3 access
4. **Get access keys**
5. **Update `.env`** with credentials
6. **Run config checker:** `npx ts-node scripts/check-aws-config.ts`
7. **Test upload** from web interface

You can skip MediaConvert and CloudFront initially - videos will use simulated processing.

---

## 📞 Support Resources

- AWS Documentation: https://docs.aws.amazon.com
- AWS Free Tier: https://aws.amazon.com/free/
- AWS Pricing Calculator: https://calculator.aws/
- AWS Support: https://console.aws.amazon.com/support/

---

## 🎊 Ready for Production!

Once all checkboxes are checked:

✅ Your platform can handle millions of videos
✅ Fast delivery worldwide via CloudFront
✅ Automatic video transcoding
✅ Scalable storage with S3
✅ Production-ready!

**Next steps:** Deploy to hosting provider (Vercel, AWS, etc.)
