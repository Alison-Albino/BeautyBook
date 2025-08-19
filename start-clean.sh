#!/bin/bash

echo "🧹 Iniciando aplicação com limpeza completa..."

# Parar todos os processos relacionados
echo "🛑 Parando processos existentes..."
pm2 delete all 2>/dev/null || true
sudo pkill -f "node.*dist/index.js" 2>/dev/null || true
sudo pkill -f "node.*server" 2>/dev/null || true

# Aguardar
sleep 3

# Verificar porta
if sudo netstat -tlnp | grep :3000 > /dev/null; then
    echo "⚠️  Porta 3000 ainda ocupada, usando porta 3001"
    export PORT=3001
    # Atualizar .env se necessário
    if ! grep -q "PORT=3001" .env; then
        echo "PORT=3001" >> .env
    fi
    # Atualizar ecosystem.config.js
    sed -i 's/PORT: 3000/PORT: 3001/g' ecosystem.config.js
fi

# Carregar variáveis de ambiente
source .env

# Iniciar com PM2
echo "🚀 Iniciando aplicação..."
pm2 start ecosystem.config.js

# Mostrar status
echo ""
echo "✅ Aplicação iniciada!"
echo "📊 Status:"
pm2 status

echo ""
echo "🌐 Acesso:"
if [ "$PORT" = "3001" ]; then
    echo "   http://seu-servidor:3001"
else
    echo "   http://seu-servidor:3000"
fi

echo ""
echo "🔑 Login:"
echo "   Usuário: admin"
echo "   Senha: admin123"

echo ""
echo "📝 Para ver logs: pm2 logs salao-beleza"
echo "🔄 Para reiniciar: pm2 restart salao-beleza"
echo "🛑 Para parar: pm2 stop salao-beleza"
EOF

chmod +x start-clean.sh