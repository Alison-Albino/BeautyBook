# 🔧 Correção Nixpacks - Start Command

## ❌ Problema Identificado
O Nixpacks detectou automaticamente a aplicação como "static site" e está usando Caddy em vez do nosso script personalizado.

## ✅ Solução - Arquivo nixpacks.toml
Criei o arquivo `nixpacks.toml` para forçar o Nixpacks a usar nosso comando de início personalizado.

## 📝 Próximos Passos

1. **Fazer push** do arquivo `nixpacks.toml` para GitHub
2. **No Coolify**: 
   - Fazer **redeploy** do projeto
   - Ou criar novo projeto com o repositório atualizado

## 🎯 Resultado Esperado
Após redeploy, o Nixpacks vai:
- Instalar Node.js 18
- Executar `npm ci` 
- Executar `npm run build`
- Iniciar com `./start.sh` (nosso script personalizado)

O arquivo `nixpacks.toml` força o comportamento correto e ignora a detecção automática.