# 🚀 Deploy Sistema Gestão Salão de Beleza - VPS

## 📋 Pré-requisitos no Servidor
- **Ubuntu 20.04+** ou **CentOS 7+**
- **Node.js 18+** instalado
- **PostgreSQL 12+** instalado e rodando
- **Nginx** (recomendado para proxy reverso)
- **Acesso SSH** ao servidor

## 🗄️ Configuração PostgreSQL

1. **Criar base de dados:**
   ```sql
   sudo -u postgres psql
   CREATE DATABASE salao_beleza;
   CREATE USER salao_user WITH PASSWORD 'senha_segura_123';
   GRANT ALL PRIVILEGES ON DATABASE salao_beleza TO salao_user;
   \q
   ```

## ⚙️ Instalação da Aplicação

1. **Upload do projeto** para `/var/www/salao-beleza/`

2. **Configurar variáveis de ambiente:**
   ```bash
   cd /var/www/salao-beleza/
   cp .env.example .env
   nano .env
   ```
   
   **Editar o .env com os seus dados:**
   ```env
   DATABASE_URL="postgresql://salao_user:senha_segura_123@localhost:5432/salao_beleza"
   NODE_ENV=production
   PORT=3000
   SESSION_SECRET="sua-chave-super-secreta-aqui"
   ```

3. **Instalar dependências:**
   ```bash
   npm install --omit=dev --no-audit --no-fund
   ```

4. **Dar permissões de execução:**
   ```bash
   chmod +x start-production.sh
   ```

5. **Executar script de instalação:**
   ```bash
   ./start-production.sh
   ```

## 🔧 Configuração Nginx (Recomendada)

Criar `/etc/nginx/sites-available/salao-beleza`:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
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

Activar o site:
```bash
sudo ln -s /etc/nginx/sites-available/salao-beleza /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔑 Credenciais de Acesso
- **Usuário Admin**: `admin`
- **Senha**: `admin123`

## 🌐 Acesso à Aplicação
- **Com Nginx**: `http://seu-dominio.com`
- **Directo**: `http://seu-servidor:3000`

## 🔄 Comandos PM2

**Ver status:**
```bash
pm2 status
pm2 logs salao-beleza
```

**Reiniciar:**
```bash
pm2 restart salao-beleza
```

**Parar:**
```bash
pm2 stop salao-beleza
```

**Monitorizar:**
```bash
pm2 monit
```

## 🔒 Segurança Adicional (Recomendada)

1. **Firewall:**
   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```

2. **SSL Certificate (Let's Encrypt):**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d seu-dominio.com
   ```

## 🆘 Resolução de Problemas

**Base de dados não conecta:**
- Verificar se PostgreSQL está a correr: `sudo systemctl status postgresql`
- Verificar DATABASE_URL no `.env`
- Testar conexão: `psql "postgresql://salao_user:senha@localhost/salao_beleza"`

**Aplicação não inicia:**
- Verificar logs: `pm2 logs salao-beleza`
- Verificar se porta 3000 está livre: `netstat -tlnp | grep :3000`

**Problemas de permissões:**
```bash
sudo chown -R $USER:$USER /var/www/salao-beleza/
chmod -R 755 /var/www/salao-beleza/
```
