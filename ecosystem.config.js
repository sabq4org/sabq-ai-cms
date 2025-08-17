module.exports = {
  apps: [{
    name: 'sabq-cms',
    script: 'npm',
    args: 'start',
    instances: 2,
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    watch: false,
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }],

  // مهام مجدولة
  cron: [{
    name: 'daily-cleanup',
    script: './scripts/daily-cleanup.js',
    cron_restart: '0 2 * * *', // 2 صباحاً يومياً
    autorestart: false
  }, {
    name: 'backup-uploads',
    script: './scripts/backup-uploads.sh',
    cron_restart: '0 3 * * 0', // 3 صباحاً كل أحد
    autorestart: false
  }]
}; 