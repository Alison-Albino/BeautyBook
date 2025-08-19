#!/bin/bash

echo "📦 Criando pacote completo para deploy em VPS..."

# Nome do pacote
PACKAGE_NAME="salao-beleza-vps-v1.0"

# Criar diretório temporário para o pacote
rm -rf "$PACKAGE_NAME" 2>/dev/null
mkdir -p "$PACKAGE_NAME"

# Copiar arquivos essenciais para produção
echo "📋 Copiando arquivos necessários..."

# Build da aplicação (frontend + backend compilado)
npm run build

# Copiar estrutura básica
cp -r deploy-vps/* "$PACKAGE_NAME/"

# Copiar build da aplicação
cp -r dist "$PACKAGE_NAME/"

# Copiar assets e configurações
cp package.json "$PACKAGE_NAME/"
cp package-lock.json "$PACKAGE_NAME/" 2>/dev/null || true
cp drizzle.config.ts "$PACKAGE_NAME/"
cp tsconfig.json "$PACKAGE_NAME/"

# Limpar dependências de desenvolvimento no package.json do pacote
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('$PACKAGE_NAME/package.json', 'utf8'));
delete pkg.devDependencies;
pkg.scripts = {
  'start': 'NODE_ENV=production node dist/index.js',
  'db:push': 'drizzle-kit push'
};
fs.writeFileSync('$PACKAGE_NAME/package.json', JSON.stringify(pkg, null, 2));
"

# Dar permissões de execução aos scripts
chmod +x "$PACKAGE_NAME/start-production.sh"

# Criar arquivo ZIP
echo "🗜️  Criando arquivo ZIP..."
zip -r "${PACKAGE_NAME}.zip" "$PACKAGE_NAME/" -x "*.git*" "*/node_modules/*"

# Limpar diretório temporário
rm -rf "$PACKAGE_NAME"

echo ""
echo "✅ Pacote criado com sucesso: ${PACKAGE_NAME}.zip"
echo ""
echo "📁 Conteúdo do pacote:"
echo "   - Aplicação compilada para produção"
echo "   - Scripts de instalação automática"
echo "   - Documentação completa"
echo "   - Configurações otimizadas"
echo ""
echo "🚀 Próximos passos:"
echo "   1. Descarregar o arquivo: ${PACKAGE_NAME}.zip"
echo "   2. Upload para o seu VPS em /var/www/salao-beleza/"
echo "   3. Extrair: unzip ${PACKAGE_NAME}.zip"
echo "   4. Seguir README-INSTALACAO.md"
echo ""