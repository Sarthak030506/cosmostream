#!/bin/bash

set -e

echo "🚀 Deploying to Staging..."

# Build and push Docker images
echo "📦 Building Docker images..."
docker build -t cosmostream-api:staging -f apps/api/Dockerfile .
docker build -t cosmostream-web:staging -f apps/web/Dockerfile .
docker build -t cosmostream-media-processor:staging -f apps/media-processor/Dockerfile .
docker build -t cosmostream-realtime:staging -f apps/realtime/Dockerfile .

# Push to ECR
echo "⬆️  Pushing to ECR..."
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker tag cosmostream-api:staging $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/cosmostream-api:staging
docker tag cosmostream-web:staging $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/cosmostream-web:staging
docker tag cosmostream-media-processor:staging $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/cosmostream-media-processor:staging
docker tag cosmostream-realtime:staging $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/cosmostream-realtime:staging

docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/cosmostream-api:staging
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/cosmostream-web:staging
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/cosmostream-media-processor:staging
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/cosmostream-realtime:staging

# Update Kubernetes deployments
echo "☸️  Updating Kubernetes deployments..."
kubectl set image deployment/api api=$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/cosmostream-api:staging -n staging
kubectl set image deployment/web web=$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/cosmostream-web:staging -n staging
kubectl set image deployment/media-processor media-processor=$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/cosmostream-media-processor:staging -n staging
kubectl set image deployment/realtime realtime=$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/cosmostream-realtime:staging -n staging

# Wait for rollout
echo "⏳ Waiting for rollout..."
kubectl rollout status deployment/api -n staging
kubectl rollout status deployment/web -n staging
kubectl rollout status deployment/media-processor -n staging
kubectl rollout status deployment/realtime -n staging

echo "✅ Deployment to staging complete!"
echo "🌐 Staging URL: https://staging.cosmostream.com"
