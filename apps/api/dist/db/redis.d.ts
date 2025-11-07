import Redis from 'ioredis';
declare const redis: Redis;
export { redis };
export declare const cacheHelpers: {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    delPattern(pattern: string): Promise<void>;
};
//# sourceMappingURL=redis.d.ts.map