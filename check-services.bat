@echo off
echo ========================================
echo   CosmoStream Service Status Check
echo ========================================
echo.

echo [1/5] Checking if PostgreSQL is running...
docker ps --filter "name=postgres" --format "{{.Names}}: {{.Status}}" | findstr cosmostream
if %errorlevel% neq 0 (
    echo    ❌ PostgreSQL is NOT running
    echo    Fix: docker-compose up -d postgres
) else (
    echo    ✅ PostgreSQL is running
)
echo.

echo [2/5] Checking if Redis is running...
docker ps --filter "name=redis" --format "{{.Names}}: {{.Status}}" | findstr cosmostream
if %errorlevel% neq 0 (
    echo    ❌ Redis is NOT running
    echo    Fix: docker-compose up -d redis
) else (
    echo    ✅ Redis is running
)
echo.

echo [3/5] Checking if API server (port 4000) is running...
netstat -ano | findstr :4000 | findstr LISTENING >nul
if %errorlevel% neq 0 (
    echo    ❌ API server is NOT running on port 4000
    echo    Fix: cd apps\api ^&^& npm run dev
) else (
    echo    ✅ API server is running on port 4000
)
echo.

echo [4/5] Checking if Web server (port 3000) is running...
netstat -ano | findstr :3000 | findstr LISTENING >nul
if %errorlevel% neq 0 (
    echo    ❌ Web server is NOT running on port 3000
    echo    Fix: cd apps\web ^&^& npm run dev
) else (
    echo    ✅ Web server is running on port 3000
)
echo.

echo [5/5] Testing API health endpoint...
curl -s http://localhost:4000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo    ❌ API health check FAILED
    echo    API server may not be responding
) else (
    echo    ✅ API health check PASSED
    curl -s http://localhost:4000/health
)
echo.

echo ========================================
echo   Summary
echo ========================================
echo.
echo If all checks passed (✅), your services are running.
echo If any failed (❌), follow the Fix instructions above.
echo.
echo Next: Visit http://localhost:3000/login
echo.
pause
