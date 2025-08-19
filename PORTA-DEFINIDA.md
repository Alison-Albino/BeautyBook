# 🌐 Porta Definida: 3000

## ✅ Configuração Padrão

A aplicação está configurada para usar a **porta 3000** em todos os arquivos:

- **`.env.example`**: `PORT=3000`
- **`README-INSTALACAO.md`**: Instruções para porta 3000
- **`start-production.sh`**: Mensagem de acesso com porta 3000
- **Documentação**: Todas as referências usam porta 3000

## 📋 Configuração no VPS

No arquivo `.env`, configure:
```env
NODE_ENV=production
DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/sua_base_dados
SESSION_SECRET=uma-chave-muito-forte-de-pelo-menos-32-caracteres-aqui
PORT=3000
```

## 🌐 Acesso

Após deploy, a aplicação estará disponível em:
- **Local**: `http://localhost:3000`
- **Externo**: `http://seu-ip-vps:3000`

## 🔧 Para alterar porta

Se precisar usar outra porta, apenas altere no `.env`:
```env
PORT=8080
```

A aplicação detectará automaticamente a nova porta.