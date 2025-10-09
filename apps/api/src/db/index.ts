import { Pool } from 'pg';
import { logger } from '../utils/logger';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
  max: parseInt(process.env.DATABASE_POOL_MAX || '10'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Unexpected database error:', err);
});

pool.on('connect', () => {
  logger.info('Database connection established');
});

export const db = {
  query: async (text: string, params?: any[]) => {
    const start = Date.now();
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug('Executed query', { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      logger.error('Database query error:', { text, error });
      throw error;
    }
  },

  getClient: async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;

    // Monkey patch to track queries
    client.query = (...args: any[]) => {
      client.lastQuery = args;
      return query.apply(client, args as any);
    };

    client.release = () => {
      client.query = query;
      client.release = release;
      return release.apply(client);
    };

    return client;
  },

  end: () => pool.end(),
};
