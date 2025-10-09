@echo off
echo ========================================
echo    CosmoStream - Starting All Services
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)

echo [1/4] Starting Docker services (PostgreSQL + Redis)...
docker-compose up -d postgres redis

echo.
echo [2/4] Waiting for databases to initialize (15 seconds)...
timeout /t 15 /nobreak >nul

echo.
echo [3/4] Starting API Server (GraphQL)...
start "CosmoStream API" cmd /k "cd apps\api && echo Starting API Server... && npm run dev"

echo.
echo [4/4] Starting Web Server (Next.js)...
timeout /t 5 /nobreak >nul
start "CosmoStream Web" cmd /k "cd apps\web && echo Starting Web Server... && npm run dev"

echo.
echo ========================================
echo    All services are starting!
echo ========================================
echo.
echo Two terminal windows will open:
echo   - CosmoStream API  (Port 4000)
echo   - CosmoStream Web  (Port 3000)
echo.
echo Wait for both to show "Ready" messages, then:
echo.
echo   ^> Open: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul
