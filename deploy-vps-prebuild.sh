#!/bin/bash

echo "🏗️  Criando versão pré-buildada para VPS..."

# Criar diretório de deploy
mkdir -p deploy-vps

# Copiar arquivos necessários
cp -r dist deploy-vps/
cp -r server deploy-vps/
cp -r shared deploy-vps/
cp package.json deploy-vps/
cp start-production.sh deploy-vps/
cp init-db.js deploy-vps/
cp init.sql deploy-vps/

# Criar .env já configurado
cat > deploy-vps/.env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://usuario_prod:G3min1-DB-Passw0rd-2024!@localhost:5432/app_prod
SESSION_SECRET=e43a9b2f5c7d81a0b3f2c5d1e8a4b6c9d7e6f8a3c5d7e9f2a4b8c1d3e5a7b9c1
PORT=3000
EOF

# Criar .env.example para backup
cat > deploy-vps/.env.example << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
SESSION_SECRET=uma-chave-muito-forte-de-pelo-menos-32-caracteres-aqui
PORT=3000
EOF

# Criar README de instalação
cat > deploy-vps/README-INSTALACAO.md << 'EOF'
# 🚀 Instalação Pré-Buildada no VPS

## 📋 Pré-requisitos
- Node.js 18+ instalado
- PostgreSQL instalado e rodando
- Acesso SSH ao servidor

## 🔧 Passos de Instalação

1. **Upload dos arquivos** para o servidor via FTP/SSH

2. **Instalar apenas dependências de produção** (arquivo .env já configurado):
   ```bash
   npm install --omit=dev
   ```

3. **Dar permissões de execução**:
   ```bash
   chmod +x start-production.sh
   ```

4. **Executar aplicação**:
   ```bash
   ./start-production.sh
   ```

## 🔑 Login Admin Padrão
- **Usuário**: admin
- **Senha**: admin123

## 🌐 Acesso
A aplicação estará disponível em: `http://seu-servidor:3000`

## 🔄 Para reiniciar
```bash
pm2 restart beatriz-sousa
```

## 🛑 Para parar
```bash
pm2 stop beatriz-sousa
```
EOF

# Criar script de produção otimizado
cat > deploy-vps/start-production.sh << 'EOF'
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

# Verificar se .env existe (deve existir já configurado)
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "💡 O .env deveria estar incluído no pacote"
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
EOF

chmod +x deploy-vps/start-production.sh

echo "✅ Versão pré-buildada criada em ./deploy-vps/"
echo ""
echo "📋 Próximos passos:"
echo "1. Comprimir pasta deploy-vps: tar -czf beatriz-sousa-prebuild.tar.gz deploy-vps/"
echo "2. Upload para VPS via FTP/SSH"
echo "3. Extrair: tar -xzf beatriz-sousa-prebuild.tar.gz"
echo "4. Seguir README-INSTALACAO.md"