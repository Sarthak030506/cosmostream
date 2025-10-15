// PM2 Ecosystem Configuration for CosmoStream
// This file manages all Node.js services on AWS EC2

module.exports = {
  apps: [
    {
      name: 'cosmostream-api',
      cwd: '/home/ubuntu/CosmoStream/apps/api',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      env_file: '/home/ubuntu/CosmoStream/apps/api/.env.production',
      error_file: '/home/ubuntu/logs/api-error.log',
      out_file: '/home/ubuntu/logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      restart_delay: 4000,
    },
    {
      name: 'cosmostream-realtime',
      cwd: '/home/ubuntu/CosmoStream/apps/realtime',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4001,
      },
      env_file: '/home/ubuntu/CosmoStream/apps/api/.env.production',
      error_file: '/home/ubuntu/logs/realtime-error.log',
      out_file: '/home/ubuntu/logs/realtime-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '300M',
      restart_delay: 4000,
    },
    {
      name: 'cosmostream-media-processor',
      cwd: '/home/ubuntu/CosmoStream/apps/media-processor',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4002,
      },
      env_file: '/home/ubuntu/CosmoStream/apps/api/.env.production',
      error_file: '/home/ubuntu/logs/media-processor-error.log',
      out_file: '/home/ubuntu/logs/media-processor-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '400M',
      restart_delay: 4000,
    },
  ],
};
