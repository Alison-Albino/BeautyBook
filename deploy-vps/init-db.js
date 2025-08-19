// Script para inicializar a base de dados em produção
import { db } from './dist/db.js';
import bcrypt from 'bcrypt';
import { admin } from './dist/shared/schema.js';
import { eq } from 'drizzle-orm';

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