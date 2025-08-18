# 🚀 Deploy Beatriz Sousa no Coolify - Guia Completo

## 📋 Passos Rápidos para Deploy

### 1. Preparar no Coolify
1. **Criar novo projeto** no painel Coolify
2. **Selecionar "Docker Compose"**
3. **Carregar** o ficheiro `docker-compose.coolify.yml`

### 2. Configurar Variáveis de Ambiente
Configure estas variáveis **OBRIGATÓRIAS** no Coolify:

```env
NODE_ENV=production
DATABASE_URL=postgresql://seu_user:sua_password@seu_host:5432/sua_database
SESSION_SECRET=uma-chave-muito-forte-e-secreta-de-32-caracteres-ou-mais
PORT=5000
```

⚠️ **IMPORTANTE**: O `DATABASE_URL` deve apontar para uma base de dados PostgreSQL válida.

### 3. Deploy
1. Clique em **"Deploy"** no Coolify
2. Aguarde o build e deploy (pode demorar alguns minutos)
3. Acesse a URL fornecida pelo Coolify

## 🔧 Configuração da Base de Dados

### Opção A: Base de Dados PostgreSQL Externa
Se já tem uma base de dados PostgreSQL:
1. Use a string de conexão completa no `DATABASE_URL`
2. Certifique-se de que a base de dados está acessível pela rede

### Opção B: PostgreSQL no Coolify
1. No Coolify, crie um novo serviço PostgreSQL
2. Configure o `DATABASE_URL` para apontar para esse serviço
3. Exemplo: `postgresql://user:pass@postgres-service:5432/beatrizsousa`

## 👤 Primeiro Acesso

Após deploy bem-sucedido:

1. **Aceda à aplicação** na URL fornecida pelo Coolify
2. **Login administrativo**: vá para `/admin`
   - **Utilizador**: `admin`
   - **Palavra-passe**: `admin123`

⚠️ **ALTERE IMEDIATAMENTE** a palavra-passe após o primeiro login!

## ✅ Verificar se Está a Funcionar

1. **Página principal** deve carregar sem erros
2. **Login admin** em `/admin` deve funcionar
3. **APIs** devem responder (teste: `/api/services`)

## 🔍 Resolução de Problemas

### Problema: App não inicia
**Solução**: Verificar logs no Coolify
- Vá para "Logs" no painel do projeto
- Procure por erros relacionados a variáveis de ambiente ou base de dados

### Problema: Erro de base de dados
**Soluções**:
- Verificar se `DATABASE_URL` está correta
- Testar conexão à base de dados externamente
- Verificar se PostgreSQL está a aceitar conexões

### Problema: Sessões não funcionam
**Soluções**:
- Verificar se `SESSION_SECRET` está definida
- Usar uma string forte e única (32+ caracteres)

## 📱 Funcionalidades da Aplicação

Após deploy, a aplicação terá:

### 🏠 **Página Principal** (`/`)
- Formulário de agendamento de serviços
- Integração WhatsApp automática
- Design responsivo

### 👩‍💼 **Painel Administrativo** (`/admin`)
- Gestão de serviços (pestanas, sobrancelhas)
- Gestão de agendamentos
- Relatórios e estatísticas
- Filtros por data

### 📊 **APIs REST** (`/api/`)
- `/api/services` - Listar serviços
- `/api/appointments` - Gestão de agendamentos
- `/api/admin/*` - Funcionalidades administrativas

## 🔐 Segurança em Produção

1. **Alterar palavra-passe padrão** imediatamente
2. **Configurar HTTPS** (Coolify faz automaticamente)
3. **Backups regulares** da base de dados
4. **Monitorizar logs** regularmente
5. **Atualizar dependências** periodicamente

## 🚀 Domínio Personalizado

1. No painel Coolify, ir para "Domains"
2. Adicionar domínio personalizado
3. Configurar DNS para apontar para o servidor Coolify
4. SSL configurado automaticamente

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs no Coolify
2. Testar conectividade à base de dados
3. Verificar variáveis de ambiente
4. Contactar suporte técnico se necessário

---

**Nota**: Este guia assume que tem acesso a um servidor Coolify configurado e uma base de dados PostgreSQL disponível.