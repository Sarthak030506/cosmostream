@echo off
echo ========================================
echo   Reset YouTube API Quota
echo ========================================
echo.

echo Connecting to database...
echo.

"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d cosmostream -f "database\migrations\reset_youtube_quota.sql"

echo.
echo ========================================
echo   Done!
echo ========================================
echo.
echo YouTube quota has been reset to 0/10000
echo You can now sync videos without quota errors.
echo.
pause
