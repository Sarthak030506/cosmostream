# 🆓 FREE S3-Only Video Storage Setup

## ✅ What You Get (100% FREE)

- ✅ Store videos on AWS S3
- ✅ **FREE for first 12 months** (under 5GB)
- ✅ Videos upload and play
- ✅ No MediaConvert needed
- ✅ Original quality videos
- ✅ Production-ready

**Cost:** $0/month (within free tier)

---

## 📦 Step 1: Create S3 Bucket (5 minutes)

### **1.1 Go to S3 Console**
```
https://s3.console.aws.amazon.com/s3/buckets?region=eu-north-1
```

### **1.2 Click "Create bucket"**

### **1.3 Bucket Settings:**
```
Bucket name: cosmostream-videos-prod
  (Must be globally unique - add numbers if taken)

Region: eu-north-1 (Europe - Stockholm)

Object Ownership: ACLs disabled ✅

Block Public Access settings:
  ❌ UNCHECK "Block all public access"
  ✅ CHECK the warning acknowledgment
  (We need videos to be publicly accessible)

Bucket Versioning: Disable

Encryption: Enable (Server-side encryption with Amazon S3 managed keys)

Click "Create bucket"
```

---

## 🔓 Step 2: Make Bucket Public (3 minutes)

### **2.1 Click on your bucket name**

### **2.2 Go to "Permissions" tab**

### **2.3 Scroll to "Bucket policy"**

### **2.4 Click "Edit"**

### **2.5 Paste this policy:**

**⚠️ IMPORTANT: Replace `cosmostream-videos-prod` with YOUR bucket name!**

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

### **2.6 Click "Save changes"**

---

## 🌐 Step 3: Configure CORS (2 minutes)

### **3.1 Still in "Permissions" tab**

### **3.2 Scroll to "Cross-origin resource sharing (CORS)"**

### **3.3 Click "Edit"**

### **3.4 Paste this:**

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "POST", "GET", "HEAD"],
        "AllowedOrigins": [
            "http://localhost:3000",
            "http://localhost:4000",
            "https://yourdomain.com"
        ],
        "ExposeHeaders": ["ETag", "Content-Length"]
    }
]
```

**Replace `https://yourdomain.com` with your actual domain when deploying!**

### **3.5 Click "Save changes"**

---

## ✅ Step 4: Verify Setup

### **4.1 Check .env file:**

File: `apps/api/.env`

```bash
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=AKIAVP5QRMTCNXLR4W7P
AWS_SECRET_ACCESS_KEY=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
AWS_S3_BUCKET=cosmostream-videos-prod
AWS_S3_UPLOAD_BUCKET=cosmostream-videos-prod

# Leave these EMPTY for S3-only mode
AWS_MEDIACONVERT_ENDPOINT=
AWS_MEDIACONVERT_ROLE=
```

### **4.2 Test AWS connection:**

```bash
# Run configuration checker
npx ts-node scripts/check-aws-config.ts

# Should show:
# ✅ AWS Credentials: Found
# ✅ S3 Connection: Successfully connected
# ✅ Upload Bucket: cosmostream-videos-prod
# ⚠️  MediaConvert: Not configured (using S3-only mode)
```

---

## 🧪 Step 5: Test Video Upload

### **5.1 Start all services:**

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

### **5.2 Upload test video:**

```bash
1. Go to http://localhost:3000
2. Login/Signup
3. Go to /upload
4. Upload a small video (< 100 MB for testing)
5. Wait ~5 seconds
6. Check logs in media-processor terminal
7. Should see: "📦 S3-only mode: Using original video..."
8. Go to /browse - your video should appear!
```

### **5.3 Verify in AWS Console:**

```bash
1. Go back to S3 Console
2. Click on your bucket
3. You should see your uploaded video file!
4. Click on the file
5. Copy the "Object URL"
6. Open in browser - video should load!
```

---

## 💰 Cost Breakdown

### **AWS Free Tier (12 months):**

```
Storage: 5 GB FREE
  = ~10-20 videos (500MB each)

GET Requests: 20,000 FREE
  = ~2,000 video views

PUT Requests: 2,000 FREE
  = 2,000 video uploads

Data Transfer Out: 15 GB FREE
  = ~30-50 video streams
```

### **After Free Tier:**

```
Storage: $0.023 per GB
  5 GB = $0.12/month

Data Transfer: $0.09 per GB
  10 GB = $0.90/month

Total for 20 videos + 1000 views = ~$2-3/month
```

**Much cheaper than MediaConvert!** 🎉

---

## 📊 What You Get vs What You Don't

### **✅ What Works:**
- Upload videos ✅
- Store on S3 ✅
- Videos play in browser ✅
- Original quality ✅
- Public access ✅
- FREE (within limits) ✅
- Production-ready ✅

### **❌ What You Don't Get:**
- Multiple resolutions (only original)
- Adaptive streaming (no auto-quality switching)
- HLS/DASH streaming
- Automatic thumbnails
- Video optimization

**For MVP: This is PERFECT!** 🚀

---

## 🔄 Upgrade Path (Future)

When you outgrow free tier or want better quality:

### **Option 1: Add MediaConvert**
```bash
Cost: +$0.015/minute of video
Benefit: Multi-resolution, adaptive streaming
When: When you have 100+ users
```

### **Option 2: Add CloudFront CDN**
```bash
Cost: $0.085 per GB delivered
Benefit: Faster delivery worldwide
When: When users complain about slow loading
```

### **Option 3: Both**
```bash
Cost: ~$20-50/month for 1000 users
Benefit: Professional Netflix-quality delivery
When: Ready to scale
```

---

## 🚨 Troubleshooting

### **Issue: "Access Denied" when uploading**
**Solution:**
- Check IAM user has S3 permissions
- Verify access keys in .env

### **Issue: "CORS error" in browser**
**Solution:**
- Add your domain to CORS config
- Make sure localhost:3000 is included

### **Issue: Can't play videos**
**Solution:**
- Check bucket policy allows public read
- Verify bucket name in .env matches AWS
- Make sure "Block public access" is OFF

### **Issue: Videos stuck in "processing"**
**Solution:**
- Check media-processor service is running
- Check logs for errors
- Verify AWS credentials are correct

---

## ✅ Success Checklist

- [ ] S3 bucket created (`cosmostream-videos-prod`)
- [ ] Block public access: OFF
- [ ] Bucket policy: Added (public read)
- [ ] CORS configured
- [ ] .env updated with bucket name
- [ ] Config checker passes
- [ ] Test video uploaded successfully
- [ ] Video appears in bucket
- [ ] Video plays in browser
- [ ] Video appears on /browse page

---

## 🎉 You're Done!

**Your platform now has:**
- ✅ FREE video storage (5GB)
- ✅ Production-ready setup
- ✅ Videos that actually play
- ✅ No MediaConvert subscription needed
- ✅ Can deploy immediately

**Next steps:**
1. Test with multiple videos
2. Deploy to hosting (Vercel, etc.)
3. Add CloudFront CDN when needed
4. Upgrade to MediaConvert when scaling

**Cost:** $0-3/month to start! 🚀
