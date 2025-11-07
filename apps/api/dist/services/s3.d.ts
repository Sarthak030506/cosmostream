export declare function generatePresignedUploadUrl(key: string, expiresIn?: number, contentType?: string): Promise<string>;
export declare function generatePresignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
/**
 * Generate public URL for a video file
 * Uses CloudFront if configured, otherwise S3 direct URL
 */
export declare function getPublicVideoUrl(key: string): string;
//# sourceMappingURL=s3.d.ts.map