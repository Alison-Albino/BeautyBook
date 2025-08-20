import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "./shared/simple-sqlite-schema.js";

const dbPath = process.env.NODE_ENV === 'production' ? './database.db' : './dev-database.db';
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

const exampleServices = [
  {
    name: "Corte de Cabelo",
    description: "Corte moderno e personalizado",
    price: 2500, // €25.00 in cents
    duration: 45, // 45 minutes
    isActive: true
  },
  {
    name: "Manicure",
    description: "Tratamento completo das unhas das mãos",
    price: 1500, // €15.00
    duration: 30,
    isActive: true
  },
  {
    name: "Pedicure",
    description: "Tratamento completo das unhas dos pés",
    price: 2000, // €20.00
    duration: 45,
    isActive: true
  },
  {
    name: "Coloração",
    description: "Coloração profissional do cabelo",
    price: 4500, // €45.00
    duration: 90,
    isActive: true
  },
  {
    name: "Escova e Penteado",
    description: "Escova modeladora e penteado",
    price: 3000, // €30.00
    duration: 60,
    isActive: true
  },
  {
    name: "Massagem Relaxante",
    description: "Massagem corporal relaxante",
    price: 5000, // €50.00
    duration: 60,
    isActive: true
  }
];

async function initServices() {
  try {
    console.log('🔄 Verificando serviços existentes...');
    
    const existingServices = await db.select().from(schema.services);
    
    if (existingServices.length === 0) {
      console.log('📝 Adicionando serviços de exemplo...');
      
      for (const service of exampleServices) {
        await db.insert(schema.services).values(service);
        console.log(`✅ Adicionado: ${service.name}`);
      }
      
      console.log('🎉 Serviços de exemplo adicionados com sucesso!');
    } else {
      console.log(`ℹ️ ${existingServices.length} serviços já existem na base de dados.`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao inicializar serviços:', error);
  } finally {
    sqlite.close();
  }
}

initServices();