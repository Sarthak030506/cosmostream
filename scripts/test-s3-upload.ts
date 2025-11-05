#!/usr/bin/env ts-node

/**
 * Test S3 Presigned URL Generation
 *
 * This script tests if the API generates real S3 presigned URLs (not mock URLs)
 */

import { generatePresignedUploadUrl } from '../apps/api/src/services/s3';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '../apps/api/.env') });

async function test() {
  console.log('🧪 Testing S3 Presigned URL Generation\n');

  console.log('Environment check:');
  console.log(`- AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`- AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`- AWS_REGION: ${process.env.AWS_REGION || 'us-east-1'}`);
  console.log(`- AWS_S3_UPLOAD_BUCKET: ${process.env.AWS_S3_UPLOAD_BUCKET || process.env.AWS_S3_BUCKET}\n`);

  try {
    const testKey = `uploads/test-${Date.now()}/test-video.mp4`;
    console.log(`Generating presigned URL for key: ${testKey}\n`);

    const url = await generatePresignedUploadUrl(testKey, 3600, 'video/mp4');

    console.log('Generated URL:');
    console.log(url);
    console.log();

    if (url.includes('/api/mock-upload/')) {
      console.log('❌ FAIL: Generated MOCK URL');
      console.log('This means AWS credentials are not loading correctly.');
    } else if (url.includes('amazonaws.com')) {
      console.log('✅ SUCCESS: Generated REAL S3 presigned URL!');
      console.log('The S3 service is working correctly.');
    } else {
      console.log('⚠️  WARNING: Unknown URL format');
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

test();
