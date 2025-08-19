// Script para inicializar a base de dados em produção
// Carregar variáveis de ambiente primeiro
import './load-env.js';

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { pgTable, serial, varchar, timestamp, text, integer, boolean } from 'drizzle-orm/pg-core';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
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
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        envVars[key.trim()] = value;
      }
    }
  });
  
  // Set environment variables
  Object.assign(process.env, envVars);
  console.log('✅ Arquivo .env carregado com sucesso');
} catch (error) {
  console.error('❌ Erro ao ler arquivo .env:', error.message);
  console.error('💡 Certifique-se de que o arquivo .env existe e está configurado corretamente');
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
  }
}

initializeDatabase();