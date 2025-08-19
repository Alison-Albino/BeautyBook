#!/bin/bash

echo "🔧 Corrigindo script init-db.js para carregar .env..."

# Criar uma versão corrigida do init-db.js
cat > init-db.js << 'EOF'
// Script para inicializar a base de dados em produção
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Carregar variáveis de ambiente do arquivo .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  const envContent = readFileSync(join(__dirname, '.env'), 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        let value = valueParts.join('=').trim();
        // Remove aspas se presentes
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        envVars[key.trim()] = value;
      }
    }
  });
  
  // Definir variáveis de ambiente
  Object.assign(process.env, envVars);
  console.log('✅ Arquivo .env carregado com sucesso');
  console.log('🔗 DATABASE_URL configurado:', process.env.DATABASE_URL ? 'Sim' : 'Não');
} catch (error) {
  console.error('❌ Erro ao ler arquivo .env:', error.message);
  console.error('💡 Certifique-se de que o arquivo .env existe na raiz do projeto');
  process.exit(1);
}

// Schema inline (evita problemas de importação)
const admin = pgTable('admin', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Conexão da base de dados
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

const db = drizzle(pool, { schema: { admin } });

async function initializeDatabase() {
  try {
    console.log('🔍 Verificando se admin já existe...');
    
    const existingAdmin = await db.select().from(admin).where(eq(admin.username, 'admin')).limit(1);
    
    if (existingAdmin.length === 0) {
      console.log('👤 Criando admin padrão...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await db.insert(admin).values({
        username: 'admin',
        password: hashedPassword
      });
      
      console.log('✅ Admin criado com sucesso!');
      console.log('   Utilizador: admin');
      console.log('   Palavra-passe: admin123');
      console.log('   ⚠️  ALTERE A PALAVRA-PASSE APÓS O PRIMEIRO LOGIN!');
    } else {
      console.log('✅ Admin já existe');
    }
    
    console.log('🎉 Inicialização da base de dados concluída!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro na inicialização da base de dados:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeDatabase();
EOF

echo "✅ Script init-db.js corrigido!"
echo ""
echo "🚀 Agora pode executar novamente:"
echo "   ./start-production.sh"
echo ""
echo "ou testar diretamente:"
echo "   node init-db.js"
EOF

chmod +x fix-init-db.sh