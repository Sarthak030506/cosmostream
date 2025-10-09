@echo off
echo ======================================
echo CosmoStream Quick Start
echo ======================================
echo.

REM Check if WSL has a distribution
wsl --list --quiet >nul 2>&1
if errorlevel 1 (
    echo [ERROR] No WSL distribution found!
    echo.
    echo Run in PowerShell as Admin:
    echo    wsl --install -d Ubuntu-24.04
    echo.
    pause
    exit /b 1
)

echo [1/4] Checking Docker...
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo.
    echo Please start Docker Desktop and wait for it to be ready.
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)
echo [OK] Docker is running

echo.
echo [2/4] Starting PostgreSQL and Redis...
docker-compose up -d postgres redis
if errorlevel 1 (
    echo [ERROR] Failed to start services
    pause
    exit /b 1
)

echo.
echo [3/4] Waiting for services to be ready...
timeout /t 15 /nobreak

echo.
echo [4/4] Starting development servers...
echo.
echo This will start:
echo   - Frontend: http://localhost:3000
echo   - GraphQL API: http://localhost:4000/graphql
echo   - WebSocket: ws://localhost:4001
echo.
echo Press Ctrl+C to stop all services
echo.

start "CosmoStream API" cmd /k "cd apps\api && npm run dev"
timeout /t 2 /nobreak
start "CosmoStream Web" cmd /k "cd apps\web && npm run dev"

echo.
echo ======================================
echo CosmoStream is starting!
echo ======================================
echo.
echo Open your browser to:
echo   http://localhost:3000
echo.
echo Press any key to view logs...
pause >nul

docker-compose logs -f
