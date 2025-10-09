# Setup WSL2 and Docker - Step by Step

## Current Status
✅ WSL is installed
❌ No Linux distribution installed
❌ Docker cannot start without a WSL distribution

## 🚀 Quick Fix (5 minutes)

### Step 1: Install Ubuntu

Open **PowerShell as Administrator** and run:

```powershell
wsl --install -d Ubuntu-24.04
```

This will:
- Download Ubuntu 24.04 LTS (~500MB)
- Install it automatically
- Set it as default WSL distribution

**Wait for installation to complete** (3-5 minutes)

### Step 2: Set Up Ubuntu

After installation, Ubuntu will launch automatically and ask:

```
Enter new UNIX username:
```

**Choose a simple username** (e.g., `dev` or your name, lowercase, no spaces)

```
New password:
```

**Choose a password** (you'll need this for sudo commands)

### Step 3: Set WSL2 as Default

In PowerShell (Admin):

```powershell
wsl --set-default-version 2
wsl --set-version Ubuntu-24.04 2
```

### Step 4: Verify Installation

```powershell
wsl --list --verbose
```

Should show:
```
  NAME            STATE           VERSION
* Ubuntu-24.04    Running         2
```

### Step 5: Restart Docker Desktop

**Close Docker Desktop completely**:
```powershell
taskkill /F /IM "Docker Desktop.exe"
taskkill /F /IM "com.docker.backend.exe"
```

**Start Docker Desktop again**:
```powershell
& "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

**Wait 30-60 seconds** for Docker to start. Watch the system tray icon - it should turn green.

### Step 6: Verify Docker Works

```bash
docker --version
docker ps
docker run hello-world
```

If you see "Hello from Docker!" - **SUCCESS!** ✅

### Step 7: Start CosmoStream

```bash
cd C:\Users\hp\Desktop\CosmoStream
docker-compose up -d
npm run dev
```

Access:
- Frontend: http://localhost:3000
- GraphQL: http://localhost:4000/graphql

## 🎯 Complete Commands (Copy-Paste)

**Run these in PowerShell as Administrator:**

```powershell
# 1. Install Ubuntu
wsl --install -d Ubuntu-24.04

# 2. Wait for setup to complete, then set WSL2
wsl --set-default-version 2
wsl --set-version Ubuntu-24.04 2

# 3. Verify
wsl --list --verbose

# 4. Restart Docker
taskkill /F /IM "Docker Desktop.exe"
taskkill /F /IM "com.docker.backend.exe"
& "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# 5. Wait 60 seconds, then test
timeout /t 60
docker --version
docker ps
```

**Then in regular terminal:**

```bash
cd C:\Users\hp\Desktop\CosmoStream
docker-compose up -d
npm run dev
```

## ⚡ Alternative: Quick Test with Lightweight Distro

If Ubuntu download is slow, try Debian (smaller):

```powershell
wsl --install -d Debian
wsl --set-default-version 2
```

## 🔧 Troubleshooting

### Issue: "Installing, this may take a few minutes..."

This is normal. Ubuntu is ~500MB. Wait for it to complete.

### Issue: WSL2 kernel update required

Run:
```powershell
wsl --update
```

Then restart:
```powershell
wsl --shutdown
```

### Issue: Docker still won't start

1. **Check Docker Desktop Settings**
   - Open Docker Desktop
   - Go to Settings → General
   - Ensure "Use the WSL 2 based engine" is **checked**
   - Click "Apply & Restart"

2. **Check WSL Integration**
   - Settings → Resources → WSL Integration
   - Enable "Ubuntu-24.04"
   - Click "Apply & Restart"

### Issue: "The system cannot find the file specified"

Your Windows version might not support WSL2. Check:
- Windows 10: Must be version 1903 or higher
- Windows 11: All versions supported

Update Windows if needed.

## 🎓 Understanding What We're Doing

**Why do we need this?**
- Docker Desktop on Windows uses WSL2 to run Linux containers
- WSL2 needs a Linux distribution installed
- Once installed, Docker can use it as its backend

**What is WSL2?**
- Windows Subsystem for Linux (version 2)
- Lets you run Linux on Windows
- Docker uses it to run containers efficiently

## ✅ Expected Timeline

- **Ubuntu installation**: 3-5 minutes
- **Ubuntu setup**: 1 minute (create username/password)
- **Docker restart**: 30-60 seconds
- **Total time**: ~5-7 minutes

## 🚦 How to Know It's Working

### Green Lights ✅
1. `wsl --list --verbose` shows Ubuntu with VERSION 2
2. Docker Desktop system tray icon is **green**
3. `docker ps` command works without errors
4. `docker-compose up -d` starts containers

### Red Flags ❌
1. Docker icon stays orange/yellow
2. `docker ps` gives connection errors
3. WSL shows VERSION 1 instead of 2

## 📱 Quick Status Check

Run this command to check everything:

```powershell
Write-Host "=== WSL Status ===" -ForegroundColor Cyan
wsl --list --verbose

Write-Host "`n=== Docker Status ===" -ForegroundColor Cyan
docker info

Write-Host "`n=== All Good! ===" -ForegroundColor Green
```

## 🎉 Success Checklist

After completing all steps, verify:

- [ ] WSL Ubuntu installed and running
- [ ] WSL version is 2 (not 1)
- [ ] Docker Desktop is running (green icon)
- [ ] `docker ps` works
- [ ] `docker-compose ps` works
- [ ] Services started: `docker-compose up -d`
- [ ] Frontend accessible: http://localhost:3000
- [ ] API accessible: http://localhost:4000/graphql

## 🆘 Still Stuck?

If nothing works, try the **frontend-only** approach:

```bash
cd C:\Users\hp\Desktop\CosmoStream\apps\web
npm run dev
```

You can develop the UI while troubleshooting Docker separately.

---

**Next Step**: Run `wsl --install -d Ubuntu-24.04` in PowerShell (Admin) and follow the prompts! 🚀
