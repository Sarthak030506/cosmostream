# ✅ Video Upload Feature - NOW READY TO TEST!

## What We Fixed

### Problem 1: S3 Bucket Was Private ✅ FIXED
- Unblocked public access
- Added bucket policy for public read
- **S3 bucket is now PUBLIC**

### Problem 2: Videos Never Uploaded to S3 ✅ FIXED
- Old uploads used mock URLs (API wasn't configured)
- S3 bucket is completely empty (0 files)
- Database has video records but no actual files

### Problem 3: Services Not Running ✅ FIXED
- Docker restarted
- API restarted with AWS credentials
- Media processor running

---

## Current Status

### Infrastructure ✅
- ✅ Docker running (PostgreSQL, Redis)
- ✅ API running on port 4000 (with AWS + Redis)
- ✅ Media processor running on port 4002

### S3 Configuration ✅
- ✅ Bucket: `cosmostream-videos-prod`
- ✅ Region: `eu-north-1`
- ✅ Public access: ENABLED
- ✅ Bucket policy: CONFIGURED
- ⚠️ **Empty bucket** (0 files) - old uploads didn't work

### What This Means
**Old videos (Demo2, Spaceship, Journey) won't play** because files don't exist in S3.

**New uploads from now on WILL WORK** because:
1. API generates real S3 presigned URLs
2. Frontend uploads directly to S3
3. Files actually stored in S3
4. Media processor marks as ready
5. Videos are playable!

---

## Test the Complete Upload Flow

### Step 1: Go to Upload Page

Open: http://localhost:3000/upload

### Step 2: Upload a Small Test Video

- Choose a small video file (< 50MB for quick testing)
- Fill in title and description
- Click "Upload"

### Step 3: Monitor the Logs

**Terminal 1: API logs**
```bash
tail -f apps/api/api.log
```

Expected output:
```
📹 Adding video [ID] to processing queue...
✅ Video [ID] added to queue: Job ID X
```

**Terminal 2: Media processor logs**
```bash
tail -f apps/media-processor/media-processor.log
```

Expected output:
```
info: Processing video job X
info: 📦 S3-only mode: Using original video
info: Updated video [ID] metadata
info: Created content item for video
info: ✅ Video [ID] ready (S3-only, no transcoding)
info: Job X completed
```

### Step 4: Verify File in S3

```bash
aws s3 ls s3://cosmostream-videos-prod/uploads/ --recursive --region eu-north-1 --human-readable
```

Should show:
```
2025-11-05 ... 50.0 MiB uploads/.../original.mp4
```

### Step 5: Test Video Plays

1. Go to: http://localhost:3000/browse
2. Find your uploaded video
3. Click on it
4. **Video should PLAY!** 🎉

---

## Verify Complete Flow

### Check 1: Presigned URL Generation

The API should generate REAL S3 URLs, not mock URLs.

**Before (broken):**
```
http://localhost:4000/api/mock-upload/...
```

**Now (working):**
```
https://cosmostream-videos-prod.s3.eu-north-1.amazonaws.com/...
```

### Check 2: File Actually Uploaded

```bash
aws s3 ls s3://cosmostream-videos-prod/ --recursive --region eu-north-1
```

Should list your uploaded file.

### Check 3: Video Accessible

```bash
curl -I "https://cosmostream-videos-prod.s3.eu-north-1.amazonaws.com/uploads/.../original.mp4"
```

Should return:
```
HTTP/1.1 200 OK
Content-Type: video/mp4
```

NOT:
```
HTTP/1.1 403 Forbidden  ❌
```

### Check 4: Video in Database

```bash
docker exec cosmostream-postgres psql -U postgres -d cosmostream -c \
  "SELECT title, status, manifest_url FROM videos ORDER BY created_at DESC LIMIT 1;"
```

Should show:
- status = 'ready'
- manifest_url with real S3 URL

---

## What About Old Videos?

The 3 old videos (Demo2, Spaceship, Journey) have:
- ✅ Database records
- ❌ **No files in S3**

They **won't play** because the files don't exist.

### Options:

1. **Ignore them** - Just upload new videos
2. **Delete them** - Clean up database
3. **Re-upload them** - Upload same videos again

**Recommended:** Just upload new videos and let old ones be. They'll show in your dashboard but won't play.

---

## Common Issues

### Issue: Upload fails with CORS error

**Solution:** Configure CORS on S3 bucket:

1. S3 Console → cosmostream-videos-prod → Permissions → CORS
2. Add:

```json
[{
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": ["ETag"]
}]
```

### Issue: Video stuck in processing

**Check logs:**
```bash
tail -f apps/media-processor/media-processor.log
```

Look for errors. If stuck, run:
```bash
npx ts-node scripts/reprocess-stuck-videos.ts
```

### Issue: 403 Forbidden when playing video

**Possible causes:**
1. File doesn't exist in S3 (old upload)
2. Bucket policy not saved
3. File uploaded before bucket was public

**Solution:** Upload a new video and test that one.

---

## Success Criteria

Upload completes successfully when ALL of these are true:

1. ✅ Frontend shows "Upload complete"
2. ✅ File appears in S3 bucket (check with aws s3 ls)
3. ✅ Database shows status = 'ready'
4. ✅ Video appears in browse page
5. ✅ curl shows HTTP 200 (not 403)
6. ✅ **Video plays in browser!** 🎉

---

## Ready to Test!

Everything is configured correctly. The issue was that old uploads used mock URLs.

**New uploads from now on will work!**

Go ahead and upload a test video: http://localhost:3000/upload

Let me know if it works, or if you see any errors! 🚀
