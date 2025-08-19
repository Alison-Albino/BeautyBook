#!/bin/bash

echo "🎨 Corrigindo logo no VPS..."

# Criar diretório attached_assets se não existir
mkdir -p /home/ubuntu/Beatriz-f/attached_assets

# O logo precisa ser copiado do projeto local para o VPS
# Como não temos acesso direto, vamos criar um placeholder temporário
# e fornecer instruções para o usuário

cat << 'INSTRUCTIONS'

🚨 SOLUÇÃO PARA O LOGO EM FALTA:

Execute estes comandos no seu VPS:

1. OPÇÃO A - Copiar logo do projeto original:
   # Se você tem o logo original, copie-o para:
   cp "caminho/do/logo/original.png" "/home/ubuntu/Beatriz-f/attached_assets/logo bs_1754516178309.png"

2. OPÇÃO B - Baixar logo da internet (exemplo):
   cd /home/ubuntu/Beatriz-f/attached_assets
   # Substitua pela URL do seu logo real
   wget -O "logo bs_1754516178309.png" "https://via.placeholder.com/200x80/8B5CF6/FFFFFF?text=Beatriz+Sousa"

3. OPÇÃO C - Usar logo existente no projeto:
   cd /home/ubuntu/Beatriz-f/attached_assets
   # Se já tem outro logo, renomeie-o
   cp image_1754517849595.png "logo bs_1754516178309.png"

4. Após copiar o logo, rebuild o projeto:
   cd /home/ubuntu/Beatriz-f
   npm run build

5. Iniciar aplicação:
   pm2 start ecosystem.config.cjs
   pm2 status

INSTRUCTIONS

echo ""
echo "📝 Arquivos de logo disponíveis no attached_assets:"
ls -la attached_assets/ | grep -E "\.(png|jpg|jpeg)$" || echo "Nenhum logo encontrado"
EOF

chmod +x fix-logo-vps.sh