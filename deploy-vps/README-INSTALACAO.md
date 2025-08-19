# 🚀 Instalação Pré-Buildada no VPS

## 📋 Pré-requisitos
- Node.js 18+ instalado
- PostgreSQL instalado e rodando
- Acesso SSH ao servidor

## 🔧 Passos de Instalação

1. **Upload dos arquivos** para o servidor via FTP/SSH

2. **Instalar apenas dependências de produção** (arquivo .env já configurado):
   ```bash
   npm install --omit=dev
   ```

3. **Dar permissões de execução**:
   ```bash
   chmod +x start-production.sh
   ```

4. **Executar aplicação**:
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
