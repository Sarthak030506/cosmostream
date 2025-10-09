# How to Start CosmoStream - Clear Instructions

## ❌ Common Confusion

**DON'T run in Docker terminal!**

The `QUICK_START.bat` file should run in:
- ✅ Windows Command Prompt
- ✅ Windows PowerShell
- ✅ Windows Terminal
- ❌ NOT Docker terminal/console

## ✅ Correct Way to Start

### Method 1: Double-Click (Easiest)

1. Open File Explorer
2. Navigate to: `C:\Users\hp\Desktop\CosmoStream`
3. **Double-click** `QUICK_START.bat`
4. Follow the prompts

### Method 2: Windows Command Prompt

1. Press `Win + R`
2. Type: `cmd`
3. Press Enter
4. Run:
   ```cmd
   cd C:\Users\hp\Desktop\CosmoStream
   QUICK_START.bat
   ```

### Method 3: PowerShell

1. Press `Win + X`
2. Select "Windows PowerShell" or "Terminal"
3. Run:
   ```powershell
   cd C:\Users\hp\Desktop\CosmoStream
   .\QUICK_START.bat
   ```

## 🔄 Current Status - What You Need to Do First

Before running `QUICK_START.bat`, you must complete these steps:

### Step 1: Install Ubuntu (Still Pending)

**Open PowerShell as Administrator**:
```powershell
wsl --install -d Ubuntu-24.04
```

When prompted:
- Enter username: `dev` (or any name you like)
- Enter password: (choose any password)
- Re-enter password

**Wait for installation to complete** (~5 minutes)

### Step 2: Configure WSL2

Still in **PowerShell as Administrator**:
```powershell
wsl --set-default-version 2
wsl --set-version Ubuntu-24.04 2
```

### Step 3: Verify WSL Installation

```powershell
wsl --list --verbose
```

Should show:
```
  NAME            STATE           VERSION
* Ubuntu-24.04    Running         2
```

### Step 4: Restart Docker Desktop

```powershell
# Stop Docker
taskkill /F /IM "Docker Desktop.exe"
taskkill /F /IM "com.docker.backend.exe"

# Wait 5 seconds
timeout /t 5

# Start Docker Desktop
& "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

**Wait 60 seconds** for Docker to fully start. The Docker icon in your system tray should turn **green**.

### Step 5: Verify Docker Works

```powershell
docker --version
docker ps
```

If these commands work without errors, Docker is ready! ✅

### Step 6: NOW Run QUICK_START.bat

**Open regular Command Prompt** (not as Admin, not Docker terminal):

```cmd
cd C:\Users\hp\Desktop\CosmoStream
QUICK_START.bat
```

## 🎯 What QUICK_START.bat Does

The script will:
1. ✅ Check if WSL distribution exists
2. ✅ Check if Docker is running
3. 🚀 Start PostgreSQL and Redis containers
4. ⏳ Wait 15 seconds for databases to initialize
5. 🌐 Start API server (http://localhost:4000)
6. 🌐 Start Frontend (http://localhost:3000)
7. 📊 Show logs

## 📝 Manual Alternative (If Batch File Doesn't Work)

If the batch file gives errors, run manually:

```bash
# 1. Start databases
docker-compose up -d postgres redis

# 2. Wait 15 seconds
timeout /t 15

# 3. Start API (in one terminal)
cd apps/api
npm run dev

# 4. Start Frontend (in another terminal)
cd apps/web
npm run dev
```

## 🔍 Troubleshooting

### Error: "No WSL distribution found"

You haven't installed Ubuntu yet. Run:
```powershell
wsl --install -d Ubuntu-24.04
```

### Error: "Docker is not running"

1. Make sure Docker Desktop is open
2. Wait for green icon in system tray
3. Test with: `docker ps`

### Error: "Cannot find path"

Make sure you're in the correct directory:
```cmd
cd C:\Users\hp\Desktop\CosmoStream
```

### Error: "npm is not recognized"

Node.js might not be in PATH. Restart your terminal or computer.

## 📊 Current Progress Checklist

Before starting CosmoStream:

- [ ] Ubuntu WSL installed (`wsl --install -d Ubuntu-24.04`)
- [ ] WSL2 configured (`wsl --set-version Ubuntu-24.04 2`)
- [ ] Docker Desktop restarted
- [ ] Docker running (`docker ps` works)
- [ ] In correct directory (`C:\Users\hp\Desktop\CosmoStream`)
- [ ] Run `QUICK_START.bat` from Windows terminal

## 🎓 Understanding the Setup

**What terminals exist:**

1. **Windows Command Prompt** (`cmd.exe`)
   - Standard Windows terminal
   - Use this for batch files ✅

2. **PowerShell** (`powershell.exe`)
   - Advanced Windows terminal
   - Use this for admin commands ✅

3. **WSL/Ubuntu Terminal** (`wsl.exe` or Ubuntu app)
   - Linux terminal inside Windows
   - Used by Docker internally
   - Don't use this for starting the app ❌

4. **Docker Desktop Console**
   - Docker's internal terminal
   - Don't use this for starting the app ❌

## 🚀 Quick Command Reference

**From Windows Command Prompt or PowerShell:**

```bash
# Check WSL
wsl --list --verbose

# Check Docker
docker ps

# Start CosmoStream
cd C:\Users\hp\Desktop\CosmoStream
QUICK_START.bat

# OR manually
docker-compose up -d
npm run dev

# Stop everything
docker-compose down
Ctrl+C (in dev server windows)
```

## 🎉 Success Indicators

You'll know it's working when you see:

1. ✅ QUICK_START.bat says "CosmoStream is starting!"
2. ✅ Two command windows open (API and Web)
3. ✅ Browser opens to http://localhost:3000
4. ✅ You can see the CosmoStream homepage

## 📞 Still Confused?

**Right now, you should:**

1. Open **PowerShell as Administrator**
2. Run: `wsl --install -d Ubuntu-24.04`
3. Follow the Ubuntu setup prompts
4. Come back to this guide after that completes

**Then:**

1. Open **regular Command Prompt** (Win+R → cmd)
2. Run: `cd C:\Users\hp\Desktop\CosmoStream`
3. Run: `QUICK_START.bat`

That's it! 🎯
