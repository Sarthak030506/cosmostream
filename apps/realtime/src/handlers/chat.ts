import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';

interface ChatMessage {
  threadId: string;
  content: string;
  timestamp: string;
}

export function setupChatHandlers(io: Server, socket: Socket) {
  // Join a thread chat room
  socket.on('thread:join', (threadId: string) => {
    socket.join(`thread:${threadId}`);
    logger.info(`Socket ${socket.id} joined thread ${threadId}`);
  });

  // Leave a thread chat room
  socket.on('thread:leave', (threadId: string) => {
    socket.leave(`thread:${threadId}`);
    logger.info(`Socket ${socket.id} left thread ${threadId}`);
  });

  // Send message to thread
  socket.on('thread:message', (data: ChatMessage) => {
    const userId = (socket as any).userId;

    if (!userId) {
      socket.emit('error', { message: 'Authentication required' });
      return;
    }

    const message = {
      ...data,
      userId,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to thread room
    io.to(`thread:${data.threadId}`).emit('thread:new_message', message);
    logger.info(`Message sent to thread ${data.threadId}`, { userId });
  });

  // Live event chat
  socket.on('mission:join', (missionId: string) => {
    socket.join(`mission:${missionId}`);
    logger.info(`Socket ${socket.id} joined mission ${missionId}`);
  });

  socket.on('mission:leave', (missionId: string) => {
    socket.leave(`mission:${missionId}`);
  });

  socket.on('mission:chat', (data: any) => {
    const userId = (socket as any).userId;

    if (!userId) {
      socket.emit('error', { message: 'Authentication required' });
      return;
    }

    const message = {
      ...data,
      userId,
      timestamp: new Date().toISOString(),
    };

    io.to(`mission:${data.missionId}`).emit('mission:chat_message', message);
  });
}
