import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/simple-sqlite-schema";
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// Configuração do banco SQLite
const dbPath = process.env.NODE_ENV === 'production' ? './database.db' : './dev-database.db';

// Criar diretório se não existir
const dbDir = dirname(dbPath);
if (!existsSync(dbDir) && dbDir !== '.') {
  mkdirSync(dbDir, { recursive: true });
}

// Conexão SQLite
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL'); // Melhor performance

export const db = drizzle(sqlite, { schema });

// Auto-migrate no startup
try {
  console.log('🔄 Executando migrações do banco...');
  migrate(db, { migrationsFolder: './sqlite-migrations' });
  console.log('✅ Migrações concluídas!');
} catch (error) {
  console.log('ℹ️ Nenhuma migração necessária ou erro menor:', error);
}