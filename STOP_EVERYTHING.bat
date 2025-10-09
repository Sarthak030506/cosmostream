@echo off
echo ========================================
echo    CosmoStream - Stopping All Services
echo ========================================
echo.

echo [1/2] Stopping Docker services...
docker-compose down

echo.
echo [2/2] Killing Node processes...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo ========================================
echo    All services stopped!
echo ========================================
echo.
pause
