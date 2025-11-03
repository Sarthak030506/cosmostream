@echo off
echo ========================================
echo   CosmoStream AWS Setup Helper
echo ========================================
echo.

REM Check if AWS CLI is installed
aws --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] AWS CLI is not installed!
    echo.
    echo Please install AWS CLI first:
    echo https://awscli.amazonaws.com/AWSCLIV2.msi
    echo.
    pause
    exit /b 1
)

echo [OK] AWS CLI is installed
echo.

echo ========================================
echo   Step 1: Configure AWS CLI
echo ========================================
echo.
echo You'll need:
echo   1. AWS Access Key ID (from IAM Console)
echo   2. AWS Secret Access Key (from IAM Console)
echo   3. Region: eu-north-1
echo   4. Output format: json
echo.
echo If you don't have access keys, press Ctrl+C and:
echo   1. Go to https://console.aws.amazon.com/iam
echo   2. Click Users - Create user - cosmostream-app
echo   3. Attach policies: AmazonS3FullAccess, AWSElementalMediaConvertFullAccess
echo   4. Create access keys for CLI
echo.
pause

aws configure

echo.
echo ========================================
echo   Step 2: Test AWS Configuration
echo ========================================
echo.
echo Testing AWS credentials...
aws sts get-caller-identity
if %errorlevel% neq 0 (
    echo [ERROR] AWS configuration failed!
    echo Please run 'aws configure' again with correct credentials.
    pause
    exit /b 1
)

echo.
echo [OK] AWS credentials are valid!
echo.

echo ========================================
echo   Step 3: Get MediaConvert Endpoint
echo ========================================
echo.
echo Getting MediaConvert endpoint for eu-north-1...
echo.

aws mediaconvert describe-endpoints --region eu-north-1 > mediaconvert-endpoint.json
if %errorlevel% neq 0 (
    echo [ERROR] Could not get MediaConvert endpoint!
    echo Make sure your IAM user has MediaConvert permissions.
    pause
    exit /b 1
)

echo [OK] Got MediaConvert endpoint!
echo.

REM Parse the endpoint URL
for /f "tokens=2 delims=:" %%a in ('findstr /C:"Url" mediaconvert-endpoint.json') do set ENDPOINT=%%a
set ENDPOINT=%ENDPOINT:"=%
set ENDPOINT=%ENDPOINT: =%
set ENDPOINT=%ENDPOINT:,=%

echo Your MediaConvert Endpoint:
echo %ENDPOINT%
echo.

echo ========================================
echo   Step 4: Update .env File
echo ========================================
echo.
echo Add these to your apps/api/.env file:
echo.
echo AWS_REGION=eu-north-1
echo AWS_MEDIACONVERT_ENDPOINT=%ENDPOINT%
echo.
echo Also add your access keys:
echo AWS_ACCESS_KEY_ID=[from IAM]
echo AWS_SECRET_ACCESS_KEY=[from IAM]
echo.

REM Clean up temp file
del mediaconvert-endpoint.json

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Copy the values above to apps/api/.env
echo   2. Create S3 buckets in AWS Console
echo   3. Create MediaConvert IAM role
echo   4. Run: npx ts-node scripts/check-aws-config.ts
echo.
pause
