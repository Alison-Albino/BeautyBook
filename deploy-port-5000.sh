#!/bin/bash

echo "🚀 Deploy na Porta 5000"

# Parar processos na porta 5000 se existirem
pm2 delete all 2>/dev/null || true
sudo pkill -f ":5000" 2>/dev/null || true

echo "✅ Configuração atualizada para porta 5000"

cat << 'COMMANDS'

Execute no seu VPS:

# Opção A - Deploy Rápido (diretório atual):
cd /home/ubuntu/BeautyBook
npm ci
npx drizzle-kit push --config=drizzle.sqlite.config.ts
tsx init-sqlite-db.js
npm run build
PORT=5000 pm2 start start-sqlite.js --name salao-beleza

# Opção B - Usando PM2 ecosystem:
pm2 start ecosystem.sqlite.config.cjs

# Verificar status:
pm2 status
pm2 logs salao-beleza

COMMANDS

echo ""
echo "🌐 Acesso: http://seu-servidor-ip:5000"
echo "🔑 Login: admin / admin123"
EOF

chmod +x deploy-port-5000.sh