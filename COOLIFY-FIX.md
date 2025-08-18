# 🛠️ CORREÇÃO PARA COOLIFY

## 📋 SOLUÇÕES RÁPIDAS

### Problema: "Docker Compose file not found"

#### ✅ SOLUÇÃO 1: Usar apenas Dockerfile (RECOMENDADO)
1. **Volte na configuração do Coolify**
2. **Build Pack**: Selecione **Docker** (não Docker Compose)
3. **Motivo**: Coolify irá usar apenas o Dockerfile, que já está configurado

#### ✅ SOLUÇÃO 2: Se quiser usar Docker Compose
1. **No GitHub**: Adicione arquivo `docker-compose.yaml` (já criado)
2. **No Coolify**: Build Pack = **Docker Compose**

## 🚀 CONFIGURAÇÃO RECOMENDADA PARA COOLIFY

### 1. Configuração da Aplicação:
- **Build Pack**: **Docker** (simples)
- **Port**: **5000**
- **Branch**: **main**

### 2. Banco de Dados Separado:
- **Adicione PostgreSQL como serviço separado**
- **Nome**: beatriz-sousa-db
- **Database**: beatrizsousa
- **User**: beatrizsousa

### 3. Variáveis de Ambiente:
```bash
DATABASE_URL=postgresql://beatrizsousa:SUA_SENHA@beatriz-sousa-db:5432/beatrizsousa
NODE_ENV=production
PORT=5000
SESSION_SECRET=sua_string_aleatoria_32_chars
```

## 🎯 PRÓXIMOS PASSOS:

1. **Volte na configuração do Coolify**
2. **Altere Build Pack para "Docker"**
3. **Continue com o deploy**
4. **Adicione PostgreSQL como serviço separado**
5. **Configure as variáveis de ambiente**

### Para gerar SESSION_SECRET:
```bash
# Execute no terminal:
openssl rand -base64 32
```

---
**O Dockerfile já tem tudo configurado. Use Build Pack = Docker!**