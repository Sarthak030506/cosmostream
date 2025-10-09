import express from 'express';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { initializeQueue } from './queue';
import { setupS3Listener } from './listeners/s3';

dotenv.config();

const PORT = process.env.PORT || 4002;

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
