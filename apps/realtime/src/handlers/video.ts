import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';

export function setupVideoHandlers(io: Server, socket: Socket) {
  // Subscribe to video processing updates
  socket.on('video:subscribe', (videoId: string) => {
    const userId = (socket as any).userId;

    if (!userId) {
      socket.emit('error', { message: 'Authentication required' });
      return;
    }

    socket.join(`video:${videoId}`);
    logger.info(`Socket ${socket.id} subscribed to video ${videoId}`);
  });

  socket.on('video:unsubscribe', (videoId: string) => {
    socket.leave(`video:${videoId}`);
  });

  // Watch party functionality
  socket.on('watch:join', (roomId: string) => {
    socket.join(`watch:${roomId}`);
    logger.info(`Socket ${socket.id} joined watch party ${roomId}`);

    io.to(`watch:${roomId}`).emit('watch:user_joined', {
      userId: (socket as any).userId,
      socketId: socket.id,
    });
  });

  socket.on('watch:leave', (roomId: string) => {
    socket.leave(`watch:${roomId}`);

    io.to(`watch:${roomId}`).emit('watch:user_left', {
      userId: (socket as any).userId,
      socketId: socket.id,
    });
  });

  // Sync playback state
  socket.on('watch:sync', (data: any) => {
    const { roomId, timestamp, playing } = data;

    socket.to(`watch:${roomId}`).emit('watch:sync_update', {
      timestamp,
      playing,
      userId: (socket as any).userId,
    });
  });
}

// Helper to broadcast video processing updates (called from media processor)
export function broadcastVideoUpdate(io: Server, videoId: string, update: any) {
  io.to(`video:${videoId}`).emit('video:processing_update', update);
  logger.info(`Broadcast video update for ${videoId}`, update);
}
