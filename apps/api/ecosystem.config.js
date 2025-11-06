module.exports = {
  apps: [{
    name: 'cosmostream-api',
    script: 'node_modules/.bin/tsx',
    args: 'src/index.ts',
    cwd: '/home/ubuntu/cosmostream/apps/api',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/home/ubuntu/logs/api-error.log',
    out_file: '/home/ubuntu/logs/api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
