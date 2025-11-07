module.exports = {
  apps: [{
    name: 'cosmostream-api',
    script: 'dist/index.js',
    cwd: '/home/ec2-user/cosmostream/apps/api',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/home/ec2-user/logs/api-error.log',
    out_file: '/home/ec2-user/logs/api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
