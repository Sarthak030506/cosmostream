import { Request, Response } from 'express';
import { db } from './db';
import { redis } from './db/redis';
import { verifyToken } from './utils/auth';
import { logger } from './utils/logger';

export interface User {
  id: string;
  email: string;
  role: 'viewer' | 'creator' | 'admin';
}

export interface Context {
  req: Request;
  res: Response;
  user: User | null;
  db: typeof db;
  redis: typeof redis;
  logger: typeof logger;
}

export async function createContext({ req, res }: { req: Request; res: Response }): Promise<Context> {
  const token = req.headers.authorization?.replace('Bearer ', '');

  let user: User | null = null;

  if (token) {
    try {
      const decoded = verifyToken(token);
      user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      logger.warn('Invalid token:', error);
    }
  }

  return {
    req,
    res,
    user,
    db,
    redis,
    logger,
  };
}
