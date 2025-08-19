// Configuração PM2 em formato CommonJS
module.exports = {
  apps: [{
    name: 'salao-beleza',
    script: 'start-app.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production'
    },
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};