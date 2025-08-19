// Script de inicialização para produção com SQLite
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3000';

console.log('🚀 Iniciando aplicação com SQLite...');
console.log('📍 Base de dados: ./database.db');
console.log('🌐 Porta:', process.env.PORT);

import('./dist/index.js').catch(console.error);