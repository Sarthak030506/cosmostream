# 🔧 Fix: Database Password Error

## The Error You're Seeing

```
SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
```

This error means the PostgreSQL client is not receiving the database password correctly from environment variables.

---

## ✅ What I Just Fixed

I made 3 important changes to ensure environment variables load properly:

### 1. **Moved dotenv to load FIRST** (`apps/api/src/index.ts`)
```typescript
// BEFORE (wrong):
import express from 'express';
import dotenv from 'dotenv';
dotenv.config(); // Too late!

// AFTER (correct):
import dotenv from 'dotenv';
dotenv.config(); // Load FIRST before other imports

import express from 'express';
// ... other imports
```

**Why?** If db/index.ts is imported before dotenv.config() runs, the DATABASE_URL will be undefined.

### 2. **Added SSL disable for local PostgreSQL** (`apps/api/src/db/index.ts`)
```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // Disable SSL for local development
});
```

**Why?** Local PostgreSQL doesn't use SSL, but pg client might try to use it.

### 3. **Added environment variable validation** (`apps/api/src/index.ts`)
```typescript
logger.info('Environment variables loaded:', {
  DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'NOT SET',
  REDIS_URL: process.env.REDIS_URL ? 'Set' : 'NOT SET',
});
```

**Why?** Now you can see if variables are actually loading.

---

## 🚀 How to Test the Fix

### Step 1: Stop the API Server
In the terminal running `npm run dev`, press:
```
Ctrl + C
```

### Step 2: Restart the API Server
```bash
cd C:\Users\hp\Desktop\CosmoStream\apps\api
npm run dev
```

### Step 3: Check the Logs
You should see:
```
[info]: Environment variables loaded: {
  NODE_ENV: 'development',
  DATABASE_URL: 'Set (hidden)',
  REDIS_URL: 'Set (hidden)',
  JWT_SECRET: 'Set (hidden)'
}
[info]: Database connection established
[info]: Redis connection established
[info]: 🚀 Server ready at http://localhost:4000/graphql
```

### Step 4: Test Login
1. Visit http://localhost:3000/login
2. Email: `viewer@cosmostream.com`
3. Password: `password123`
4. Click "Sign In"
5. **Should work!** ✅

---

## 🔍 If It Still Doesn't Work

### Check 1: Is the .env file in the right place?
```bash
# Should output the file contents:
cat apps/api/.env
```

**Expected:** Should show `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cosmostream`

**If you see "file not found":**
```bash
# Copy from example:
cp apps/api/.env.example apps/api/.env
```

### Check 2: Is PostgreSQL running?
```bash
docker ps | findstr postgres
```

**Expected:** Should show `cosmostream-postgres` with status "Up"

**If not running:**
```bash
docker-compose up -d postgres
timeout /t 10
```

### Check 3: Can you connect to PostgreSQL manually?
```bash
docker exec -it cosmostream-postgres psql -U postgres -d cosmostream -c "SELECT 1;"
```

**Expected:** Should output `1`

**If error:** PostgreSQL isn't running or has wrong credentials

### Check 4: Check the exact DATABASE_URL
```bash
# Windows PowerShell:
cd apps/api
Get-Content .env | Select-String "DATABASE_URL"
```

**Expected:** `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cosmostream`

**If different:** Edit `apps/api/.env` and fix it

---

## 🛠️ Alternative Fix (Nuclear Option)

If the error persists, try this:

### Option 1: Hardcode the connection (temporary)
Edit `apps/api/src/db/index.ts`:

```typescript
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'cosmostream',
  user: 'postgres',
  password: 'postgres',
  min: 2,
  max: 10,
  ssl: false,
});
```

This bypasses the connectionString completely.

### Option 2: Update the dev script
Edit `apps/api/package.json`:

```json
{
  "scripts": {
    "dev": "tsx watch --env-file=.env src/index.ts"
  }
}
```

This forces tsx to load the .env file.

### Option 3: Use node directly
```bash
cd apps/api
node --env-file=.env -r tsx/register --watch src/index.ts
```

---

## 📊 Understanding the Error

The error happens in this flow:

```
1. API starts → index.ts loads
2. imports db/index.ts
3. db/index.ts creates Pool with process.env.DATABASE_URL
4. If DATABASE_URL is undefined → Pool gets { connectionString: undefined }
5. pg library tries to connect
6. Needs password but connectionString is undefined
7. Password becomes undefined instead of string
8. ERROR: "client password must be a string"
```

**Fix:** Ensure `dotenv.config()` runs **before** any imports that use process.env

---

## ✅ Verification Checklist

After restarting the API:

- [ ] Log shows "Environment variables loaded: { DATABASE_URL: 'Set (hidden)' }"
- [ ] Log shows "Database connection established"
- [ ] Log shows "Redis connection established"
- [ ] Log shows "🚀 Server ready at http://localhost:4000/graphql"
- [ ] No errors in the console
- [ ] Can login at http://localhost:3000/login
- [ ] Login redirects to homepage with user menu

If ALL checkboxes are checked → **FIXED!** ✅

---

## 🎯 Quick Test Command

Run this to test database connection:

```bash
# Test PostgreSQL directly:
docker exec cosmostream-postgres psql -U postgres -d cosmostream -c "SELECT email, name FROM users LIMIT 3;"

# Expected output:
#         email            |      name
# -------------------------+----------------
#  admin@cosmostream.com   | Admin User
#  creator@cosmostream.com | Dr. Jane Smith
#  viewer@cosmostream.com  | John Doe
```

If this works, PostgreSQL is fine. The issue is purely environment variable loading in Node.js.

---

## 🚨 Common Mistakes

1. **Running from wrong directory:**
   ```bash
   # WRONG:
   cd C:\Users\hp\Desktop\CosmoStream
   npm run dev  # Doesn't load apps/api/.env

   # RIGHT:
   cd C:\Users\hp\Desktop\CosmoStream\apps\api
   npm run dev  # Loads .env from current directory
   ```

2. **Having spaces in .env file:**
   ```bash
   # WRONG:
   DATABASE_URL = postgresql://...  # Spaces around =

   # RIGHT:
   DATABASE_URL=postgresql://...  # No spaces
   ```

3. **Using wrong password in .env:**
   ```bash
   # Check docker-compose.yml for correct password:
   cat docker-compose.yml | findstr POSTGRES_PASSWORD
   # Should show: POSTGRES_PASSWORD: postgres

   # Then .env should have:
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cosmostream
   #                                   ^^^^^^^^ this password
   ```

---

## 🎉 After It's Fixed

Once working, you'll be able to:

- ✅ Login/Signup users
- ✅ Browse videos
- ✅ Watch videos
- ✅ View user profiles
- ✅ Access all GraphQL queries

---

**Try restarting the API server now!** The fixes should resolve the error. 🚀
