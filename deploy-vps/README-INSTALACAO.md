# 🚀 Instalação Pré-Buildada no VPS

## 📋 Pré-requisitos
- Node.js 18+ instalado
- PostgreSQL instalado e rodando
- Acesso SSH ao servidor

## 🔧 Passos de Instalação

1. **Upload dos arquivos** para o servidor via FTP/SSH

2. **Configurar variáveis de ambiente**:
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   Configure:
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/sua_base_dados
   SESSION_SECRET=uma-chave-muito-forte-de-pelo-menos-32-caracteres-aqui
   PORT=3000
   ```

3. **Instalar apenas dependências de produção**:
   ```bash
   npm install --omit=dev
   ```

4. **Dar permissões de execução**:
   ```bash
   chmod +x start-production.sh
   ```

5. **Executar aplicação**:
   ```bash
   ./start-production.sh
   ```

## 🔑 Login Admin Padrão
- **Usuário**: admin
- **Senha**: admin123

## 🌐 Acesso
A aplicação estará disponível em: `http://seu-servidor:3000`

## 🔄 Para reiniciar
```bash
pm2 restart beatriz-sousa
```

## 🛑 Para parar
```bash
pm2 stop beatriz-sousa
```
