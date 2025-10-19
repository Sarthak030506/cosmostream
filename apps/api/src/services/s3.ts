import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Check if AWS credentials are configured
const hasAwsCredentials = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY
);

const s3Client = hasAwsCredentials
  ? new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export async function generatePresignedUploadUrl(
  key: string,
  expiresIn: number = 3600,
  contentType: string = 'video/mp4'
): Promise<string> {
  // Development mode: Return a mock URL if AWS is not configured
  if (!hasAwsCredentials || !s3Client) {
    console.warn(
      '⚠️  AWS credentials not configured. Using mock upload URL for development.'
    );
    // Return a mock URL that the client can "upload" to (will be ignored)
    return `http://localhost:4000/api/mock-upload/${encodeURIComponent(key)}`;
  }

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_UPLOAD_BUCKET || 'cosmostream-uploads',
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}

export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET || 'cosmostream-videos',
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}
