# 🐘 Configuração PostgreSQL no Coolify

## ✅ Base de Dados Configurada

Com base na configuração mostrada:
- **Serviço**: `postgresql-database`
- **Imagem**: `postgres:17-alpine`
- **Username**: `postgres`
- **Password**: `123456`
- **Database**: `postgres`

## 🔧 Variáveis de Ambiente para o Projeto

### DATABASE_URL
```env
DATABASE_URL=postgresql://postgres:123456@postgresql-database:5432/postgres
```

### Todas as Variáveis Necessárias:
```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:123456@postgresql-database:5432/postgres
SESSION_SECRET=sua-chave-secreta-muito-forte-32-caracteres-minimo
PORT=5000
```

## 🚀 Passos para Deploy

1. **No projeto Coolify do Beatriz Sousa**:
   - Ir para "Environment Variables"
   - Adicionar as variáveis acima
   - Salvar configurações

2. **Fazer Deploy**:
   - O projeto irá conectar automaticamente à base de dados
   - As tabelas serão criadas automaticamente pelo Drizzle
   - O admin padrão será criado (username: admin, password: admin123)

## 📝 Estrutura da Base de Dados

O sistema criará automaticamente estas tabelas:
- **services** - Serviços (pestanas, sobrancelhas)
- **clients** - Dados dos clientes
- **appointments** - Agendamentos
- **admin** - Utilizadores administrativos

## ⚡ Verificação Pós-Deploy

Após deploy bem-sucedido:
1. Aceder à URL da aplicação
2. Testar a página principal
3. Fazer login admin em `/admin` com:
   - Username: `admin`
   - Password: `admin123`
4. Alterar a password imediatamente

## 🔍 Troubleshooting

### Se houver erro de conexão:
1. Verificar se ambos os serviços (app + database) estão running
2. Confirmar que DATABASE_URL está correta
3. Verificar logs do container da aplicação

### Comandos úteis:
```bash
# Ver logs da aplicação
docker logs [container-name]

# Testar conexão à base de dados
docker exec -it [postgres-container] psql -U postgres -d postgres
```

## 🎯 Resultado Final

Com esta configuração, a aplicação terá:
- Conexão segura à base de dados PostgreSQL
- Tabelas criadas automaticamente
- Admin padrão configurado
- Sistema totalmente funcional

Pronto para produção!