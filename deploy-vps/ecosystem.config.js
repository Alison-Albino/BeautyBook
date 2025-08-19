// 🚀 Configuração PM2 para Produção
module.exports = {
  apps: [{
    name: 'salao-beleza',
    script: 'dist/index.js',
    instances: 'max', // usa todos os CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Opções de monitorização
    max_memory_restart: '1G',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    // Auto-restart em caso de crash
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};