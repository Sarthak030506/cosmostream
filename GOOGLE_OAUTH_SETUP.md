# Google OAuth Setup Guide for CosmoStream

## 🎯 Quick Setup (5 Minutes)

Follow these steps to enable "Sign in with Google" on your CosmoStream application.

---

## Step 1: Go to Google Cloud Console

1. Open your browser and go to: **https://console.cloud.google.com/**
2. Sign in with your Google account (any Google account works)

---

## Step 2: Create a New Project

1. Click the **project dropdown** at the top (next to "Google Cloud")
2. Click **"NEW PROJECT"** button (top right)
3. Enter project details:
   - **Project Name**: `CosmoStream` (or any name you like)
   - **Organization**: Leave as default (No organization)
4. Click **"CREATE"**
5. Wait a few seconds for the project to be created
6. **Select your new project** from the project dropdown

---

## Step 3: Enable Google+ API

1. In the left sidebar, click **"APIs & Services"** → **"Library"**
   - Or use the search bar and type "API Library"
2. Search for **"Google+ API"**
3. Click on **"Google+ API"**
4. Click **"ENABLE"** button
5. Wait for it to enable (should take ~5 seconds)

---

## Step 4: Configure OAuth Consent Screen

1. In the left sidebar, click **"OAuth consent screen"**
2. Select **"External"** (allows anyone with a Google account to sign in)
3. Click **"CREATE"**

### Fill in the required fields:

**App Information:**
- **App name**: `CosmoStream`
- **User support email**: Select your email from dropdown
- **App logo**: Skip for now (optional)

**App domain (Optional for development):**
- Leave blank for now

**Developer contact information:**
- **Email addresses**: Enter your email address

4. Click **"SAVE AND CONTINUE"**

### Scopes Page:
5. Click **"ADD OR REMOVE SCOPES"**
6. Check these scopes:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
7. Click **"UPDATE"**
8. Click **"SAVE AND CONTINUE"**

### Test Users Page (Optional for development):
9. Click **"ADD USERS"**
10. Add your email address (so you can test)
11. Click **"ADD"**
12. Click **"SAVE AND CONTINUE"**

### Summary Page:
13. Review and click **"BACK TO DASHBOARD"**

---

## Step 5: Create OAuth 2.0 Credentials

1. In the left sidebar, click **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**

### Configure OAuth Client:

**Application type:**
- Select **"Web application"**

**Name:**
- Enter: `CosmoStream Web Client`

**Authorized JavaScript origins:**
- Click **"+ ADD URI"**
- Enter: `http://localhost:3000`
- Click **"+ ADD URI"** again
- Enter: `http://localhost:4000`

**Authorized redirect URIs:**
- Click **"+ ADD URI"**
- Enter: `http://localhost:4000/auth/google/callback`

4. Click **"CREATE"**

---

## Step 6: Copy Your Credentials

A popup will appear with your credentials:

1. **Copy the Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
2. **Copy the Client Secret** (looks like: `GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ`)

⚠️ **IMPORTANT**: Keep these credentials safe! Don't share them publicly.

---

## Step 7: Add Credentials to Your API

1. Open your code editor
2. Navigate to: `C:\Users\hp\Desktop\CosmoStream\apps\api\.env`
3. Find these lines:
   ```env
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   ```
4. **Paste your credentials**:
   ```env
   GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ
   ```
5. **Save the file** (Ctrl+S)

---

## Step 8: Restart Your API Server

The API server needs to reload the new environment variables:

1. Go to the terminal running your API server
2. Press **Ctrl+C** to stop the server
3. Start it again:
   ```bash
   cd apps/api
   npm run dev
   ```

You should see:
```
✅ Google OAuth configured and enabled
🚀 Server ready at http://localhost:4000/graphql
```

---

## Step 9: Test Google Sign-In

1. Open your browser
2. Go to: `http://localhost:3000/login`
3. Click **"Login with Google"** button
4. You'll be redirected to Google sign-in
5. Sign in with your Google account
6. Grant permissions to CosmoStream
7. You'll be redirected back to CosmoStream, **logged in!** ✅

---

## 🎉 Success Checklist

After completing setup, verify:

- ✅ Google Cloud Console project created
- ✅ Google+ API enabled
- ✅ OAuth consent screen configured
- ✅ OAuth credentials created
- ✅ Client ID and Secret added to `.env`
- ✅ API server restarted
- ✅ Console shows: "✅ Google OAuth configured and enabled"
- ✅ "Login with Google" button works on login page
- ✅ "Sign up with Google" button works on signup page

---

## 🔧 Troubleshooting

### Error: "OAuth2Strategy requires a clientID option"
**Solution**: Make sure you added the credentials to `apps/api/.env` and restarted the API server.

### Error: "Redirect URI mismatch"
**Solution**:
1. Go back to Google Cloud Console
2. Credentials → Click your OAuth client
3. Add this exact URI: `http://localhost:4000/auth/google/callback`
4. Save changes
5. Try again (may take 1-2 minutes to update)

### Error: "Access blocked: This app's request is invalid"
**Solution**:
1. Go to OAuth consent screen in Google Console
2. Make sure you added your email as a test user
3. Make sure all required fields are filled

### Google sign-in page doesn't open
**Solution**:
1. Check browser console for errors (F12)
2. Verify API_URL is set correctly in `.env`:
   ```env
   API_URL=http://localhost:4000
   ```

---

## 📱 For Production Deployment

When you deploy to production, you'll need to:

1. Go back to Google Cloud Console
2. Update **Authorized redirect URIs**:
   - Add: `https://your-api-domain.com/auth/google/callback`
3. Update **Authorized JavaScript origins**:
   - Add: `https://your-web-domain.com`
4. Update your production `.env` file with the same credentials
5. Update these environment variables:
   ```env
   API_URL=https://your-api-domain.com
   WEB_URL=https://your-web-domain.com
   ```

---

## 🔐 Security Notes

- ✅ OAuth Client Secret should **never** be committed to git
- ✅ It's already in `.gitignore` (`.env` files are ignored)
- ✅ Each environment (dev/production) should have its own credentials
- ✅ Users' Google passwords are never exposed to your app
- ✅ You only receive their email and name

---

## ❓ Need Help?

If you get stuck:
1. Check the troubleshooting section above
2. Review the error message in the console
3. Verify all redirect URIs match exactly
4. Try in an incognito window (clears cookies/cache)

---

**Setup Time**: ~5 minutes
**Difficulty**: Easy ⭐
**Status**: Ready to use!

---

Last updated: 2025-10-19
