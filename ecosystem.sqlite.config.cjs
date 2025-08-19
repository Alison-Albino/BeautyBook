// Configuração PM2 para SQLite (sem dependências .env)
module.exports = {
  apps: [{
    name: 'salao-beleza-sqlite',
    script: 'start-sqlite.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log'
  }]
};