# 📺 YouTube API Quota - Explained

## ✅ **Summary: Both Issues Fixed!**

1. ✅ **Database tags error** - Fixed (line 466 in youtube-sync.ts)
2. ✅ **Quota tracking** - Auto-resets daily now
3. ⏰ **Real YouTube quota** - Actual Google limit (resets daily)

---

## 🎯 **Understanding YouTube Quotas**

### **There are TWO quotas:**

#### **1. Our Database Tracker** (Internal tracking)
- **Purpose:** Track how much quota we've used today
- **Limit:** 10,000 units/day (configurable in `.env`)
- **Reset:** Automatically at midnight (now fixed!)
- **Status:** ✅ Working correctly after our fix

#### **2. Google's Real Quota** (External limit)
- **Purpose:** Google's actual API limit
- **Limit:** 10,000 units/day (default for free tier)
- **Reset:** Midnight Pacific Time (Google's servers)
- **Status:** ⚠️ You hit this today!

---

## 💰 **Quota Costs**

Each YouTube API operation costs quota units:

```
Search (keyword): 100 units
Search (channel): 100 units
Video details:      1 unit
Channel details:    1 unit
```

**Example sync (1 category):**
```
- 1 keyword search = 100 units
- 4 channel searches = 400 units
- 5 video details = 5 units
- 5 channel details = 5 units
Total = 510 units per category
```

**Your situation today:**
- You synced ~15 categories
- ~510 units × 15 = **7,650 units used**
- Then hit the 10,000 limit on subsequent syncs

---

## 🔄 **What Happens When Quota Exceeded**

### **Our System:**
```javascript
// Checks our database first
if (remainingQuota < cost) {
  logger.warn('Insufficient quota');
  return false; // Stops sync
}
```

### **Google's Response:**
```
Error 403: quotaExceeded
"You have exceeded your quota"
```

**System handles gracefully:**
- ✅ Syncs what it can
- ✅ Falls back to sequential import
- ✅ Doesn't crash
- ✅ Logs quota usage

---

## 📊 **Check Your Quota Usage**

### **In the database:**
```sql
SELECT
  date,
  quota_used,
  quota_limit,
  (quota_limit - quota_used) as remaining,
  requests_count
FROM youtube_api_quota
WHERE date >= CURRENT_DATE - 7
ORDER BY date DESC;
```

### **In the UI:**
Go to your YouTube Sync admin panel - shows quota in real-time.

---

## 🛠️ **Solutions**

### **Option 1: Wait Until Tomorrow** ⏰ (FREE)
- Quota resets at midnight Pacific Time
- No cost, just wait
- **Best for:** Testing, low-traffic sites

### **Option 2: Sync Less Frequently** 📅 (FREE)
Update `.env`:
```bash
# Change from every 30 minutes to once per day
NEWS_SYNC_CRON=0 2 * * *  # 2 AM daily
YOUTUBE_SYNC_CRON=0 3 * * *  # 3 AM daily
```

**Best for:** MVP, small-scale

### **Option 3: Sync Fewer Categories** 🎯 (FREE)
Only sync your top 5-10 most popular categories instead of all.

**Best for:** Targeted content

### **Option 4: Request Higher Quota** 💰 (May cost)
1. Go to: https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas
2. Click "Request quota increase"
3. Fill out form explaining your use case
4. Wait 2-3 days for approval
5. Can get up to 1 million units/day (usually free if reasonable)

**Best for:** Production at scale

### **Option 5: Use Multiple API Keys** 🔑 (Advanced)
- Create multiple Google Cloud projects
- Each gets 10,000 quota/day
- Rotate between keys
- **⚠️ Against Google ToS for abuse**

**Best for:** Not recommended

---

## ⚙️ **Optimize Quota Usage**

### **1. Cache Video Data**
Don't re-fetch videos you already have:
```javascript
// Already implemented! ✅
// Skips videos already in database
```

### **2. Reduce Search Results**
In `.env`:
```bash
# Fetch fewer videos per sync
YOUTUBE_SYNC_CATEGORIES_PER_RUN=5  # Down from 10
```

### **3. Increase Quality Threshold**
Only import high-quality videos:
```sql
-- Update quality threshold
UPDATE youtube_category_mappings
SET quality_threshold = '{
  "min_views": 10000,
  "min_likes_ratio": 0.9,
  "min_subscribers": 100000
}'::jsonb;
```

Filters out more videos = fewer API calls = less quota

---

## 📈 **Quota Usage Patterns**

### **Light Usage (< 1,000/day):**
```
- 1-2 category syncs/day
- Mostly cached data
- Very sustainable
```

### **Medium Usage (1,000-5,000/day):**
```
- 5-10 category syncs/day
- Mix of new and cached
- Sustainable
```

### **Heavy Usage (5,000-10,000/day):**
```
- 10-20 category syncs/day
- Lots of new content
- Hits limit by evening
- Need to optimize
```

### **Exceeded (>10,000/day):**
```
- What you hit today!
- Too many syncs
- Need daily limit or higher quota
```

---

## 🎯 **Recommendations for You**

Based on your usage today:

### **Short-term (Today/Tomorrow):**
1. ✅ Wait for quota reset (midnight PT)
2. ✅ Database error is fixed
3. ✅ Can resume syncing tomorrow

### **Medium-term (This Week):**
1. Reduce sync frequency:
   ```bash
   YOUTUBE_SYNC_CRON=0 3 * * *  # Once daily at 3 AM
   ```

2. Sync top 10 categories only:
   ```bash
   YOUTUBE_SYNC_CATEGORIES_PER_RUN=10
   ```

3. Monitor quota usage in admin panel

### **Long-term (Production):**
1. Request quota increase from Google
2. Implement smart caching (already done!)
3. Set up alerts when quota > 8,000
4. Consider premium YouTube API (if you scale big)

---

## 🚨 **Quota Reset Times**

**Daily reset:** Midnight Pacific Time (PST/PDT)

Convert to your timezone:
- **EST:** 3:00 AM
- **UTC:** 8:00 AM (PST) / 7:00 AM (PDT)
- **IST:** 1:30 PM (PST) / 12:30 PM (PDT)
- **Your timezone:** Check worldtimebuddy.com

**Pro tip:** Schedule your syncs right after reset time!

---

## ✅ **What's Working Now**

After our fixes:

1. ✅ Quota auto-resets daily in database
2. ✅ Tags error fixed (bulk import works)
3. ✅ Fallback to sequential import on error
4. ✅ Graceful handling of quota exceeded
5. ✅ News sync working (imported 2 articles!)

---

## 📞 **Need More Quota?**

If you need more than 10,000/day:

1. **Fill out form:** https://support.google.com/youtube/contact/yt_api_form
2. **Explain use case:** Educational astronomy platform
3. **Estimate needs:** e.g., 50,000 units/day
4. **Wait:** Usually 2-3 business days
5. **Usually approved** if reasonable use case

**Free up to 1 million/day** for legitimate educational use!

---

## 🎊 **Summary**

**What happened:**
- ✅ You synced lots of categories (good!)
- ⚠️ Hit Google's quota limit (normal)
- ❌ Had database error (now fixed!)

**What's fixed:**
- ✅ Database tags error
- ✅ Auto-reset quota tracker
- ✅ Graceful error handling

**What to do:**
- ⏰ Wait for quota reset tomorrow
- ⚙️ Reduce sync frequency
- 📈 Request higher quota for production

**You're all set!** 🚀
