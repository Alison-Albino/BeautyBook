# 🚀 Setup Coolify com GitHub - Passo a Passo

## 📋 PASSO A PASSO COMPLETO

### 1️⃣ Preparar GitHub Repository

```bash
# Criar repositório no GitHub (via interface web)
# Nome sugerido: beatriz-sousa-appointments
# Descrição: Sistema de agendamentos para salão de beleza
# Público ou Privado (sua escolha)
```

### 2️⃣ Fazer Upload do Projeto

**Via interface GitHub (mais fácil):**
1. Acesse seu novo repositório no GitHub
2. Clique em "uploading an existing file"
3. Faça upload do ZIP baixado da Replit
4. Commit com mensagem: "Initial commit - Beatriz Sousa appointment system"

**Ou via git (se preferir):**
```bash
# Na pasta do projeto extraído
git init
git add .
git commit -m "Initial commit - Beatriz Sousa appointment system"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/beatriz-sousa-appointments.git
git push -u origin main
```

### 3️⃣ Configurar no Coolify

#### A. Acessar Coolify
```bash
# Acesse via navegador
http://SEU_IP_VPS:8000
```

#### B. Conectar GitHub
1. Vá em **Settings** → **Source**
2. Clique **"+ Add Source"**
3. Selecione **GitHub**
4. Autorize o acesso ao seu repositório
5. Teste a conexão

#### C. Criar Novo Projeto
1. **Projects** → **"+ New Project"**
2. **Name**: `beatriz-sousa-app`
3. **Description**: `Sistema de agendamentos Beatriz Sousa`
4. Clique **Create**

#### D. Criar Application
1. **"+ New Resource"** → **Application**
2. **Source**: Selecione seu repositório GitHub
3. **Branch**: `main`
4. **Build Pack**: `Docker`
5. **Name**: `beatriz-sousa-app`

### 4️⃣ Configurar Banco de Dados

#### A. Adicionar PostgreSQL
1. Na mesma tela do projeto: **"+ New Resource"** → **Database**
2. **Type**: `PostgreSQL 15`
3. **Name**: `beatriz-sousa-db`
4. **Database Name**: `beatrizsousa`
5. **Username**: `beatrizsousa`
6. **Password**: Gerar uma senha forte
7. **Save**

### 5️⃣ Configurar Variáveis de Ambiente

#### A. Na aplicação, vá em **Environment Variables**:
```bash
DATABASE_URL=postgresql://beatrizsousa:SUA_SENHA_DB@beatriz-sousa-db:5432/beatrizsousa
DB_PASSWORD=SUA_SENHA_DB
NODE_ENV=production
PORT=5000
SESSION_SECRET=cole_aqui_string_aleatoria_32_chars
```

#### B. Para gerar SESSION_SECRET:
```bash
# Execute no seu computador ou VPS
openssl rand -base64 32
```

### 6️⃣ Deploy

1. **Deploy** → **Deploy Now**
2. Aguarde o build (3-5 minutos)
3. Coolify irá:
   - Clonar do GitHub
   - Build com Docker
   - Criar containers
   - Configurar rede interna

### 7️⃣ Push do Schema e Admin

#### A. Acessar container da aplicação:
```bash
# No Coolify, vá em Applications → beatriz-sousa-app → Terminal
# Ou via SSH na VPS:
docker exec -it [CONTAINER_ID] sh
```

#### B. Executar setup:
```bash
# Dentro do container
npm run db:push

# Criar admin user
node -e "
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const pool = new Pool({connectionString: process.env.DATABASE_URL});
bcrypt.hash('admin123', 10).then(hash => {
  pool.query('INSERT INTO admin (username, password) VALUES (\$1, \$2) ON CONFLICT (username) DO UPDATE SET password = \$2', ['admin', hash])
    .then(() => console.log('✅ Admin criado: admin/admin123'))
    .finally(() => pool.end());
});
"
```

### 8️⃣ Configurar Domínio (Opcional)

#### A. No Coolify:
1. **Applications** → **beatriz-sousa-app** → **Domains**
2. **Add Domain**: `seudominio.com`
3. **SSL**: Enable (automático com Let's Encrypt)

### 9️⃣ Testar Aplicação

1. **URL de teste**: `https://SEU_APP.coolify.io` (gerado automaticamente)
2. **Login admin**: admin / admin123
3. **Mudar senha**: Imediatamente após primeiro login

## 🔄 Deploy Automático

### Configurar Auto-Deploy
1. **Applications** → **beatriz-sousa-app** → **Source**
2. **Auto Deploy**: `Enable`
3. **Branch**: `main`

**Agora toda vez que você fizer push no GitHub, o deploy será automático!**

## 🛠️ Comandos Úteis Coolify

### Ver Logs
```bash
# No Coolify Dashboard
Applications → beatriz-sousa-app → Logs
```

### Restart Application
```bash
# No Coolify Dashboard  
Applications → beatriz-sousa-app → Actions → Restart
```

### Terminal do Container
```bash
# No Coolify Dashboard
Applications → beatriz-sousa-app → Terminal
```

## 🆘 Troubleshooting

### Build falha?
```bash
# Verificar logs no Coolify
# Comum: problemas de memória RAM
# Solução: Aumentar RAM da VPS ou usar swap
```

### App não conecta no banco?
```bash
# Verificar se DATABASE_URL está correta
# Formato: postgresql://user:pass@host:5432/database
# Host deve ser o nome do serviço: beatriz-sousa-db
```

### Não consegue fazer login?
```bash
# Entrar no terminal do container e recriar admin
# Usar o script node -e acima
```

## 📊 Monitoramento

### Métricas no Coolify
- CPU, RAM, Disk usage
- Logs em tempo real  
- SSL certificate status
- Backup automático do banco

---
**✅ Com GitHub + Coolify você terá CI/CD automático e deploys instantâneos!**