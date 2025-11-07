"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.db = void 0;
const pg_1 = require("pg");
const logger_1 = require("../utils/logger");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined');
}
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
    max: parseInt(process.env.DATABASE_POOL_MAX || '10'),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: false, // Disable SSL for local development
});
exports.pool = pool;
pool.on('error', (err) => {
    logger_1.logger.error('Unexpected database error:', err);
});
pool.on('connect', () => {
    logger_1.logger.info('Database connection established');
});
exports.db = {
    query: async (text, params) => {
        const start = Date.now();
        try {
            const result = await pool.query(text, params);
            const duration = Date.now() - start;
            logger_1.logger.debug('Executed query', { text, duration, rows: result.rowCount });
            return result;
        }
        catch (error) {
            logger_1.logger.error('Database query error:', { text, error });
            throw error;
        }
    },
    getClient: async () => {
        return pool.connect();
    },
    end: () => pool.end(),
};
//# sourceMappingURL=index.js.map