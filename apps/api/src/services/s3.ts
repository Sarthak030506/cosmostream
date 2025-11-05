import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Check if AWS credentials are configured
const hasAwsCredentials = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY
);

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// CloudFront configuration
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;

export async function generatePresignedUploadUrl(
  key: string,
  expiresIn: number = 3600,
  contentType: string = 'video/mp4'
): Promise<string> {
  // Generate real S3 presigned URL
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_UPLOAD_BUCKET || process.env.AWS_S3_BUCKET || 'cosmostream-videos-prod',
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  console.log(`✅ Generated S3 presigned URL for upload: ${key}`);
  return url;
}

export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  if (!hasAwsCredentials || !s3Client) {
    console.warn('⚠️  AWS not configured. Using mock download URL.');
    return `http://localhost:4000/api/mock-download/${encodeURIComponent(key)}`;
  }

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET || 'cosmostream-videos',
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}

/**
 * Generate public URL for a video file
 * Uses CloudFront if configured, otherwise S3 direct URL
 */
export function getPublicVideoUrl(key: string): string {
  // Use CloudFront if configured (recommended for production)
  if (CLOUDFRONT_DOMAIN) {
    return `https://${CLOUDFRONT_DOMAIN}/${key}`;
  }

  // Fallback to S3 direct URL (works only if bucket is public)
  const bucket = process.env.AWS_S3_BUCKET || 'cosmostream-videos';
  const region = process.env.AWS_REGION || 'us-east-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
