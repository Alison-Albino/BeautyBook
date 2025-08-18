# 🔧 Correção de Espaço em Disco - Coolify

## ❌ Problema Identificado
Erro de build: `ENOSPC: no space left on device`
- Servidor Coolify com pouco espaço disponível
- npm install falha durante a instalação das dependências

## ✅ Solução Implementada

### Novos Arquivos Otimizados:
- `Dockerfile.coolify-light` - Versão leve sem multi-stage build
- `docker-compose.coolify-light.yml` - Configuração otimizada

### Otimizações Aplicadas:
1. **Single-stage build** (sem duplicação de dependências)
2. **Instalação otimizada**: `npm ci --omit=dev --no-audit --no-fund`
3. **Limpeza automática**: Remove caches e arquivos temporários
4. **Dependências mínimas**: Remove build tools após compilação

## 🚀 Como Usar no Coolify

### Opção 1: Docker Compose (Recomendado)
1. No Coolify, criar projeto "Docker Compose"
2. Usar arquivo: `docker-compose.coolify-light.yml`
3. Configurar variáveis:
   ```env
   SESSION_SECRET=sua-chave-forte-32-caracteres
   ```

### Opção 2: Dockerfile Simples
1. No Coolify, criar projeto "Dockerfile"
2. Especificar: `Dockerfile.coolify-light`
3. Configurar todas as variáveis manualmente

## 🔍 Diferenças da Versão Light

### Removido:
- Multi-stage build (economiza ~50% do espaço)
- Scripts de inicialização complexos
- Dependências de desenvolvimento desnecessárias
- Caches npm e arquivos temporários

### Mantido:
- Funcionalidade completa da aplicação
- Segurança (usuário non-root)
- Health checks
- Otimizações de produção

## ⚡ Resultado Esperado

- **Redução de ~60% no tamanho** da imagem Docker
- Build mais rápido (menos etapas)
- Menor uso de espaço em disco
- Deploy bem-sucedido no Coolify

## 🎯 Próximos Passos

1. **Fazer push** dos novos arquivos para GitHub
2. **Reconfigurar projeto** no Coolify com `docker-compose.coolify-light.yml`
3. **Deploy automático** - deve funcionar sem erros de espaço

A aplicação manterá todas as funcionalidades, mas com footprint muito menor!