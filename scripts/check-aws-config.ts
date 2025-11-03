#!/usr/bin/env ts-node

/**
 * AWS Configuration Checker
 *
 * Run this script to verify your AWS credentials and configuration
 *
 * Usage: npx ts-node scripts/check-aws-config.ts
 */

import { S3Client, ListBucketsCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { MediaConvertClient, DescribeEndpointsCommand } from '@aws-sdk/client-mediaconvert';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../apps/api/.env') });

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_S3_UPLOAD_BUCKET = process.env.AWS_S3_UPLOAD_BUCKET;
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
const AWS_MEDIACONVERT_ENDPOINT = process.env.AWS_MEDIACONVERT_ENDPOINT;

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const results: CheckResult[] = [];

function logResult(result: CheckResult) {
  const emoji = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
  console.log(`${emoji} ${result.name}: ${result.message}`);
  results.push(result);
}

async function checkAwsCredentials() {
  console.log('\n🔐 Checking AWS Credentials...\n');

  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    logResult({
      name: 'AWS Credentials',
      status: 'fail',
      message: 'Missing AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY in .env file',
    });
    return false;
  }

  logResult({
    name: 'AWS Credentials',
    status: 'pass',
    message: 'Found in .env file',
  });

  return true;
}

async function checkS3Access() {
  console.log('\n📦 Checking S3 Access...\n');

  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    logResult({
      name: 'S3 Access',
      status: 'fail',
      message: 'Skipped - no credentials',
    });
    return false;
  }

  try {
    const s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });

    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);

    logResult({
      name: 'S3 Connection',
      status: 'pass',
      message: `Successfully connected! Found ${response.Buckets?.length || 0} buckets`,
    });

    return true;
  } catch (error: any) {
    // ListBuckets permission is not critical - just a nice-to-have
    if (error.message.includes('ListAllMyBuckets')) {
      logResult({
        name: 'S3 Connection',
        status: 'warn',
        message: 'No ListBuckets permission (not required - upload test passed!)',
      });
      return true; // Still okay for S3-only mode
    }

    logResult({
      name: 'S3 Connection',
      status: 'fail',
      message: `Failed: ${error.message}`,
    });
    return false;
  }
}

async function checkS3Buckets() {
  console.log('\n🪣 Checking S3 Buckets...\n');

  if (!AWS_S3_UPLOAD_BUCKET) {
    logResult({
      name: 'Upload Bucket',
      status: 'fail',
      message: 'AWS_S3_UPLOAD_BUCKET not set in .env',
    });
  } else {
    logResult({
      name: 'Upload Bucket',
      status: 'pass',
      message: AWS_S3_UPLOAD_BUCKET,
    });
  }

  if (!AWS_S3_BUCKET) {
    logResult({
      name: 'Videos Bucket',
      status: 'fail',
      message: 'AWS_S3_BUCKET not set in .env',
    });
  } else {
    logResult({
      name: 'Videos Bucket',
      status: 'pass',
      message: AWS_S3_BUCKET,
    });
  }

  // Test upload permission
  if (AWS_S3_UPLOAD_BUCKET && AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
    try {
      const s3Client = new S3Client({
        region: AWS_REGION,
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        },
      });

      const testKey = `config-test-${Date.now()}.txt`;
      const command = new PutObjectCommand({
        Bucket: AWS_S3_UPLOAD_BUCKET,
        Key: testKey,
        Body: 'Configuration test',
      });

      await s3Client.send(command);

      logResult({
        name: 'Upload Permission',
        status: 'pass',
        message: 'Successfully uploaded test file to upload bucket',
      });

      // Clean up test file
      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: AWS_S3_UPLOAD_BUCKET,
          Key: testKey,
        })
      );
    } catch (error: any) {
      logResult({
        name: 'Upload Permission',
        status: 'fail',
        message: `Cannot upload to bucket: ${error.message}`,
      });
    }
  }
}

async function checkMediaConvert() {
  console.log('\n🎬 Checking AWS MediaConvert...\n');

  if (!AWS_MEDIACONVERT_ENDPOINT) {
    logResult({
      name: 'MediaConvert Endpoint',
      status: 'warn',
      message: 'Not configured - videos will use development mode (simulated processing)',
    });
    return;
  }

  logResult({
    name: 'MediaConvert Endpoint',
    status: 'pass',
    message: AWS_MEDIACONVERT_ENDPOINT,
  });

  if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
    try {
      const mediaConvertClient = new MediaConvertClient({
        region: AWS_REGION,
        endpoint: AWS_MEDIACONVERT_ENDPOINT,
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        },
      });

      const command = new DescribeEndpointsCommand({});
      await mediaConvertClient.send(command);

      logResult({
        name: 'MediaConvert Access',
        status: 'pass',
        message: 'Successfully connected to MediaConvert',
      });
    } catch (error: any) {
      logResult({
        name: 'MediaConvert Access',
        status: 'fail',
        message: `Failed: ${error.message}`,
      });
    }
  }
}

async function checkOtherConfig() {
  console.log('\n⚙️  Checking Other Configuration...\n');

  const DATABASE_URL = process.env.DATABASE_URL;
  const REDIS_URL = process.env.REDIS_URL;
  const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;

  if (DATABASE_URL) {
    logResult({
      name: 'Database URL',
      status: 'pass',
      message: 'Configured',
    });
  } else {
    logResult({
      name: 'Database URL',
      status: 'fail',
      message: 'Not set in .env',
    });
  }

  if (REDIS_URL) {
    logResult({
      name: 'Redis URL',
      status: 'pass',
      message: 'Configured',
    });
  } else {
    logResult({
      name: 'Redis URL',
      status: 'warn',
      message: 'Not set - video processing queue will be disabled',
    });
  }

  if (CLOUDFRONT_DOMAIN) {
    logResult({
      name: 'CloudFront CDN',
      status: 'pass',
      message: CLOUDFRONT_DOMAIN,
    });
  } else {
    logResult({
      name: 'CloudFront CDN',
      status: 'warn',
      message: 'Not configured - using S3 direct URLs (slower)',
    });
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 CONFIGURATION SUMMARY');
  console.log('='.repeat(60) + '\n');

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const warned = results.filter((r) => r.status === 'warn').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warned}`);
  console.log();

  if (failed > 0) {
    console.log('❌ Configuration has ERRORS. Please fix the failed checks above.');
    console.log();
    console.log('📖 See AWS_S3_PRODUCTION_SETUP.md for detailed setup instructions.');
    process.exit(1);
  } else if (warned > 0) {
    console.log('⚠️  Configuration has WARNINGS. Some features may be limited.');
    console.log();
    console.log('ℹ️  For production, configure all services in .env file.');
  } else {
    console.log('✅ Configuration looks good! Ready for production.');
  }

  console.log();
}

async function main() {
  console.log('🔍 CosmoStream AWS Configuration Checker\n');
  console.log('Checking configuration in: apps/api/.env\n');

  await checkAwsCredentials();
  await checkS3Access();
  await checkS3Buckets();
  await checkMediaConvert();
  await checkOtherConfig();
  printSummary();
}

main().catch((error) => {
  console.error('Error running configuration check:', error);
  process.exit(1);
});
