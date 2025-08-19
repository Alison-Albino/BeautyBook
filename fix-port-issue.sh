#!/bin/bash

echo "🔧 Resolvendo conflito de porta..."

# Verificar o que está usando a porta 3000
echo "🔍 Verificando processos na porta 3000:"
sudo netstat -tlnp | grep :3000 || echo "Nenhum processo encontrado na porta 3000"
sudo lsof -i :3000 || echo "Nenhum processo encontrado com lsof"

# Verificar processos Node.js em execução
echo ""
echo "🔍 Verificando processos Node.js:"
ps aux | grep node | grep -v grep || echo "Nenhum processo Node.js encontrado"

# Verificar PM2
echo ""
echo "🔍 Verificando PM2:"
pm2 list 2>/dev/null || echo "PM2 não tem processos em execução"

# Parar todos os processos que possam estar usando a porta
echo ""
echo "🛑 Parando processos que podem estar em conflito..."

# Parar PM2 se estiver em execução
pm2 delete all 2>/dev/null || echo "Nenhum processo PM2 para parar"

# Matar processos Node.js na porta 3000
sudo pkill -f "node.*3000" 2>/dev/null || echo "Nenhum processo Node.js na porta 3000"

# Aguardar um momento
sleep 2

# Verificar se a porta está livre
echo ""
echo "🔍 Verificando se a porta 3000 está livre:"
if sudo netstat -tlnp | grep :3000; then
    echo "❌ Porta 3000 ainda está em uso"
    echo "💡 Tentando usar uma porta alternativa (3001)"
    export PORT=3001
    echo "PORT=3001" >> .env
else
    echo "✅ Porta 3000 está livre"
fi

echo ""
echo "🚀 Iniciando aplicação com PM2..."

# Iniciar com PM2 usando o ecosystem.config.js
pm2 start ecosystem.config.js

# Verificar status
echo ""
echo "📊 Status da aplicação:"
pm2 status

echo ""
echo "📝 Logs em tempo real (Ctrl+C para sair):"
pm2 logs --lines 10
EOF

chmod +x fix-port-issue.sh