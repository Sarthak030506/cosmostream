"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePresignedUploadUrl = generatePresignedUploadUrl;
exports.generatePresignedDownloadUrl = generatePresignedDownloadUrl;
exports.getPublicVideoUrl = getPublicVideoUrl;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables FIRST
dotenv_1.default.config();
// Check if AWS credentials are configured
const hasAwsCredentials = !!(process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY);
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});
// CloudFront configuration
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;
async function generatePresignedUploadUrl(key, expiresIn = 3600, contentType = 'video/mp4') {
    // Generate real S3 presigned URL
    const command = new client_s3_1.PutObjectCommand({
        Bucket: process.env.AWS_S3_UPLOAD_BUCKET || process.env.AWS_S3_BUCKET || 'cosmostream-videos-prod',
        Key: key,
        ContentType: contentType,
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn });
    console.log(`✅ Generated S3 presigned URL for upload: ${key}`);
    return url;
}
async function generatePresignedDownloadUrl(key, expiresIn = 3600) {
    if (!hasAwsCredentials || !s3Client) {
        console.warn('⚠️  AWS not configured. Using mock download URL.');
        return `http://localhost:4000/api/mock-download/${encodeURIComponent(key)}`;
    }
    const command = new client_s3_1.GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET || 'cosmostream-videos',
        Key: key,
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn });
    return url;
}
/**
 * Generate public URL for a video file
 * Uses CloudFront if configured, otherwise S3 direct URL
 */
function getPublicVideoUrl(key) {
    // Use CloudFront if configured (recommended for production)
    if (CLOUDFRONT_DOMAIN) {
        return `https://${CLOUDFRONT_DOMAIN}/${key}`;
    }
    // Fallback to S3 direct URL (works only if bucket is public)
    const bucket = process.env.AWS_S3_BUCKET || 'cosmostream-videos';
    const region = process.env.AWS_REGION || 'us-east-1';
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
//# sourceMappingURL=s3.js.map