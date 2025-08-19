#!/bin/bash

echo "🚀 Iniciando Sistema Gestão Salão de Beleza (Produção)..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 18+ primeiro."
    echo "💡 Ubuntu/Debian: sudo apt update && sudo apt install nodejs npm"
    echo "💡 CentOS/RHEL: sudo yum install nodejs npm"
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versão $NODE_VERSION encontrada. É necessário Node.js 18 ou superior."
    exit 1
fi

# Verificar se arquivo .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado. Configure primeiro:"
    echo "1. Copie o .env de exemplo: cp .env.example .env"
    echo "2. Edite com os dados da sua base de dados: nano .env"
    exit 1
fi

# Criar diretório de logs
mkdir -p logs

# Instalar dependências de produção se não existirem
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências de produção..."
    npm install --omit=dev --no-audit --no-fund
fi

# Verificar se PM2 está instalado globalmente
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2 globalmente..."
    npm install -g pm2
fi

# Verificar se PostgreSQL está acessível
echo "🗄️  Verificando conexão com base de dados..."
source .env

if ! pg_isready -h $(echo $DATABASE_URL | sed -n 's/.*@\(.*\):.*/\1/p') &> /dev/null; then
    echo "⚠️  Aviso: PostgreSQL pode não estar acessível"
    echo "💡 Certifique-se que o PostgreSQL está em execução e acessível"
fi

# Inicializar base de dados
echo "🗄️  Inicializando esquema da base de dados..."
if node init-db.js; then
    echo "✅ Base de dados inicializada com sucesso"
else
    echo "❌ Erro ao inicializar base de dados"
    echo "💡 Verifique a variável DATABASE_URL no arquivo .env"
    exit 1
fi

# Parar aplicação anterior se existir
pm2 delete salao-beleza 2>/dev/null || true

# Iniciar aplicação com PM2
echo "🚀 Iniciando aplicação..."
pm2 start ecosystem.config.js

# Configurar PM2 para iniciar no boot (apenas se for a primeira vez)
if ! pm2 list | grep -q "salao-beleza"; then
    pm2 save
    echo "💡 Execute 'sudo env PATH=\$PATH:\$(which node) pm2 startup' para auto-iniciar no boot"
fi

echo ""
echo "✅ Aplicação iniciada com sucesso!"
echo "🌐 Acesso: http://localhost:3000"
echo "🔑 Login admin: admin / admin123"
echo ""
echo "📊 Comandos úteis:"
echo "   pm2 status          - Ver estado da aplicação"
echo "   pm2 logs salao-beleza    - Ver logs em tempo real"
echo "   pm2 restart salao-beleza - Reiniciar aplicação"
echo "   pm2 stop salao-beleza    - Parar aplicação"
