import { MediaConvertClient, CreateJobCommand } from '@aws-sdk/client-mediaconvert';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { logger } from '../utils/logger';
import { updateVideoStatus } from '../services/database';

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

    // Create MediaConvert job
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
