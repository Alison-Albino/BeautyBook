# 🚀 Deploy Pré-Buildado para VPS

## ✅ Versão Pré-Buildada Criada

A aplicação foi compilada com sucesso e está pronta para upload direto no VPS.

### 📦 Arquivo Gerado
- **beatriz-sousa-prebuild.tar.gz** (contém toda a aplicação buildada)

## 📋 Instruções de Deploy no VPS

### 1. **Upload para VPS**
```bash
# Via SCP (do seu computador local)
scp beatriz-sousa-prebuild.tar.gz user@seu-servidor:/home/user/

# Ou use FTP/SFTP para fazer upload do arquivo .tar.gz
```

### 2. **No VPS - Extrair e Configurar**
```bash
# Extrair arquivos
tar -xzf beatriz-sousa-prebuild.tar.gz
cd deploy-vps/

# Configurar variáveis de ambiente
cp .env.example .env
nano .env
```

### 3. **Configurar .env**
```env
NODE_ENV=production
DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/sua_base_dados
SESSION_SECRET=uma-chave-muito-forte-de-pelo-menos-32-caracteres-aqui
PORT=3000
```

### 4. **Instalar Dependências e Executar**
```bash
# Instalar apenas dependências de produção
npm install --omit=dev

# Dar permissões de execução
chmod +x start-production.sh

# Executar aplicação
./start-production.sh
```

## 🔑 **Login Padrão**
- **Usuário**: admin
- **Senha**: admin123

## 🌐 **Acesso**
A aplicação estará disponível em: `http://seu-servidor:3000`

## 📁 **Conteúdo da Versão Pré-Buildada**
- ✅ Frontend compilado (`dist/`)
- ✅ Backend transpilado (`server/`)
- ✅ Dependências definidas (`package.json`)
- ✅ Scripts de inicialização automática
- ✅ Inicialização automática de base de dados
- ✅ Configuração de PM2 para produção

## 🔄 **Gestão da Aplicação**
```bash
# Verificar status
pm2 status

# Reiniciar
pm2 restart beatriz-sousa

# Ver logs
pm2 logs beatriz-sousa

# Parar
pm2 stop beatriz-sousa
```

## ⚡ **Vantagens desta Abordagem**
- ❌ **Sem build no servidor** (evita "core dump")
- ✅ **Upload direto** dos arquivos compilados
- ✅ **Instalação rápida** (apenas dependências de produção)
- ✅ **Configuração automática** da base de dados
- ✅ **PM2 integrado** para gestão de processos