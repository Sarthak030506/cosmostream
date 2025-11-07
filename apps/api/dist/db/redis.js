"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheHelpers = exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("../utils/logger");
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const isLocalRedis = redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1');
const redis = new ioredis_1.default(redisUrl, {
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
    // Enable TLS only for remote Redis (Upstash, etc), not localhost
    tls: !isLocalRedis && process.env.NODE_ENV === 'production' ? {} : undefined,
    // Add family option for better DNS resolution
    family: 4,
});
exports.redis = redis;
redis.on('connect', () => {
    logger_1.logger.info('Redis connection established');
});
redis.on('error', (err) => {
    logger_1.logger.error('Redis error:', err);
});
redis.on('close', () => {
    logger_1.logger.warn('Redis connection closed');
});
// Helper functions
exports.cacheHelpers = {
    async get(key) {
        try {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            logger_1.logger.error('Cache get error:', { key, error });
            return null;
        }
    },
    async set(key, value, ttl = 3600) {
        try {
            await redis.set(key, JSON.stringify(value), 'EX', ttl);
        }
        catch (error) {
            logger_1.logger.error('Cache set error:', { key, error });
        }
    },
    async del(key) {
        try {
            await redis.del(key);
        }
        catch (error) {
            logger_1.logger.error('Cache delete error:', { key, error });
        }
    },
    async delPattern(pattern) {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        }
        catch (error) {
            logger_1.logger.error('Cache delete pattern error:', { pattern, error });
        }
    },
};
//# sourceMappingURL=redis.js.map