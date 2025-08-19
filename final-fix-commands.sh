#!/bin/bash

echo "🔧 Correção final para o PM2 e .env..."

cat << 'INSTRUCTIONS'
Execute estes comandos no seu VPS:

cd /home/ubuntu/Beatriz-f

# 1. Remover configuração PM2 antiga
pm2 delete salao-beleza 2>/dev/null || true

# 2. Criar ecosystem.config.cjs (CommonJS para PM2)
cat > ecosystem.config.cjs << 'EOF'
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
    watch: false
  }]
};
EOF

# 3. Iniciar com o novo arquivo de configuração
pm2 start ecosystem.config.cjs

# 4. Verificar status
pm2 status

# 5. Ver logs em tempo real
pm2 logs salao-beleza --lines 5

INSTRUCTIONS