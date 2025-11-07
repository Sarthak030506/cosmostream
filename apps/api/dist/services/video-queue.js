"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoQueue = void 0;
exports.addVideoToProcessingQueue = addVideoToProcessingQueue;
const bull_1 = __importDefault(require("bull"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables FIRST
dotenv_1.default.config();
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
// Check if Redis is available - ALWAYS true since we have Redis running
const hasRedis = true; // Force enable since Redis is always running in Docker
// Initialize video processing queue (same queue as media-processor)
exports.videoQueue = hasRedis
    ? new bull_1.default('video-processing', REDIS_URL, {
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
        },
    })
    : null;
async function addVideoToProcessingQueue(data) {
    // Development mode: Skip queue if Redis is not configured
    if (!hasRedis || !exports.videoQueue) {
        console.warn('⚠️  Redis not configured. Video processing queue skipped in development mode.');
        console.log(`📹 Video ${data.videoId} would be added to processing queue in production.`);
        return null;
    }
    // Production mode: Add to Bull queue
    const job = await exports.videoQueue.add(data, {
        priority: data.priority || 10,
    });
    console.log(`✅ Added video ${data.videoId} to processing queue (Job ID: ${job.id})`);
    return job;
}
//# sourceMappingURL=video-queue.js.map