import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { createContext } from './context';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const PORT = process.env.PORT || 4000;

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

  app.listen(PORT, () => {
    logger.info(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
