#!/bin/bash

echo "🚀 Iniciando Beatriz Sousa..."

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Build da aplicação
echo "🔨 Building aplicação..."
npm run build

# Executar migrações da base de dados
echo "💾 Configurando base de dados..."
npm run db:push

# Inicializar admin padrão
echo "👤 Configurando admin..."
node -e "
const bcrypt = require('bcrypt');
const { db } = require('./dist/db.js');
const { admin } = require('./dist/shared/schema.js');
const { eq } = require('drizzle-orm');

(async () => {
  try {
    const existing = await db.select().from(admin).where(eq(admin.username, 'admin')).limit(1);
    if (existing.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.insert(admin).values({ username: 'admin', password: hashedPassword });
      console.log('✅ Admin criado: admin/admin123');
    } else {
      console.log('✅ Admin já existe');
    }
    process.exit(0);
  } catch (error) {
    console.log('⚠️ Admin será criado na primeira execução');
    process.exit(0);
  }
})();
"

# Iniciar aplicação
echo "🎯 Iniciando servidor..."
exec npm start