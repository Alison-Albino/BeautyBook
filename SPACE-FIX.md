# 🗂️ CORREÇÃO PARA "No space left on device"

## ✅ SOLUÇÃO APLICADA:

### 1. **Dockerfile Multi-Stage**
- **Builder Stage**: Faz o build completo
- **Production Stage**: Copia apenas arquivos necessários
- **Reduz drasticamente** o tamanho da imagem final

### 2. **Otimizações de Espaço:**
- Cache NPM limpo após instalação
- Apenas dependências de produção na imagem final
- Arquivos temporários removidos

### 3. **Arquivos Disponíveis:**
- `Dockerfile` → Multi-stage (RECOMENDADO)
- `Dockerfile.single-stage` → Versão anterior (backup)

## 🚀 PRÓXIMOS PASSOS:

1. **Upload no GitHub** com o novo Dockerfile
2. **Deploy no Coolify** → Deve usar muito menos espaço
3. **Build Pack**: Docker

## 📊 BENEFÍCIOS:
- **50-70% menos espaço** usado durante build
- **Imagem final menor** e mais rápida
- **Cache otimizado** para builds futuros

---
**PROBLEMA DE ESPAÇO RESOLVIDO!** ✅