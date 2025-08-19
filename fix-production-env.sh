#!/bin/bash

echo "🔧 Corrigindo carregamento do .env na versão compilada..."

cd /home/ubuntu/Beatriz-f

# Parar aplicação
pm2 stop salao-beleza 2>/dev/null || true

# Método 1: Usar dotenv package para carregar .env
npm install dotenv

# Criar um script wrapper que carrega .env antes do dist/index.js
cat > start-app.js << 'EOF'
// Script wrapper para carregar .env antes da aplicação principal
import { config } from 'dotenv';
import { readFileSync } from 'fs';

// Carregar .env manualmente
try {
  const envContent = readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        let value = trimmedLine.substring(equalIndex + 1).trim();
        
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        process.env[key] = value;
      }
    }
  });
  
  console.log('✅ Variáveis de ambiente carregadas');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'configurado' : 'não definido');
  console.log('PORT:', process.env.PORT || '3000');
  
} catch (error) {
  console.error('❌ Erro ao carregar .env:', error.message);
  process.exit(1);
}

// Importar aplicação principal
import('./dist/index.js').catch(console.error);
EOF

# Atualizar ecosystem.config.js para usar o novo script
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'salao-beleza',
    script: 'start-app.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production'
    },
    max_memory_restart: '1G',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Criar diretório de logs
mkdir -p logs

echo "✅ Configuração atualizada!"
echo ""
echo "🚀 Iniciando aplicação com nova configuração..."

# Iniciar aplicação
pm2 start ecosystem.config.js

echo ""
echo "📊 Status:"
pm2 status

echo ""
echo "📝 Logs (últimas 10 linhas):"
pm2 logs salao-beleza --lines 10 --nostream

echo ""
echo "🌐 Se tudo correu bem, acesse:"
echo "   http://seu-servidor:3000"
echo "   Login: admin / admin123"
EOF

chmod +x fix-production-env.sh