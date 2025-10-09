# Testing Guide - Phase 1 Pages

## 🚀 Quick Start

### 1. Start All Services

Open **3 terminals** and run:

**Terminal 1 - Database Services:**
```bash
cd C:\Users\hp\Desktop\CosmoStream
docker-compose up -d postgres redis
```

**Terminal 2 - API Server:**
```bash
cd C:\Users\hp\Desktop\CosmoStream\apps\api
npm run dev
```
Wait until you see: `🚀 Server ready at http://localhost:4000/graphql`

**Terminal 3 - Web Server:**
```bash
cd C:\Users\hp\Desktop\CosmoStream\apps\web
npm run dev
```
Wait until you see: `✓ Ready on http://localhost:3000`

---

## 🧪 Test Each Page

### Test 1: Homepage
**URL:** `http://localhost:3000`

**What to Check:**
- ✅ Hero section displays
- ✅ Featured videos section shows 3 videos
- ✅ Features section displays
- ✅ Navigation bar has "Browse", "Sign In", "Get Started" buttons
- ✅ Footer has links

**Expected:** Beautiful space-themed homepage with gradient backgrounds

---

### Test 2: Login Page
**URL:** `http://localhost:3000/login`

**What to Check:**
- ✅ Login form displays
- ✅ Demo account credentials are shown
- ✅ "Sign up for free" link works

**Test Login:**
1. Enter email: `viewer@cosmostream.com`
2. Enter password: `password123`
3. Click "Sign In"
4. **Expected:** Redirect to homepage with your name in navigation

**Test Error Handling:**
1. Try wrong password
2. **Expected:** Red error message appears

---

### Test 3: Signup Page
**URL:** `http://localhost:3000/signup`

**What to Check:**
- ✅ All form fields display
- ✅ Benefits section shows
- ✅ "Sign in" link works

**Test Signup:**
1. Name: `Test User`
2. Email: `test@example.com`
3. Password: `password123`
4. Confirm: `password123`
5. Check terms checkbox
6. Click "Create Account"
7. **Expected:** Account created, logged in, redirected to homepage

**Test Validation:**
1. Try password less than 8 characters
2. **Expected:** Error message
3. Try mismatched passwords
4. **Expected:** Error message

---

### Test 4: Browse Page
**URL:** `http://localhost:3000/browse`

**What to Check:**
- ✅ Video grid displays 3 sample videos
- ✅ Search bar works
- ✅ Category filters display
- ✅ Difficulty filters display

**Test Search:**
1. Type "Black Hole" in search bar
2. **Expected:** Only "Journey to a Black Hole" video shows

**Test Category Filter:**
1. Click "Astronomy" category
2. **Expected:** Videos filter by category

**Test Difficulty Filter:**
1. Click "Beginner" difficulty
2. **Expected:** Videos filter by difficulty

**Test Video Card Click:**
1. Click any video card
2. **Expected:** Navigate to video watch page

---

### Test 5: Video Watch Page
**URL:** `http://localhost:3000/video/00000000-0000-0000-0000-000000000001`

**What to Check:**
- ✅ Video player area displays
- ✅ Video title shows: "The Universe: A Journey Through Space and Time"
- ✅ Creator info shows: "Dr. Jane Smith"
- ✅ View count displays
- ✅ Description shows
- ✅ Tags display
- ✅ Category badge shows
- ✅ Like/Save/Share buttons display

**Other Test Videos:**
- Video 2: `/video/00000000-0000-0000-0000-000000000002`
- Video 3: `/video/00000000-0000-0000-0000-000000000003`

**Test Invalid Video:**
- Visit: `/video/99999999-9999-9999-9999-999999999999`
- **Expected:** "Video Not Found" error page

---

### Test 6: User Menu (After Login)

**After logging in, check navigation bar:**

**What to Check:**
- ✅ User avatar with first letter of name displays
- ✅ User name displays next to avatar
- ✅ Click on name opens dropdown menu

**Dropdown Menu Items:**
- ✅ Profile (not built yet)
- ✅ Settings (not built yet)
- ✅ Creator Dashboard (only if creator role)
- ✅ Sign Out (works - clears auth and redirects)

**Test Logout:**
1. Click your name in navigation
2. Click "Sign Out"
3. **Expected:** Redirected to homepage, navigation shows "Sign In" again

---

## 🎯 Complete Test Flow

**Full User Journey:**

1. **Start:** Visit homepage (`/`)
2. **Browse:** Click "Browse" → See video grid
3. **Search:** Search for "Mars" → Filter results
4. **Watch:** Click video → View video page
5. **Login:** Click "Sign In" → Login page → Enter credentials
6. **Logged In:** See user menu in navigation
7. **Profile:** Click user menu → See options
8. **Logout:** Click "Sign Out" → Logged out

---

## 🐛 Known Issues / Limitations

### Expected Behaviors:

1. **Video Playback:**
   - Videos show placeholder/poster only
   - Reason: AWS MediaConvert not configured
   - Fix: Configure AWS credentials in `.env`

2. **Related Videos:**
   - Shows "More videos coming soon"
   - Reason: Recommendation algorithm not implemented yet

3. **Comments:**
   - Shows "Comments feature coming soon"
   - Reason: Comments system not built yet

4. **Profile/Settings Pages:**
   - Links exist but pages not built yet
   - Coming in Phase 2

---

## ✅ Success Criteria

**All tests pass if:**

✅ All 5 pages load without errors
✅ Login/Signup authentication works
✅ Videos display in browse page
✅ Video watch page shows all metadata
✅ User menu appears after login
✅ Logout clears authentication
✅ Navigation between pages works smoothly
✅ No console errors in browser
✅ Responsive design works on mobile

---

## 🎨 Visual Checklist

**Design Elements to Verify:**

- ✅ Dark space theme (black/purple/pink gradients)
- ✅ Glass morphism effects (blurred backgrounds)
- ✅ Smooth hover animations
- ✅ Gradient buttons (cosmos to nebula)
- ✅ Rounded corners on cards
- ✅ Proper spacing and typography
- ✅ Mobile responsive (try resizing browser)

---

## 📊 Expected Data

**From Database Seeds:**

**Users (3 total):**
1. viewer@cosmostream.com (Viewer role)
2. creator@cosmostream.com (Creator role)
3. admin@cosmostream.com (Admin role)

**Videos (3 total):**
1. "The Universe: A Journey Through Space and Time" (Beginner, Astronomy)
2. "Journey to a Black Hole" (Intermediate, Astrophysics)
3. "Mars: The Red Planet" (Beginner, Planetary Science)

**Forum Threads (1 total):**
1. "Best telescope for beginners?" with 2 posts

---

## 🔍 Debugging Tips

### If something doesn't work:

**Check API Server:**
```bash
# Terminal should show:
GraphQL server ready at http://localhost:4000/graphql
```

**Check Web Server:**
```bash
# Terminal should show:
✓ Ready on http://localhost:3000
```

**Check Browser Console:**
- Press F12 to open DevTools
- Look for errors in Console tab
- Check Network tab for failed requests

**Check Database:**
```bash
# Connect to PostgreSQL
docker exec -it cosmostream-postgres-1 psql -U postgres -d cosmostream

# Check users
SELECT id, email, name, role FROM users;

# Check videos
SELECT id, title, status FROM videos;
```

**Clear Cache:**
1. Clear browser localStorage
2. Hard refresh: Ctrl+Shift+R
3. Restart dev servers

---

## 🎓 GraphQL Playground

Test API directly at: `http://localhost:4000/graphql`

**Example Queries:**

```graphql
# Get all videos
query {
  videos(limit: 10) {
    id
    title
    creator {
      name
    }
  }
}

# Login
mutation {
  login(email: "viewer@cosmostream.com", password: "password123") {
    token
    user {
      id
      name
      email
    }
  }
}

# Get specific video
query {
  video(id: "00000000-0000-0000-0000-000000000001") {
    id
    title
    description
    views
  }
}
```

---

## 📸 Screenshot Checklist

Take screenshots of these for documentation:

1. ✅ Homepage hero section
2. ✅ Login page
3. ✅ Browse page with video grid
4. ✅ Video watch page
5. ✅ User menu dropdown (logged in state)
6. ✅ Mobile view (responsive design)

---

## 🚀 Performance Check

**Expected Load Times:**
- Homepage: < 1 second
- Browse page: < 2 seconds (loading 3 videos)
- Video page: < 1 second
- Login/Signup: < 500ms

**Build Size:**
- Homepage: ~98 KB (First Load JS)
- Browse: ~130 KB
- Video: ~131 KB
- Login: ~117 KB

---

## ✨ Ready to Test!

Open `http://localhost:3000` and start exploring! 🌌🚀

All 4 new pages are fully functional and integrated with the GraphQL API.
