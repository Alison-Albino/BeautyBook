#!/bin/bash

echo "🚀 Iniciando aplicação Beatriz Sousa em modo produção..."

# Esperar pela base de dados
echo "⏳ Aguardando conexão com a base de dados..."
until nc -z $(echo $DATABASE_URL | sed 's/.*@//;s/:.*//' | sed 's/.*\/\///') $(echo $DATABASE_URL | sed 's/.*://;s/\/.*//' | tail -c 5); do
  echo "   Base de dados ainda não está pronta..."
  sleep 2
done

echo "✅ Base de dados está pronta!"

# Executar migrações Drizzle
echo "📦 Executando migrações..."
npm run db:push || {
  echo "⚠️  Migrações falharam, mas continuando (pode ser normal na primeira execução)"
}

# Inicializar admin se necessário
echo "👤 Verificando admin padrão..."
node init-db.js || {
  echo "⚠️  Inicialização do admin falhou, mas continuando"
}

# Iniciar aplicação
echo "🎯 Iniciando servidor..."
exec node dist/index.js