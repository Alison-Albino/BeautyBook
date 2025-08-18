# 💄 Sistema de Agendamentos Beatriz Sousa

Sistema completo de agendamentos para salão de beleza com painel administrativo, desenvolvido com React, TypeScript, Express.js e PostgreSQL.

## ✨ Funcionalidades

- 📅 Sistema de agendamentos online
- 👤 Painel administrativo completo
- 📊 Relatórios e estatísticas
- 💬 Integração WhatsApp automática
- 📱 Design responsivo
- 🔒 Autenticação segura
- 🎨 Interface moderna e intuitiva

## 🚀 Deployment em VPS

### Painéis Recomendados para VPS

#### 1. **Coolify** (⭐ MAIS RECOMENDADO)
- **Por quê**: Interface moderna, deploy com Docker, gratuito, fácil de usar
- **Instalação**: `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`
- **URL**: https://coolify.io

#### 2. **CapRover** 
- **Por quê**: Interface simples, deploy com um clique, boa documentação
- **Instalação**: `npm install -g caprover && caprover serversetup`
- **URL**: https://caprover.com

#### 3. **Dokku**
- **Por quê**: Heroku-like, self-hosted, muito estável
- **Instalação**: `wget -NP . https://dokku.com/install/v0.34.5/bootstrap.sh && bash bootstrap.sh`

### 📋 Passo a Passo - Deploy com Coolify (Recomendado)

#### 1. Preparar VPS
```bash
# Ubuntu 20.04+ ou Debian 11+
sudo apt update && sudo apt upgrade -y
sudo apt install curl wget git -y
```

#### 2. Instalar Coolify
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

#### 3. Baixar e Configurar Aplicação
```bash
# Download do arquivo ZIP da Replit
unzip beatriz-sousa-app.zip
cd beatriz-sousa-app

# Configurar variáveis
cp .env.example .env
nano .env  # Editar com seus dados
```

#### 4. Deploy via Coolify
1. Acesse Coolify: `http://seu-ip:8000`
2. Crie conta admin
3. Vá em "Projects" → "New Project"
4. Selecione "Docker Compose"
5. Cole o conteúdo do `docker-compose.yml`
6. Configure as variáveis de ambiente
7. Clique em "Deploy"

### 🐳 Deploy Manual com Docker

```bash
# 1. Clone/extrair aplicação
cd beatriz-sousa-app

# 2. Configurar ambiente
cp .env.example .env
nano .env  # Editar DB_PASSWORD e SESSION_SECRET

# 3. Executar script de deploy
chmod +x deploy.sh
./deploy.sh
```

### 🔧 Configuração Manual (Sem Docker)

#### 1. Instalar Dependências do Sistema
```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt install postgresql postgresql-contrib
```

#### 2. Configurar PostgreSQL
```bash
sudo -u postgres psql
CREATE DATABASE beatrizsousa;
CREATE USER beatrizsousa WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE beatrizsousa TO beatrizsousa;
\q
```

#### 3. Configurar Aplicação
```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
nano .env  # Configurar DATABASE_URL

# Build da aplicação
npm run build

# Executar migração
npm run db:push

# Iniciar aplicação
npm start
```

#### 4. Configurar Nginx (Proxy Reverso)
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 5. SSL com Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

### 📱 Configuração Pós-Deploy

#### 1. Acesso Admin
- **URL**: `http://seu-dominio.com`
- **Login**: admin
- **Senha**: admin123
- **⚠️ IMPORTANTE**: Altere a senha após primeiro login

#### 2. Configurar WhatsApp
- Número padrão: +351 935397642
- Editar em: Admin → Configurações (se implementado)

#### 3. Adicionar Serviços
1. Login no painel admin
2. Vá em "Serviços"
3. Adicione seus serviços (Sobrancelhas, Pestanas, etc.)

### 🔒 Segurança

```bash
# Configurar firewall
sudo ufw allow 22   # SSH
sudo ufw allow 80   # HTTP
sudo ufw allow 443  # HTTPS
sudo ufw enable

# Backup automático do banco
# Adicionar ao crontab: 0 2 * * * pg_dump beatrizsousa > /backup/db_$(date +%Y%m%d).sql
```

### 📊 Monitoramento

#### Logs da Aplicação
```bash
# Docker
docker-compose logs -f

# Manual
pm2 logs  # se usando PM2
journalctl -u beatriz-sousa  # se usando systemd
```

#### Comandos Úteis
```bash
# Restart aplicação
docker-compose restart

# Backup banco
docker-compose exec db pg_dump -U beatrizsousa beatrizsousa > backup.sql

# Restore banco
docker-compose exec -T db psql -U beatrizsousa beatrizsousa < backup.sql
```

## 🆘 Solução de Problemas

### Problema: Aplicação não inicia
```bash
# Verificar logs
docker-compose logs app

# Verificar banco
docker-compose logs db
```

### Problema: Não consegue fazer login
```bash
# Recriar admin user
docker-compose exec app node -e "
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
// ... script de criação do admin
"
```

### Problema: Erro de conexão com banco
- Verificar variável DATABASE_URL no .env
- Confirmar se PostgreSQL está rodando
- Testar conexão: `docker-compose exec db psql -U beatrizsousa`

## 📞 Suporte

Para dúvidas sobre deployment:
1. Verifique os logs primeiro
2. Confirme configurações do .env
3. Teste conectividade do banco
4. Verifique portas abertas no firewall

---
*Sistema desenvolvido para Beatriz Sousa - Salão de Beleza* 💄