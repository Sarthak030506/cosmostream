# 🔧 Fix: "Failed to fetch" Error

## What This Error Means

**"Failed to fetch"** means the frontend (Next.js at localhost:3000) **cannot connect** to the backend API (GraphQL at localhost:4000).

This is a **network connection issue**, not a code error.

---

## 🔍 Step-by-Step Debugging

### Step 1: Is the API Server Running?

Open a **NEW terminal** and run:

```bash
curl http://localhost:4000/health
```

**Expected result:**
```json
{"status":"ok","timestamp":"2025-10-09T..."}
```

**If you get an error like "Connection refused" or "Failed to connect":**
- ❌ The API server is NOT running
- ✅ **Fix:** Start the API server

```bash
cd C:\Users\hp\Desktop\CosmoStream\apps\api
npm run dev
```

Wait for this message:
```
🚀 Server ready at http://localhost:4000/graphql
```

---

### Step 2: Can You Access the GraphQL Endpoint?

Open your **web browser** and visit:

```
http://localhost:4000/graphql
```

**Expected result:**
- You should see Apollo GraphQL Playground (a GraphQL testing interface)

**If you see "This site can't be reached" or "Connection refused":**
- ❌ API server is not running or not on port 4000
- ✅ **Fix:** Check the API server terminal for errors

**If you see the GraphQL Playground:**
- ✅ API server is running correctly!
- The issue is in the frontend configuration

---

### Step 3: Check Frontend Environment Variables

```bash
cat apps/web/.env.local
```

**Expected contents:**
```
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:4001
```

**If the file doesn't exist or has wrong URL:**
- ❌ Frontend doesn't know where to find the API
- ✅ **Fix:** I already created this file, but verify it's correct

---

### Step 4: Check Browser Console for Detailed Error

1. Open the login page: http://localhost:3000/login
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Try to login again
5. Look for error messages

**Common errors you might see:**

#### Error: "net::ERR_CONNECTION_REFUSED"
**Cause:** API server is not running
**Fix:**
```bash
cd apps/api
npm run dev
```

#### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"
**Cause:** CORS is blocking the request
**Fix:** The API should already have CORS configured, but verify in `apps/api/.env`:
```
CORS_ORIGIN=http://localhost:3000
```

#### Error: "Failed to fetch" with no other details
**Cause:** Network request blocked or API server crashed
**Fix:** Check API server terminal for error messages

---

## 🎯 Quick Fix Checklist

Run these commands in order:

### 1. Check if API is running:
```bash
# Windows Command Prompt:
netstat -ano | findstr :4000

# Should show something like:
# TCP    0.0.0.0:4000    LISTENING    12345
```

**If nothing shows up:** API is not running

### 2. Check if Web server is running:
```bash
netstat -ano | findstr :3000

# Should show:
# TCP    0.0.0.0:3000    LISTENING    67890
```

### 3. Restart both servers:

**Terminal 1 - API:**
```bash
cd C:\Users\hp\Desktop\CosmoStream\apps\api
npm run dev
```

**Terminal 2 - Web:**
```bash
cd C:\Users\hp\Desktop\CosmoStream\apps\web
npm run dev
```

### 4. Wait for both to show "Ready":

**API should show:**
```
[info]: Database connection established
[info]: 🚀 Server ready at http://localhost:4000/graphql
```

**Web should show:**
```
✓ Ready on http://localhost:3000
```

### 5. Test again:
- Visit: http://localhost:3000/login
- Login with: viewer@cosmostream.com / password123

---

## 🔧 If API Server Won't Start

Check the API terminal for errors:

### Error: "Port 4000 already in use"
**Fix:**
```bash
# Kill the process using port 4000
netstat -ano | findstr :4000
taskkill /PID <PID_NUMBER> /F

# Then restart
npm run dev
```

### Error: "DATABASE_URL is not defined"
**Fix:**
```bash
# Make sure .env file exists
cd apps/api
ls .env

# If doesn't exist, create it:
cp .env.example .env
```

### Error: "SASL: SCRAM-SERVER-FIRST-MESSAGE"
**Fix:**
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Wait 10 seconds
timeout /t 10

# Restart API
npm run dev
```

---

## 🌐 Testing the Full Flow

Once both servers are running:

1. **Test API Health:**
   ```
   Open: http://localhost:4000/health
   Should see: {"status":"ok",...}
   ```

2. **Test GraphQL Playground:**
   ```
   Open: http://localhost:4000/graphql
   Should see: Apollo GraphQL interface
   ```

3. **Test Frontend:**
   ```
   Open: http://localhost:3000
   Should see: CosmoStream homepage
   ```

4. **Test Login:**
   ```
   Open: http://localhost:3000/login
   Email: viewer@cosmostream.com
   Password: password123
   Click: Sign In
   Should: Redirect to homepage with user menu
   ```

---

## 🔍 Advanced Debugging

### Test API with curl:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"{ videos { id title } }\"}"
```

**Expected:** JSON response with video data

### Test API with PowerShell:

```powershell
$body = @{
    query = "{ videos { id title } }"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/graphql" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

**Expected:** Video data

---

## 📊 Common Scenarios

### Scenario 1: Both servers running, still "Failed to fetch"

**Check:**
1. Browser console (F12) for CORS errors
2. API terminal for incoming request logs
3. Frontend .env.local has correct URL

**Fix:**
```bash
# Restart web server
cd apps/web
npm run dev
```

### Scenario 2: API crashes when login request comes in

**Check API terminal for:**
- Database errors → Fix database connection
- TypeScript errors → Check code for syntax errors
- Memory errors → Restart API

### Scenario 3: Login works but shows error after success

**Check:**
- Browser localStorage (F12 → Application → Local Storage)
- Should have: token, refreshToken, user
- If missing: Check login mutation in API

---

## ✅ Success Indicators

You know it's working when:

1. ✅ API terminal shows: `🚀 Server ready at http://localhost:4000/graphql`
2. ✅ Web terminal shows: `✓ Ready on http://localhost:3000`
3. ✅ http://localhost:4000/health returns `{"status":"ok"}`
4. ✅ http://localhost:4000/graphql shows GraphQL Playground
5. ✅ http://localhost:3000 shows homepage
6. ✅ Login page shows no "Failed to fetch" error
7. ✅ Login succeeds and redirects to homepage

---

## 🚀 Quick Start Commands

Copy and paste this to start everything:

```bash
# Terminal 1 - Databases
cd C:\Users\hp\Desktop\CosmoStream
docker-compose up -d postgres redis

# Terminal 2 - API (wait 10 seconds after starting databases)
cd C:\Users\hp\Desktop\CosmoStream\apps\api
npm run dev

# Terminal 3 - Web (wait for API to show "Server ready")
cd C:\Users\hp\Desktop\CosmoStream\apps\web
npm run dev
```

---

**Try these steps and let me know which step fails!** 🎯
