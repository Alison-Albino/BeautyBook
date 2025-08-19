# 🔧 Configuração Correta das Portas

## 📋 Esclarecimento das Portas

### **PostgreSQL (Base de Dados)**
- **Porta**: 5432 (padrão do PostgreSQL)
- **Configuração**: `DATABASE_URL=postgresql://user:pass@localhost:5432/database`

### **Aplicação Node.js**
- **Porta**: 3000 (aplicação web)
- **Configuração**: `PORT=3000`

## ✅ Configuração Correta no .env

```env
NODE_ENV=production
DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/sua_base_dados
SESSION_SECRET=uma-chave-muito-forte-de-pelo-menos-32-caracteres-aqui
PORT=3000
```

## 🌐 Como Funciona

1. **PostgreSQL** roda na porta **5432** (interna)
2. **Aplicação Node.js** roda na porta **3000** (acesso web)
3. A aplicação conecta ao PostgreSQL via `localhost:5432`
4. Utilizadores acedem à aplicação via `http://servidor:3000`

## 🔗 Fluxo de Conexão

```
Utilizador → http://servidor:3000 → Aplicação Node.js
                                        ↓
                                   PostgreSQL:5432
```

## ⚠️ Resumo

- **5432**: Porta do PostgreSQL (não alterar)
- **3000**: Porta da aplicação web (pode alterar se necessário)
- Ambas as portas são necessárias e têm funções diferentes