# Fix Docker Desktop - WSL2 Required

## 🔍 Problem Detected

Docker Desktop is running but WSL2 (Windows Subsystem for Linux) is not installed.

**Current Status:**
- ✅ Docker Desktop processes running
- ❌ WSL2 not installed
- ❌ Docker engine cannot start without WSL2

## 🔧 Solution: Install WSL2

### Option 1: Quick Install (Recommended)

**Run PowerShell as Administrator** and execute:

```powershell
wsl --install
```

Then **restart your computer**.

### Option 2: Manual Installation

If the quick install doesn't work, follow these steps:

#### Step 1: Enable WSL

Open **PowerShell as Administrator** and run:

```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
```

#### Step 2: Enable Virtual Machine Platform

```powershell
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

#### Step 3: Restart Your Computer

**Important**: You must restart before continuing.

#### Step 4: Download WSL2 Kernel Update

After restart, download and install:
- https://aka.ms/wsl2kernel

Or run in PowerShell (as Admin):

```powershell
wsl --update
```

#### Step 5: Set WSL2 as Default

```powershell
wsl --set-default-version 2
```

#### Step 6: Install Ubuntu (Optional but Recommended)

```powershell
wsl --install -d Ubuntu
```

Or install from Microsoft Store:
- https://aka.ms/wslstore

### Option 3: Use Hyper-V Instead (If WSL2 Fails)

If WSL2 installation fails, you can switch Docker to Hyper-V:

1. **Enable Hyper-V**

   Run PowerShell as Administrator:
   ```powershell
   Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
   ```

2. **Restart Computer**

3. **Configure Docker Desktop**
   - Open Docker Desktop
   - Go to Settings → General
   - Uncheck "Use the WSL 2 based engine"
   - Click "Apply & Restart"

## ✅ Verify Installation

After restart and WSL2 installation:

```bash
# Check WSL version
wsl --list --verbose

# Should show Ubuntu or another distro running WSL 2
```

## 🚀 Start Docker Desktop Again

```bash
# Start Docker Desktop
"C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Wait for Docker to start (green icon in system tray)

# Verify Docker is running
docker --version
docker ps
```

## 🎯 Alternative: Run Without Docker

If you want to continue without waiting for Docker setup:

### Option A: Use Online PostgreSQL/Redis

1. **Supabase (Free PostgreSQL)**
   - Sign up: https://supabase.com
   - Create a project
   - Copy connection string
   - Update `apps/api/.env.local`

2. **Redis Cloud (Free Redis)**
   - Sign up: https://redis.com/try-free
   - Create database
   - Copy connection string
   - Update `apps/api/.env.local`

### Option B: Frontend Development Only

You can start with just the frontend:

```bash
cd apps/web
npm run dev
```

The frontend will run on http://localhost:3000 (with mock data).

### Option C: Windows Native Services

Install services directly on Windows:

1. **PostgreSQL**
   - Download: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   - Install PostgreSQL 15
   - Remember the password you set

2. **Redis**
   - Download: https://github.com/tporadowski/redis/releases
   - Extract and run `redis-server.exe`

3. **Update Environment Files**
   ```bash
   # In apps/api/.env.local
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/cosmostream
   REDIS_URL=redis://localhost:6379
   ```

4. **Initialize Database**
   ```bash
   # Using psql (comes with PostgreSQL)
   psql -U postgres -c "CREATE DATABASE cosmostream;"
   psql -U postgres -d cosmostream -f database/schema.sql
   psql -U postgres -d cosmostream -f database/seeds/dev_data.sql
   ```

## 📝 Quick Fix Summary

**Best Solution** (Recommended):
1. Run PowerShell as Admin
2. Execute: `wsl --install`
3. Restart computer
4. Start Docker Desktop
5. Run: `docker-compose up -d && npm run dev`

**Quick Solution** (Skip Docker for now):
1. Run frontend only: `cd apps/web && npm run dev`
2. Access: http://localhost:3000

## ⚙️ Check System Requirements

### Windows Requirements for Docker Desktop

- **Windows 10/11**: Version 1903 or higher
- **Architecture**: 64-bit processor with SLAT
- **Memory**: 4GB RAM minimum
- **BIOS**: Virtualization enabled

### Check Virtualization

1. Open Task Manager (Ctrl+Shift+Esc)
2. Go to Performance tab
3. Click on CPU
4. Check "Virtualization: Enabled"

If disabled:
- Restart computer
- Enter BIOS (usually F2, F10, or Del during boot)
- Enable Intel VT-x or AMD-V
- Save and exit

## 🆘 Still Having Issues?

### Error: "Docker Desktop starting..." (stuck)

**Solution 1**: Reset Docker
```powershell
# Kill all Docker processes
taskkill /F /IM "Docker Desktop.exe"
taskkill /F /IM "com.docker.backend.exe"

# Delete Docker data (backup first!)
Remove-Item -Recurse -Force "$env:APPDATA\Docker"
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\Docker"

# Restart Docker Desktop
& "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

**Solution 2**: Reinstall Docker Desktop
1. Uninstall Docker Desktop
2. Restart computer
3. Install latest version: https://www.docker.com/products/docker-desktop

### Error: "WSL 2 installation is incomplete"

Run in PowerShell (Admin):
```powershell
wsl --update
wsl --shutdown
wsl --unregister Ubuntu
wsl --install -d Ubuntu
```

## 📞 Need Help?

1. **Check Docker Desktop Logs**
   - Click Docker icon in system tray
   - Troubleshoot → Show logs

2. **Windows Event Viewer**
   - Look for Docker-related errors

3. **Docker Community**
   - https://forums.docker.com

## ✅ Next Steps After Fix

Once Docker is running:

```bash
cd C:\Users\hp\Desktop\CosmoStream

# Start services
docker-compose up -d

# Start development
npm run dev

# Access application
# Frontend: http://localhost:3000
# API: http://localhost:4000/graphql
```

Good luck! 🚀
