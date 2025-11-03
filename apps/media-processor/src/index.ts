import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from './utils/logger';
import { initializeQueue } from './queue';
import { setupS3Listener } from './listeners/s3';

// Load .env from media-processor directory, fall back to shared API .env
const mediaProcessorEnv = path.join(__dirname, '../.env');
const sharedEnv = path.join(__dirname, '../../api/.env');

// Try media-processor .env first, then API .env
dotenv.config({ path: mediaProcessorEnv });
dotenv.config({ path: sharedEnv });

// Media processor always uses 4002 (don't inherit PORT from API)
const PORT = 4002;

async function startServer() {
  const app = express();

  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'media-processor' });
  });

  // Initialize job queue
  await initializeQueue();

  // Setup S3 event listeners
  await setupS3Listener();

  app.listen(PORT, () => {
    logger.info(`Media processor service running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start media processor:', error);
  process.exit(1);
});
