import { MediaConvertClient, CreateJobCommand } from '@aws-sdk/client-mediaconvert';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { logger } from '../utils/logger';
import { updateVideoStatus, updateVideoMetadata, createContentItemForVideo } from '../services/database';

const mediaConvertClient = new MediaConvertClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.AWS_MEDIACONVERT_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function processVideoUpload(data: any) {
  const { videoId, s3Key } = data;

  try {
    // Update status to processing
    await updateVideoStatus(videoId, 'processing');

    // Check if we should use MediaConvert or S3-only mode
    const useMediaConvert = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_MEDIACONVERT_ENDPOINT
    );

    const useS3Only = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_BUCKET &&
      !process.env.AWS_MEDIACONVERT_ENDPOINT
    );

    if (useS3Only) {
      // S3-Only mode: Use original uploaded video (no transcoding)
      logger.info(`📦 S3-only mode: Using original video for ${videoId}`);

      // Simulate quick processing (2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Use S3 direct URL for the original uploaded file
      const bucket = process.env.AWS_S3_UPLOAD_BUCKET || process.env.AWS_S3_BUCKET;
      const region = process.env.AWS_REGION || 'us-east-1';
      const videoUrl = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
      const thumbnailUrl = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key.replace(/\.[^.]+$/, '-thumb.jpg')}`;

      // Update video metadata and mark as ready
      await updateVideoMetadata(videoId, {
        manifestUrl: videoUrl, // Direct S3 URL (not HLS)
        duration: 300, // Default duration (can be updated later with ffprobe)
        thumbnailUrl: thumbnailUrl,
      });

      // Create content item for discovery/browse
      await createContentItemForVideo(videoId);

      logger.info(`✅ Video ${videoId} ready (S3-only, no transcoding)`);

      return {
        videoId,
        status: 'ready',
        manifestUrl: videoUrl,
      };
    }

    if (!useMediaConvert) {
      // Development mode: Simulate processing without AWS
      logger.info(`⚠️  AWS not configured. Simulating video processing for ${videoId}`);

      // Simulate processing delay (5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Mock URLs
      const mockManifestUrl = `https://cdn.cosmostream.com/videos/${videoId}/playlist.m3u8`;
      const mockThumbnailUrl = `https://cdn.cosmostream.com/thumbnails/${videoId}/thumb.jpg`;

      // Update video metadata and mark as ready
      await updateVideoMetadata(videoId, {
        manifestUrl: mockManifestUrl,
        duration: 300,
        thumbnailUrl: mockThumbnailUrl,
      });

      // Create content item for discovery/browse
      await createContentItemForVideo(videoId);

      logger.info(`✅ Video ${videoId} processing completed (simulated)`);

      return {
        videoId,
        status: 'ready',
        manifestUrl: mockManifestUrl,
      };
    }

    // Production mode: Create MediaConvert job
    const jobSettings = {
      Role: process.env.AWS_MEDIACONVERT_ROLE || '',
      Settings: {
        Inputs: [
          {
            FileInput: `s3://${process.env.AWS_S3_UPLOAD_BUCKET}/${s3Key}`,
            AudioSelectors: {
              'Audio Selector 1': {
                DefaultSelection: 'DEFAULT',
              },
            },
            VideoSelector: {},
          },
        ],
        OutputGroups: [
          {
            Name: 'Apple HLS',
            OutputGroupSettings: {
              Type: 'HLS_GROUP_SETTINGS',
              HlsGroupSettings: {
                Destination: `s3://${process.env.AWS_S3_BUCKET}/videos/${videoId}/`,
                SegmentLength: 10,
                MinSegmentLength: 0,
              },
            },
            Outputs: [
              // 1080p
              {
                NameModifier: '_1080p',
                VideoDescription: {
                  Width: 1920,
                  Height: 1080,
                  CodecSettings: {
                    Codec: 'H_264',
                    H264Settings: {
                      Bitrate: 5000000,
                      MaxBitrate: 5000000,
                      RateControlMode: 'CBR',
                    },
                  },
                },
                AudioDescriptions: [
                  {
                    CodecSettings: {
                      Codec: 'AAC',
                      AacSettings: {
                        Bitrate: 128000,
                        CodingMode: 'CODING_MODE_2_0',
                        SampleRate: 48000,
                      },
                    },
                  },
                ],
              },
              // 720p
              {
                NameModifier: '_720p',
                VideoDescription: {
                  Width: 1280,
                  Height: 720,
                  CodecSettings: {
                    Codec: 'H_264',
                    H264Settings: {
                      Bitrate: 3000000,
                      MaxBitrate: 3000000,
                      RateControlMode: 'CBR',
                    },
                  },
                },
              },
              // 480p
              {
                NameModifier: '_480p',
                VideoDescription: {
                  Width: 854,
                  Height: 480,
                  CodecSettings: {
                    Codec: 'H_264',
                    H264Settings: {
                      Bitrate: 1500000,
                      MaxBitrate: 1500000,
                      RateControlMode: 'CBR',
                    },
                  },
                },
              },
            ],
          },
        ],
      },
    };

    const command = new CreateJobCommand(jobSettings);
    const response = await mediaConvertClient.send(command);

    logger.info(`MediaConvert job created: ${response.Job?.Id}`, { videoId });

    // Generate thumbnail (simplified)
    await generateThumbnail(videoId, s3Key);

    // NOTE: In production, you should set up an EventBridge rule or SNS topic
    // to listen for MediaConvert job completion events, then call:
    // await completeVideoProcessing(videoId, manifestUrl, duration, thumbnailUrl);

    return {
      videoId,
      jobId: response.Job?.Id,
      status: 'processing',
    };
  } catch (error) {
    logger.error('Error processing video:', error);
    await updateVideoStatus(videoId, 'failed');
    throw error;
  }
}

// Called when video processing is complete (by EventBridge/SNS webhook in production)
export async function completeVideoProcessing(
  videoId: string,
  manifestUrl: string,
  duration: number,
  thumbnailUrl: string
) {
  try {
    // Update video metadata and mark as ready
    await updateVideoMetadata(videoId, {
      manifestUrl,
      duration,
      thumbnailUrl,
    });

    // Create content item for discovery/browse
    await createContentItemForVideo(videoId);

    logger.info(`✅ Video ${videoId} processing completed`);
  } catch (error) {
    logger.error(`Error completing video ${videoId} processing:`, error);
    await updateVideoStatus(videoId, 'failed');
    throw error;
  }
}

async function generateThumbnail(videoId: string, s3Key: string) {
  // In production, use ffmpeg to extract frame from video
  // For now, this is a placeholder
  logger.info(`Generating thumbnail for video ${videoId}`);
  // Implementation would involve:
  // 1. Download video from S3
  // 2. Extract frame at timestamp
  // 3. Resize with sharp
  // 4. Upload to S3
}
