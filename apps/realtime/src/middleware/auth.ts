import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function setupAuthentication(io: Server) {
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      // Allow anonymous connections but mark them
      (socket as any).userId = null;
      (socket as any).userRole = 'anonymous';
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      (socket as any).userId = decoded.userId;
      (socket as any).userRole = decoded.role;
      logger.info(`Authenticated socket: ${socket.id}`, { userId: decoded.userId });
      next();
    } catch (error) {
      logger.warn(`Authentication failed for socket: ${socket.id}`, error);
      (socket as any).userId = null;
      (socket as any).userRole = 'anonymous';
      next();
    }
  });
}
