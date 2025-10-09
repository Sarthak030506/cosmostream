import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { setupAuthentication } from './middleware/auth';
import { setupChatHandlers } from './handlers/chat';
import { setupMissionHandlers } from './handlers/mission';
import { setupVideoHandlers } from './handlers/video';

dotenv.config();

const PORT = process.env.PORT || 4001;

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Setup authentication middleware
  setupAuthentication(io);

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'realtime',
      connections: io.engine.clientsCount,
    });
  });

  // Setup socket event handlers
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`, {
      userId: (socket as any).userId,
    });

    // Setup handlers
    setupChatHandlers(io, socket);
    setupMissionHandlers(io, socket);
    setupVideoHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      logger.info(`Client disconnected: ${socket.id}`, { reason });
    });

    socket.on('error', (error) => {
      logger.error(`Socket error: ${socket.id}`, error);
    });
  });

  httpServer.listen(PORT, () => {
    logger.info(`Realtime service running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start realtime server:', error);
  process.exit(1);
});
