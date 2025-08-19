#!/bin/bash

echo "📦 Criando pacote completo para VPS..."

# Criar diretório temporário
mkdir -p salao-beleza-sqlite

# Copiar arquivos essenciais
cp -r client/ salao-beleza-sqlite/
cp -r server/ salao-beleza-sqlite/
cp -r shared/ salao-beleza-sqlite/
cp -r sqlite-migrations/ salao-beleza-sqlite/
cp package.json salao-beleza-sqlite/
cp package-lock.json salao-beleza-sqlite/
cp tsconfig.json salao-beleza-sqlite/
cp vite.config.ts salao-beleza-sqlite/
cp postcss.config.js salao-beleza-sqlite/
cp tailwind.config.ts salao-beleza-sqlite/
cp components.json salao-beleza-sqlite/
cp drizzle.sqlite.config.ts salao-beleza-sqlite/

# Copiar logos (se existirem)
mkdir -p salao-beleza-sqlite/attached_assets
cp attached_assets/*.png salao-beleza-sqlite/attached_assets/ 2>/dev/null || true

# Criar scripts de instalação
cat > salao-beleza-sqlite/install-vps.sh << 'EOF'
#!/bin/bash

echo "🚀 Instalação do Sistema de Salão - SQLite"

# Instalar dependências Node.js
npm ci

# Aplicar migrações SQLite
npx drizzle-kit push --config=drizzle.sqlite.config.ts

# Inicializar base de dados
node init-sqlite-db.js

# Build da aplicação
npm run build

echo "✅ Instalação concluída!"
echo "🌐 Para iniciar: pm2 start start-sqlite.js --name salao-beleza"
EOF

cat > salao-beleza-sqlite/start-sqlite.js << 'EOF'
// Script de inicialização para produção com SQLite
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3000';

console.log('🚀 Iniciando aplicação com SQLite...');
console.log('📍 Base de dados: ./database.db');
console.log('🌐 Porta:', process.env.PORT);

import('./dist/index.js').catch(console.error);
EOF

cat > salao-beleza-sqlite/ecosystem.sqlite.config.cjs << 'EOF'
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
    watch: false
  }]
};
EOF

# Copiar script de inicialização da DB
cp init-sqlite-db.js salao-beleza-sqlite/

# Tornar scripts executáveis
chmod +x salao-beleza-sqlite/install-vps.sh

# Criar arquivo TAR
tar -czf salao-beleza-sqlite.tar.gz salao-beleza-sqlite/

# Limpar diretório temporário
rm -rf salao-beleza-sqlite/

echo "✅ Pacote criado: salao-beleza-sqlite.tar.gz"
echo ""
echo "📋 INSTRUÇÕES PARA O VPS:"
echo "1. scp salao-beleza-sqlite.tar.gz ubuntu@seu-servidor:~/"
echo "2. ssh ubuntu@seu-servidor"
echo "3. tar -xzf salao-beleza-sqlite.tar.gz"
echo "4. cd salao-beleza-sqlite"
echo "5. ./install-vps.sh"
echo "6. pm2 start ecosystem.sqlite.config.cjs"
EOF

chmod +x create-vps-package.sh