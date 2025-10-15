// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { createContext } from './context';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { pool } from './db';
import { initYouTubeService } from './services/youtube';
import { initYouTubeSyncService } from './services/youtube-sync';
import { initYouTubeContentFilter } from './utils/youtube-filters';
import { initYouTubeSyncCronJob } from './jobs/youtube-sync-cron';

const PORT = process.env.PORT || 4000;

// Log environment variables for debugging
logger.info('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL ? 'Set (hidden)' : 'NOT SET',
  REDIS_URL: process.env.REDIS_URL ? 'Set (hidden)' : 'NOT SET',
  JWT_SECRET: process.env.JWT_SECRET ? 'Set (hidden)' : 'NOT SET',
});

async function startServer() {
  const app = express();

  // Security middleware
  app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production' }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/graphql', limiter);

  // CORS
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
      credentials: true,
    })
  );

  // Logging
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Apollo Server setup
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
      logger.error('GraphQL Error:', error);
      return error;
    },
    introspection: process.env.NODE_ENV !== 'production',
  });

  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: createContext,
    })
  );

  // Error handling
  app.use(errorHandler);

  // Initialize YouTube services (if API key is configured)
  if (process.env.YOUTUBE_API_KEY) {
    try {
      logger.info('Initializing YouTube integration services...');

      // Initialize services
      initYouTubeService(pool, logger);
      initYouTubeContentFilter(logger);
      initYouTubeSyncService(pool, logger);

      // Initialize and start cron job for automated syncing
      const cronJob = initYouTubeSyncCronJob(pool, logger);
      cronJob.start();

      logger.info('✅ YouTube integration services initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize YouTube services:', error);
      logger.warn('YouTube integration will be disabled');
    }
  } else {
    logger.warn('YOUTUBE_API_KEY not set - YouTube integration disabled');
  }

  app.listen(PORT, () => {
    logger.info(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
