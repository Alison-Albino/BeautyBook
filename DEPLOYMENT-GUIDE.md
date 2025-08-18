# 🚀 Guia de Deploy - Beatriz Sousa Appointments

## 📋 PAINÉIS RECOMENDADOS PARA VPS (Ordenados por facilidade)

### 🥇 1. COOLIFY (MAIS RECOMENDADO)
- **Por quê**: Interface moderna, deploy automático, gratuito
- **Instalação**: `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`
- **Acesso**: `http://seu-ip:8000`
- **Deploy**: Arraste e solte, ou conecte GitHub

### 🥈 2. CAPROVER  
- **Por quê**: Interface simples tipo Heroku
- **Instalação**: `npm install -g caprover && caprover serversetup`
- **Deploy**: Interface web com um clique

### 🥉 3. DOKKU
- **Por quê**: Muito estável, usado em produção
- **Instalação**: `wget https://dokku.com/install/v0.34.5/bootstrap.sh && bash bootstrap.sh`

## 🔥 DEPLOY RÁPIDO (5 MINUTOS)

### Opção A: Com Coolify
```bash
# 1. Instalar Coolify na VPS
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# 2. Baixar ZIP da Replit e extrair
# 3. Acessar http://seu-ip:8000
# 4. New Project → Docker Compose
# 5. Cole o docker-compose.yml
# 6. Configurar DB_PASSWORD
# 7. Deploy!
```

### Opção B: Docker Manual
```bash
# 1. Extrair ZIP na VPS
cd beatriz-sousa-app

# 2. Configurar
cp .env.example .env
nano .env  # Editar DB_PASSWORD

# 3. Deploy automático
chmod +x deploy.sh
./deploy.sh

# ✅ Pronto! App rodando em http://seu-ip:5000
```

## ⚙️ CONFIGURAÇÃO MÍNIMA (.env)

```bash
DATABASE_URL=postgresql://beatrizsousa:SUA_SENHA_AQUI@db:5432/beatrizsousa
DB_PASSWORD=SUA_SENHA_AQUI
NODE_ENV=production
PORT=5000
SESSION_SECRET=cole_aqui_string_aleatoria_de_32_chars
```

## 🔐 PRIMEIRO ACESSO

1. **URL**: http://seu-dominio:5000
2. **Login Admin**: admin / admin123
3. **⚠️ ALTERAR SENHA**: Imediatamente após login

## 🌐 CONFIGURAR DOMÍNIO (Opcional)

### Com Nginx
```nginx
server {
    listen 80;
    server_name seudominio.com;
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL Automático
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com
```

## 🆘 SOLUÇÃO RÁPIDA DE PROBLEMAS

### App não abre?
```bash
docker-compose logs app
# Verificar se porta 5000 está aberta
sudo ufw allow 5000
```

### Não consegue fazer login?
```bash
# Recriar admin
docker-compose exec app node -e "
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const pool = new Pool({connectionString: process.env.DATABASE_URL});
bcrypt.hash('admin123', 10).then(hash => {
  pool.query('UPDATE admin SET password = \$1 WHERE username = \$2', [hash, 'admin'])
    .then(() => console.log('Admin resetado: admin/admin123'))
    .finally(() => pool.end());
});
"
```

### Banco não conecta?
```bash
docker-compose logs db
# Verificar se PostgreSQL iniciou corretamente
```

## 📱 CONFIGURAR APÓS DEPLOY

1. **Adicionar Serviços**: Admin → Serviços → Novo
2. **WhatsApp**: Já configurado para +351 935397642
3. **Backup**: Script automático incluído

## 🔄 COMANDOS ÚTEIS

```bash
# Ver logs
docker-compose logs -f

# Restart
docker-compose restart

# Parar tudo
docker-compose down

# Backup banco
docker-compose exec db pg_dump -U beatrizsousa beatrizsousa > backup.sql

# Update aplicação
git pull  # se usar git
docker-compose up -d --build
```

---
**✅ Com este guia, você terá sua aplicação rodando em menos de 10 minutos!**