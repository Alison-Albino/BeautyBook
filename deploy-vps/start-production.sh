#!/bin/bash

echo "🚀 Iniciando Beatriz Sousa (Produção)..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

# Verificar se arquivo .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado. Copie .env.example para .env e configure."
    exit 1
fi

# Instalar dependências de produção se não existirem
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install --omit=dev --no-audit --no-fund
fi

# Verificar se PM2 está instalado globalmente
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
fi

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "💡 Execute: cp .env.example .env && nano .env"
    echo "   Configure DATABASE_URL e outras variáveis"
    exit 1
fi

# Carregar variáveis de ambiente e inicializar base de dados
echo "🗄️  Inicializando base de dados..."
source .env && node init-db.js

# Iniciar aplicação com PM2 (carregando .env)
echo "🚀 Iniciando aplicação..."
pm2 start dist/index.js --name "beatriz-sousa" --env production --env-file .env

# Configurar PM2 para iniciar no boot
pm2 save
pm2 startup

echo "✅ Aplicação iniciada com sucesso!"
echo "🌐 Acesso: http://localhost:3000"
echo "🔑 Login admin: admin / admin123"
