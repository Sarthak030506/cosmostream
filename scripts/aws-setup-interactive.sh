#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================"
echo "  CosmoStream AWS Setup Helper"
echo "========================================"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} AWS CLI is not installed!"
    echo ""
    echo "Please install AWS CLI first:"
    echo "  Mac: brew install awscli"
    echo "  Linux: apt install awscli"
    echo "  https://aws.amazon.com/cli/"
    exit 1
fi

echo -e "${GREEN}[OK]${NC} AWS CLI is installed"
echo ""

# Step 1: Configure AWS CLI
echo "========================================"
echo "  Step 1: Configure AWS CLI"
echo "========================================"
echo ""
echo "You'll need:"
echo "  1. AWS Access Key ID (from IAM Console)"
echo "  2. AWS Secret Access Key (from IAM Console)"
echo "  3. Region: eu-north-1"
echo "  4. Output format: json"
echo ""
echo -e "${YELLOW}If you don't have access keys:${NC}"
echo "  1. Go to https://console.aws.amazon.com/iam"
echo "  2. Click Users → Create user → cosmostream-app"
echo "  3. Attach policies: AmazonS3FullAccess, AWSElementalMediaConvertFullAccess"
echo "  4. Create access keys for CLI"
echo ""
read -p "Press Enter to continue with AWS configuration..."

aws configure

echo ""

# Step 2: Test AWS Configuration
echo "========================================"
echo "  Step 2: Test AWS Configuration"
echo "========================================"
echo ""
echo "Testing AWS credentials..."

if aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${GREEN}[OK]${NC} AWS credentials are valid!"

    # Show account info
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    USER_ARN=$(aws sts get-caller-identity --query Arn --output text)
    echo ""
    echo "Account ID: $ACCOUNT_ID"
    echo "User: $USER_ARN"
else
    echo -e "${RED}[ERROR]${NC} AWS configuration failed!"
    echo "Please run 'aws configure' again with correct credentials."
    exit 1
fi

echo ""

# Step 3: Get MediaConvert Endpoint
echo "========================================"
echo "  Step 3: Get MediaConvert Endpoint"
echo "========================================"
echo ""
echo "Getting MediaConvert endpoint for eu-north-1..."

ENDPOINT=$(aws mediaconvert describe-endpoints --region eu-north-1 --query 'Endpoints[0].Url' --output text 2>&1)

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}[OK]${NC} Got MediaConvert endpoint!"
    echo ""
    echo -e "${BLUE}Your MediaConvert Endpoint:${NC}"
    echo "$ENDPOINT"
else
    echo -e "${RED}[ERROR]${NC} Could not get MediaConvert endpoint!"
    echo "Make sure your IAM user has MediaConvert permissions."
    echo ""
    echo "Error: $ENDPOINT"
    exit 1
fi

echo ""

# Step 4: Create .env content
echo "========================================"
echo "  Step 4: Update .env File"
echo "========================================"
echo ""
echo -e "${YELLOW}Add these to your apps/api/.env file:${NC}"
echo ""
echo "AWS_REGION=eu-north-1"
echo "AWS_MEDIACONVERT_ENDPOINT=$ENDPOINT"
echo ""
echo "Also add your access keys:"
echo "AWS_ACCESS_KEY_ID=[your access key from IAM]"
echo "AWS_SECRET_ACCESS_KEY=[your secret key from IAM]"
echo ""

# Save to temp file
cat > /tmp/cosmostream-aws-config.txt << EOF
# AWS Configuration for CosmoStream
AWS_REGION=eu-north-1
AWS_MEDIACONVERT_ENDPOINT=$ENDPOINT
AWS_ACCESS_KEY_ID=[get from IAM Console]
AWS_SECRET_ACCESS_KEY=[get from IAM Console]

# S3 Buckets (create these in AWS S3 Console)
AWS_S3_UPLOAD_BUCKET=cosmostream-uploads-prod
AWS_S3_BUCKET=cosmostream-videos-prod

# MediaConvert Role (create in IAM Console)
AWS_MEDIACONVERT_ROLE=arn:aws:iam::$ACCOUNT_ID:role/CosmoStreamMediaConvertRole
EOF

echo -e "${GREEN}Configuration saved to: /tmp/cosmostream-aws-config.txt${NC}"
echo ""

# Step 5: Next steps
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Copy values from /tmp/cosmostream-aws-config.txt to apps/api/.env"
echo "  2. Create S3 buckets in AWS Console:"
echo "     - cosmostream-uploads-prod"
echo "     - cosmostream-videos-prod"
echo "  3. Create MediaConvert IAM role in AWS Console"
echo "  4. Run: npx ts-node scripts/check-aws-config.ts"
echo ""
echo "For detailed instructions, see: AWS_S3_PRODUCTION_SETUP.md"
echo ""
