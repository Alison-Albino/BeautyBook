#!/bin/bash

# Script para executar após deploy no Coolify
# Execute este script no terminal do container via Coolify Dashboard

echo "🚀 Inicializando aplicação Beatriz Sousa..."

# Aguardar banco estar disponível
echo "⏳ Aguardando banco de dados..."
sleep 5

# Push do schema
echo "📊 Criando tabelas no banco..."
npm run db:push

# Criar usuário admin padrão
echo "👤 Criando usuário admin..."
node -e "
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

async function setupAdmin() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Verificar se admin já existe
    const existingAdmin = await pool.query('SELECT * FROM admin WHERE username = \$1', ['admin']);
    
    if (existingAdmin.rows.length === 0) {
      // Criar admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO admin (username, password) VALUES (\$1, \$2)',
        ['admin', hashedPassword]
      );
      console.log('✅ Admin criado com sucesso!');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   ⚠️  ALTERE A SENHA após primeiro login!');
    } else {
      console.log('ℹ️  Admin já existe');
    }
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error.message);
  } finally {
    await pool.end();
  }
}

setupAdmin();
"

echo ""
echo "🎉 Setup concluído!"
echo ""
echo "📱 Próximos passos:"
echo "1. Acesse a aplicação via URL do Coolify"
echo "2. Faça login com admin/admin123" 
echo "3. ALTERE A SENHA imediatamente"
echo "4. Adicione seus serviços no painel"
echo ""