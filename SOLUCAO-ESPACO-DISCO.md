# 🚨 Problema de Espaço no Servidor Coolify

## ❌ Erro Identificado
`no space left on device` - O servidor Coolify não tem espaço suficiente para fazer o build.

## 💡 Soluções Possíveis

### Opção 1: Reduzir Tamanho do Build
✅ **Implementada**: Adicionei `package-lock.json` ao `.gitignore` para reduzir o contexto de build.

### Opção 2: Deploy Direto via FTP/SSH (Recomendado)
Como o servidor Coolify tem limitações de espaço, sugiro fazer deploy direto:

1. **Fazer build local**:
   ```bash
   npm install
   npm run build
   ```

2. **Upload via FTP** dos arquivos necessários:
   - `dist/` (build da aplicação)
   - `client/dist/` (frontend)
   - `package.json`
   - `start.sh`
   - `node_modules/` (apenas dependências de produção)

3. **Executar no servidor**:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

### Opção 3: Usar Outro Serviço
Alternativamente, pode usar:
- **Railway** (mais espaço, similar ao Coolify)
- **Render** (free tier generoso)
- **DigitalOcean App Platform**
- **Vercel** (para aplicações Node.js)

## 🔧 Tentativa Atual
Reduzi o tamanho removendo `package-lock.json` do repositório. Isso pode resolver o problema de espaço no Coolify.

## 📋 Próximos Passos
1. Fazer push das alterações
2. Tentar redeploy no Coolify
3. Se continuar falhando, considerar deploy direto ou outro serviço