import { Request, Response } from 'express';
import { db } from './db';
import { redis } from './db/redis';
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
export declare function createContext({ req, res }: {
    req: Request;
    res: Response;
}): Promise<Context>;
//# sourceMappingURL=context.d.ts.map