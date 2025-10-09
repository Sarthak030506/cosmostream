@echo off
echo ======================================
echo Starting CosmoStream Development
echo ======================================
echo.

echo Checking if databases are running...
docker ps | findstr cosmostream-postgres >nul 2>&1
if errorlevel 1 (
    echo [ERROR] PostgreSQL is not running!
    echo Please run: docker-compose up -d postgres redis
    pause
    exit /b 1
)

echo [OK] Databases are running
echo.
echo Starting development servers...
echo   - API: http://localhost:4000/graphql
echo   - Web: http://localhost:3000
echo.

REM Start API in a new window
start "CosmoStream API" cmd /k "cd /d %~dp0apps\api && npm run dev"

REM Wait a moment for API to start
timeout /t 3 /nobreak >nul

REM Start Web in a new window
start "CosmoStream Web" cmd /k "cd /d %~dp0apps\web && npm run dev"

echo.
echo ======================================
echo Development servers are starting!
echo ======================================
echo.
echo Two new windows will open:
echo   1. API Server (GraphQL)
echo   2. Web Server (Next.js)
echo.
echo Wait 30 seconds, then open:
echo   http://localhost:3000
echo.
echo Press Ctrl+C in each window to stop.
echo.
pause
