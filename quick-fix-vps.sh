#!/bin/bash

echo "🔧 Aplicando correção rápida para carregar .env no VPS..."

# Criar arquivo load-env.js corrigido
cat > load-env.js << 'EOF'
// Utilitário para carregar variáveis de ambiente do arquivo .env
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
  const envPath = join(__dirname, '.env');
  
  if (!existsSync(envPath)) {
    console.error('❌ Arquivo .env não encontrado em:', envPath);
    console.error('💡 Certifique-se de criar o arquivo .env na raiz do projeto');
    return false;
  }

  try {
    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const equalIndex = trimmedLine.indexOf('=');
        if (equalIndex > 0) {
          const key = trimmedLine.substring(0, equalIndex).trim();
          let value = trimmedLine.substring(equalIndex + 1).trim();
          
          // Remove aspas se presentes
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          envVars[key] = value;
        }
      }
    });
    
    // Definir variáveis de ambiente
    Object.assign(process.env, envVars);
    
    console.log('✅ Variáveis de ambiente carregadas');
    return true;
  } catch (error) {
    console.error('❌ Erro ao ler arquivo .env:', error.message);
    return false;
  }
}

// Carregar automaticamente
if (!loadEnv()) {
  process.exit(1);
}

export { loadEnv };
EOF

# Corrigir server/db.ts
cat > server/db.ts << 'EOF'
// Carregar variáveis de ambiente primeiro
import '../load-env.js';

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

export const db = drizzle(pool, { schema });
EOF

# Corrigir server/index.ts
sed -i "s|import './load-env.js';|import '../load-env.js';|g" server/index.ts

# Corrigir init-db.js
sed -i "1i// Carregar variáveis de ambiente primeiro" init-db.js
sed -i "2i import './load-env.js';" init-db.js
sed -i "3i " init-db.js

echo "✅ Correções aplicadas!"
echo ""
echo "🧪 Agora teste:"
echo "   node init-db.js"
echo ""
echo "Se funcionar, execute:"
echo "   ./start-production.sh"
EOF

chmod +x quick-fix-vps.sh