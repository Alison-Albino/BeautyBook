#!/bin/bash

echo "🚀 Deploy com SQLite (sem dependências .env)"

cat << 'INSTRUCTIONS'

🎯 DEPLOY SIMPLIFICADO COM SQLITE

Execute no seu VPS (/home/ubuntu/Beatriz-f):

# 1. Parar processos existentes
pm2 delete all 2>/dev/null || true

# 2. Gerar migrações SQLite
npx drizzle-kit generate --config=drizzle.sqlite.config.ts

# 3. Inicializar base de dados SQLite
node init-sqlite-db.js

# 4. Criar script de produção simples
cat > start-sqlite.js << 'EOF'
// Iniciar aplicação com SQLite (sem .env)
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3000';

console.log('🚀 Iniciando aplicação com SQLite...');
console.log('📍 Base de dados: ./database.db');
console.log('🌐 Porta:', process.env.PORT);

import('./dist/index.js').catch(console.error);
EOF

# 5. Rebuild aplicação
npm run build

# 6. Criar configuração PM2 simples
cat > ecosystem.sqlite.config.cjs << 'EOF'
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
    autorestart: true,
    watch: false
  }]
};
EOF

# 7. Iniciar com PM2
pm2 start ecosystem.sqlite.config.cjs

# 8. Verificar status
pm2 status
pm2 logs salao-beleza-sqlite --lines 10

INSTRUCTIONS

echo ""
echo "✅ VANTAGENS DO SQLITE:"
echo "   • Sem configuração de .env"
echo "   • Sem servidor PostgreSQL externo"
echo "   • Base de dados no ficheiro local"
echo "   • Deploy muito mais simples"
echo "   • Perfeito para VPS pequenos"
echo ""
echo "🌐 Acesso: http://seu-servidor:3000"
echo "🔑 Login: admin / admin123"
EOF

chmod +x deploy-sqlite-vps.sh