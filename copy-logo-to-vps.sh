#!/bin/bash

echo "📋 Comandos para copiar logo para o VPS..."

cat << 'VPS_COMMANDS'

Execute no seu VPS (/home/ubuntu/Beatriz-f):

# 1. Criar diretório
mkdir -p attached_assets

# 2. Criar logo temporário (até ter o original)
cd attached_assets
curl -o "logo bs_1754516178309.png" "https://via.placeholder.com/200x80/8B5CF6/FFFFFF?text=Beatriz+Sousa"

# OU usar logo existente se disponível:
# cp image_1754517849595.png "logo bs_1754516178309.png"

# 3. Verificar se foi criado
ls -la "logo bs_1754516178309.png"

# 4. Voltar ao diretório raiz e rebuildar
cd /home/ubuntu/Beatriz-f
npm run build

# 5. Iniciar aplicação
pm2 start ecosystem.config.cjs --env production

# 6. Verificar status
pm2 status
pm2 logs salao-beleza --lines 5

VPS_COMMANDS

echo ""
echo "✨ Após executar estes comandos, a aplicação estará disponível em:"
echo "   http://seu-servidor-ip:3000"
echo "   Login: admin"  
echo "   Senha: admin123"
EOF

chmod +x copy-logo-to-vps.sh