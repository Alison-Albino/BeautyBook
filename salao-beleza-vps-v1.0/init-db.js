// Script para inicializar a base de dados em produção
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { pgTable, serial, varchar, timestamp, text, integer, boolean } from 'drizzle-orm/pg-core';

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