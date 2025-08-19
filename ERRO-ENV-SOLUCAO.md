# ❌ Erro: DATABASE_URL não definida

## Problema
O script `init-db.js` não consegue aceder à variável `DATABASE_URL` porque o arquivo `.env` não foi configurado.

## ✅ Solução Imediata

No VPS, execute estes comandos:

```bash
# 1. Parar aplicação atual
pm2 stop beatriz-sousa
pm2 delete beatriz-sousa

# 2. Configurar .env
cp .env.example .env
nano .env
```

**Configure o .env com seus dados reais:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://seu_usuario_real:sua_senha_real@localhost:5432/sua_base_dados_real
SESSION_SECRET=uma-chave-muito-forte-de-pelo-menos-32-caracteres-aqui
PORT=3000
```

```bash
# 3. Executar novamente
./start-production.sh
```

## 🔧 Versão Corrigida

Criei uma versão melhorada do script que:
- ✅ Verifica se `.env` existe antes de continuar
- ✅ Carrega variáveis de ambiente corretamente
- ✅ Mostra erro claro se `.env` não estiver configurado

## 📋 Exemplo de Configuração Real

```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:minha_senha@localhost:5432/beatriz_sousa
SESSION_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
PORT=3000
```

## ⚠️ Importante
- Substitua `seu_usuario_real`, `sua_senha_real`, `sua_base_dados_real` pelos valores reais do seu PostgreSQL
- A `SESSION_SECRET` deve ter pelo menos 32 caracteres aleatórios