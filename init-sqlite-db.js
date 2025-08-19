// Script para inicializar base de dados SQLite com dados iniciais
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './shared/simple-sqlite-schema.ts';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const dbPath = process.env.NODE_ENV === 'production' ? './database.db' : './dev-database.db';
console.log('🗃️ Inicializando base de dados SQLite:', dbPath);

const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

try {
  // Criar tabelas se não existirem (migrações serão aplicadas automaticamente no startup)
  console.log('🔄 Criando tabelas...');
  
  // Verificar se já existe um admin
  const existingAdmin = db.select().from(schema.users).where(eq(schema.users.username, 'admin')).get();
  
  if (!existingAdmin) {
    // Criar utilizador admin
    console.log('👤 Criando utilizador admin...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = db.insert(schema.users).values({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    }).run();
    
    console.log('✅ Utilizador admin criado');
  } else {
    console.log('ℹ️ Utilizador admin já existe');
  }

  // Verificar se existem serviços
  const existingServices = db.select().from(schema.services).limit(1).all();
  
  if (existingServices.length === 0) {
    // Adicionar serviços de exemplo
    console.log('💄 Adicionando serviços de exemplo...');
    
    const services = [
      { name: 'Corte de Cabelo', description: 'Corte personalizado', duration: 45, price: 2500 },
      { name: 'Coloração', description: 'Coloração completa', duration: 120, price: 6000 },
      { name: 'Brushing', description: 'Brushing profissional', duration: 30, price: 1500 },
      { name: 'Manicure', description: 'Manicure completa', duration: 45, price: 1800 },
      { name: 'Pedicure', description: 'Pedicure relaxante', duration: 60, price: 2200 },
      { name: 'Tratamento Capilar', description: 'Tratamento intensivo', duration: 90, price: 4000 }
    ];

    for (const service of services) {
      db.insert(schema.services).values(service).run();
    }
    
    console.log('✅ Serviços de exemplo adicionados');
  } else {
    console.log('ℹ️ Serviços já existem na base de dados');
  }

  console.log('🎉 Base de dados SQLite inicializada com sucesso!');
  console.log('📍 Ficheiro da base de dados:', dbPath);
  console.log('🔑 Login: admin / admin123');
  
} catch (error) {
  console.error('❌ Erro ao inicializar base de dados:', error);
  process.exit(1);
} finally {
  sqlite.close();
}