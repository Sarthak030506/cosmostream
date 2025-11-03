# 🚀 AWS S3 Production Setup Guide

Complete guide to make CosmoStream production-ready with AWS S3 video storage.

---

## 📋 What We're Setting Up

1. **S3 Buckets** - Store uploaded videos and processed videos
2. **IAM User** - Secure access to AWS services
3. **AWS MediaConvert** - Transcode videos to multiple resolutions
4. **CloudFront CDN** (Optional) - Fast video delivery worldwide

---

## 💰 Estimated Costs

### **Free Tier (First 12 months):**
- S3: 5 GB storage free
- Data transfer: 15 GB/month free
- MediaConvert: First 20 minutes/month free

### **After Free Tier:**
- S3 storage: ~$0.023/GB/month
- Data transfer: $0.09/GB
- MediaConvert: ~$0.015/minute for HD
- CloudFront: $0.085/GB (first 10 TB)

**Example:** 100 videos (5 GB total) + 1000 views/month = ~$5-10/month

---

## 🛠️ Step 1: AWS Account Setup

### 1.1 Create AWS Account
```bash
1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Enter email, password, AWS account name
4. Enter payment information (required, but free tier available)
5. Verify phone number
6. Choose "Basic Support (Free)"
```

### 1.2 Sign in to Console
```bash
1. Go to https://console.aws.amazon.com
2. Sign in with your credentials
3. Select your region (e.g., us-east-1, eu-west-1)
```

**⚠️ IMPORTANT:** Choose a region close to your users for better performance!

---

## 📦 Step 2: Create S3 Buckets

### 2.1 Create Upload Bucket

```bash
1. Go to S3 Console: https://s3.console.aws.amazon.com
2. Click "Create bucket"
3. Enter details:
   - Bucket name: cosmostream-uploads-prod (must be globally unique)
   - Region: us-east-1 (or your chosen region)
   - Object Ownership: ACLs disabled
   - Block all public access: ✅ (Keep checked)
   - Bucket Versioning: Disabled
   - Encryption: Enable (SSE-S3)
4. Click "Create bucket"
```

### 2.2 Create Processed Videos Bucket

```bash
1. Click "Create bucket" again
2. Enter details:
   - Bucket name: cosmostream-videos-prod (must be globally unique)
   - Region: us-east-1 (same as upload bucket)
   - Object Ownership: ACLs disabled
   - Block all public access: ❌ (UNCHECK - videos need to be public)
   - Bucket Versioning: Disabled
   - Encryption: Enable (SSE-S3)
3. Click "Create bucket"
```

### 2.3 Configure CORS for Upload Bucket

```bash
1. Go to your upload bucket (cosmostream-uploads-prod)
2. Click "Permissions" tab
3. Scroll to "Cross-origin resource sharing (CORS)"
4. Click "Edit"
5. Paste this configuration:
```

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "POST", "GET"],
        "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
        "ExposeHeaders": ["ETag"]
    }
]
```

```bash
6. Click "Save changes"
```

### 2.4 Make Processed Videos Public

```bash
1. Go to your videos bucket (cosmostream-videos-prod)
2. Click "Permissions" tab
3. Scroll to "Block public access"
4. Click "Edit"
5. UNCHECK "Block all public access"
6. Confirm by typing "confirm"
7. Click "Bucket Policy"
8. Paste this policy:
```

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::cosmostream-videos-prod/*"
        }
    ]
}
```

**Replace `cosmostream-videos-prod` with your actual bucket name!**

```bash
9. Click "Save changes"
```

---

## 🔐 Step 3: Create IAM User

### 3.1 Create User

```bash
1. Go to IAM Console: https://console.aws.amazon.com/iam
2. Click "Users" in left sidebar
3. Click "Create user"
4. Username: cosmostream-app
5. Click "Next"
6. Select "Attach policies directly"
7. DON'T select any policies yet
8. Click "Next" → "Create user"
```

### 3.2 Create Custom Policy

```bash
1. In IAM, click "Policies" in left sidebar
2. Click "Create policy"
3. Click "JSON" tab
4. Paste this policy:
```

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "S3UploadBucket",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::cosmostream-uploads-prod/*"
        },
        {
            "Sid": "S3VideosBucket",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::cosmostream-videos-prod",
                "arn:aws:s3:::cosmostream-videos-prod/*"
            ]
        },
        {
            "Sid": "MediaConvertAccess",
            "Effect": "Allow",
            "Action": [
                "mediaconvert:CreateJob",
                "mediaconvert:GetJob",
                "mediaconvert:ListJobs",
                "mediaconvert:DescribeEndpoints"
            ],
            "Resource": "*"
        },
        {
            "Sid": "IAMPassRole",
            "Effect": "Allow",
            "Action": "iam:PassRole",
            "Resource": "*",
            "Condition": {
                "StringEquals": {
                    "iam:PassedToService": "mediaconvert.amazonaws.com"
                }
            }
        }
    ]
}
```

**Replace bucket names with your actual bucket names!**

```bash
5. Click "Next"
6. Policy name: CosmoStreamAppPolicy
7. Description: Permissions for CosmoStream app
8. Click "Create policy"
```

### 3.3 Attach Policy to User

```bash
1. Go back to "Users"
2. Click on "cosmostream-app"
3. Click "Add permissions" → "Attach policies directly"
4. Search for "CosmoStreamAppPolicy"
5. Check the box
6. Click "Next" → "Add permissions"
```

### 3.4 Create Access Keys

```bash
1. Still in user "cosmostream-app"
2. Click "Security credentials" tab
3. Scroll to "Access keys"
4. Click "Create access key"
5. Select "Application running outside AWS"
6. Click "Next"
7. Description: CosmoStream Production
8. Click "Create access key"
9. ⚠️ IMPORTANT: Copy both:
   - Access key ID (e.g., AKIAIOSFODNN7EXAMPLE)
   - Secret access key (e.g., wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY)
10. ⚠️ Save these in a secure place! You won't see the secret again!
11. Click "Done"
```

---

## 🎬 Step 4: Set Up AWS MediaConvert

### 4.1 Get MediaConvert Endpoint

```bash
1. Go to MediaConvert Console: https://console.aws.amazon.com/mediaconvert
2. If first time, click "Get started"
3. In top right, note your region (e.g., us-east-1)
4. Your endpoint URL format:
   https://[account-id].mediaconvert.[region].amazonaws.com

5. To get exact endpoint, run in terminal (with AWS CLI installed):
```

```bash
aws mediaconvert describe-endpoints --region us-east-1
```

**OR** use this format:
```
https://[your-account-id].mediaconvert.us-east-1.amazonaws.com
```

### 4.2 Create MediaConvert IAM Role

```bash
1. Go to IAM Console
2. Click "Roles"
3. Click "Create role"
4. Select "AWS service"
5. Select "MediaConvert"
6. Click "Next"
7. The required policy is already attached
8. Click "Next"
9. Role name: CosmoStreamMediaConvertRole
10. Click "Create role"
11. Click on the created role
12. Copy the "ARN" (e.g., arn:aws:iam::123456789012:role/CosmoStreamMediaConvertRole)
```

---

## ⚡ Step 5: CloudFront CDN (Optional but Recommended)

### 5.1 Create CloudFront Distribution

```bash
1. Go to CloudFront Console: https://console.aws.amazon.com/cloudfront
2. Click "Create distribution"
3. Configure:
   - Origin domain: cosmostream-videos-prod.s3.us-east-1.amazonaws.com
   - Origin path: (leave empty)
   - Name: CosmoStream Videos CDN
   - Origin access: Public
   - Viewer protocol policy: Redirect HTTP to HTTPS
   - Allowed HTTP methods: GET, HEAD, OPTIONS
   - Cache policy: CachingOptimized
   - Price class: Use all edge locations (best performance)
4. Click "Create distribution"
5. Wait 5-10 minutes for deployment
6. Copy the "Distribution domain name" (e.g., d111111abcdef8.cloudfront.net)
```

---

## 🔧 Step 6: Configure Environment Variables

### 6.1 API Environment Variables

Create/update `apps/api/.env`:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# S3 Buckets
AWS_S3_UPLOAD_BUCKET=cosmostream-uploads-prod
AWS_S3_BUCKET=cosmostream-videos-prod

# MediaConvert
AWS_MEDIACONVERT_ENDPOINT=https://your-account-id.mediaconvert.us-east-1.amazonaws.com
AWS_MEDIACONVERT_ROLE=arn:aws:iam::123456789012:role/CosmoStreamMediaConvertRole

# CloudFront (if using)
CLOUDFRONT_DOMAIN=d111111abcdef8.cloudfront.net

# Database (existing)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cosmostream
REDIS_URL=redis://localhost:6379

# JWT (existing)
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production
```

### 6.2 Media Processor Environment Variables

Create/update `apps/media-processor/.env`:

```bash
# AWS Configuration (same as API)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# S3 Buckets
AWS_S3_UPLOAD_BUCKET=cosmostream-uploads-prod
AWS_S3_BUCKET=cosmostream-videos-prod

# MediaConvert
AWS_MEDIACONVERT_ENDPOINT=https://your-account-id.mediaconvert.us-east-1.amazonaws.com
AWS_MEDIACONVERT_ROLE=arn:aws:iam::123456789012:role/CosmoStreamMediaConvertRole

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cosmostream

# Redis
REDIS_URL=redis://localhost:6379
```

### 6.3 Web Environment Variables

Create/update `apps/web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:4001

# For production:
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com/graphql
# NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
```

---

## ✅ Step 7: Verify Configuration

### 7.1 Check AWS Credentials

```bash
# Install AWS CLI (if not installed)
# Windows: Download from https://aws.amazon.com/cli/
# Mac: brew install awscli
# Linux: apt install awscli

# Configure AWS CLI
aws configure
# Enter:
# - AWS Access Key ID: [your key]
# - AWS Secret Access Key: [your secret]
# - Default region: us-east-1
# - Default output format: json

# Test S3 access
aws s3 ls s3://cosmostream-uploads-prod
aws s3 ls s3://cosmostream-videos-prod

# Should return empty list (no error)
```

### 7.2 Test File Upload

```bash
# Upload a test file
echo "test" > test.txt
aws s3 cp test.txt s3://cosmostream-uploads-prod/test.txt

# Verify
aws s3 ls s3://cosmostream-uploads-prod/

# Clean up
aws s3 rm s3://cosmostream-uploads-prod/test.txt
rm test.txt
```

---

## 🧪 Step 8: Test Video Upload End-to-End

### 8.1 Start Services

```bash
# Terminal 1: Database & Redis
docker-compose up -d

# Terminal 2: API
cd apps/api
npm run dev

# Terminal 3: Media Processor
cd apps/media-processor
npm run dev

# Terminal 4: Web
cd apps/web
npm run dev
```

### 8.2 Upload Test Video

```bash
1. Go to http://localhost:3000
2. Login
3. Go to /upload
4. Upload a small MP4 file (< 50 MB for testing)
5. Watch the console logs in media-processor terminal
6. Should see:
   - ✅ "MediaConvert job created"
   - ✅ Video processing started
   - Wait 2-5 minutes for processing
   - ✅ Video status changes to "ready"
```

### 8.3 Verify in AWS Console

```bash
1. Go to S3 Console
2. Check cosmostream-uploads-prod bucket
   - Should see uploaded video file
3. Check cosmostream-videos-prod bucket
   - Should see processed videos folder after MediaConvert finishes
4. Go to MediaConvert Console
   - Check "Jobs" - should see your job (COMPLETE status)
```

---

## 🚨 Troubleshooting

### Issue: "Access Denied" when uploading

**Solution:**
```bash
1. Check IAM policy has s3:PutObject permission
2. Check CORS configuration on upload bucket
3. Verify AWS credentials in .env file
```

### Issue: "InvalidAccessKeyId"

**Solution:**
```bash
1. Regenerate access keys in IAM
2. Update .env files with new keys
3. Restart services
```

### Issue: MediaConvert job fails

**Solution:**
```bash
1. Check MediaConvert IAM role has S3 access
2. Verify endpoint URL is correct
3. Check video bucket exists and role can write to it
```

### Issue: CORS errors in browser

**Solution:**
```bash
1. Update CORS config in S3 bucket
2. Add your domain to AllowedOrigins
3. Make sure you included your localhost for testing
```

---

## 📊 Monitoring & Costs

### Monitor S3 Usage

```bash
1. Go to S3 Console
2. Click "Metrics" for each bucket
3. View:
   - Storage used
   - Number of objects
   - Request metrics
```

### Monitor Costs

```bash
1. Go to AWS Billing Console
2. View "Cost Explorer"
3. Set up billing alerts:
   - Go to "Budgets"
   - Create budget (e.g., $10/month alert)
```

---

## 🔒 Security Best Practices

### 1. Rotate Access Keys

```bash
# Every 90 days:
1. Create new access keys
2. Update .env files
3. Test everything works
4. Delete old keys
```

### 2. Use Secrets Manager (Production)

```bash
# Instead of .env files:
1. Store credentials in AWS Secrets Manager
2. Access via SDK in code
3. More secure for production
```

### 3. Enable CloudTrail

```bash
1. Go to CloudTrail Console
2. Create trail
3. Track all API calls for security auditing
```

### 4. Set Bucket Lifecycle Rules

```bash
# Auto-delete old uploads
1. Go to S3 bucket "Management" tab
2. Create lifecycle rule
3. Delete uploads older than 7 days
4. Move videos to cheaper storage (Glacier) after 90 days
```

---

## 🎯 Production Checklist

- [ ] AWS account created
- [ ] S3 upload bucket created
- [ ] S3 videos bucket created
- [ ] CORS configured on upload bucket
- [ ] Videos bucket is public
- [ ] IAM user created
- [ ] Custom policy created and attached
- [ ] Access keys generated and saved
- [ ] MediaConvert endpoint obtained
- [ ] MediaConvert IAM role created
- [ ] CloudFront distribution created (optional)
- [ ] API .env configured
- [ ] Media processor .env configured
- [ ] Web .env configured
- [ ] AWS CLI tested
- [ ] Test video uploaded successfully
- [ ] MediaConvert job completed
- [ ] Video appears on browse page
- [ ] Billing alerts set up
- [ ] Documentation saved

---

## 💡 Next Steps After Setup

1. **Update video URLs** - Use CloudFront domain instead of S3
2. **Set up EventBridge** - Auto-notify when MediaConvert jobs complete
3. **Add thumbnails** - Extract frames using AWS Lambda
4. **Optimize costs** - Use S3 lifecycle policies
5. **Monitor performance** - Set up CloudWatch dashboards

---

## 📞 Support Resources

- AWS Documentation: https://docs.aws.amazon.com
- S3 Guide: https://docs.aws.amazon.com/s3/
- MediaConvert Guide: https://docs.aws.amazon.com/mediaconvert/
- AWS Free Tier: https://aws.amazon.com/free/
- AWS Support: https://console.aws.amazon.com/support/

---

## ✅ Success!

Once all steps are complete, your platform will:
- ✅ Store videos on AWS S3
- ✅ Transcode videos with MediaConvert
- ✅ Deliver via CloudFront CDN
- ✅ Scale to millions of users
- ✅ Be production-ready!

**Cost estimate for 1000 users:** $10-50/month depending on usage.
