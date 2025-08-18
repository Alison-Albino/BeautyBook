# Deploy da Aplicação Beatriz Sousa no Coolify

## Pré-requisitos
1. Conta no Coolify configurada
2. Base de dados PostgreSQL configurada
3. Variáveis de ambiente configuradas

## Configuração no Coolify

### 1. Variáveis de Ambiente Necessárias
Configure estas variáveis no painel do Coolify:

```
NODE_ENV=production
DATABASE_URL=postgresql://usuario:senha@host:5432/database_name
SESSION_SECRET=sua-chave-secreta-muito-forte-aqui
PORT=5000
```

### 2. Configuração da Base de Dados
Certifique-se de que tem uma base de dados PostgreSQL disponível. Pode criar uma no próprio Coolify ou usar um serviço externo.

### 3. Deploy Steps

#### Opção A: Docker Compose (Recomendado)
1. No Coolify, crie um novo projeto
2. Selecione "Docker Compose"
3. Cole o conteúdo do arquivo `docker-compose.coolify.yml`
4. Configure as variáveis de ambiente
5. Deploy

#### Opção B: Dockerfile
1. No Coolify, crie um novo projeto
2. Selecione "Dockerfile"
3. Use o `Dockerfile.coolify`
4. Configure as variáveis de ambiente
5. Deploy

### 4. Configuração Pós-Deploy

#### Inicializar a Base de Dados
Após o primeiro deploy, acesse o container e execute:

```bash
# Entre no container
docker exec -it [container_name] /bin/sh

# Execute as migrações (se necessário)
# O Drizzle já deve ter criado as tabelas automaticamente
```

#### Criar Conta de Administrador
Execute este comando no container ou via terminal do Coolify:

```bash
# Script para criar admin (pode executar via API ou diretamente na base de dados)
node -e "
const bcrypt = require('bcrypt');
console.log(bcrypt.hashSync('admin123', 10));
"
```

Depois execute na base de dados:
```sql
INSERT INTO admins (username, password) 
VALUES ('admin', '[hash_gerado_acima]') 
ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password;
```

### 5. Verificação do Deploy

1. Acesse a URL fornecida pelo Coolify
2. Verifique se a página principal carrega
3. Teste o login administrativo em `/admin` com:
   - Utilizador: `admin`
   - Senha: `admin123`

### 6. Configurações de Produção

#### SSL/HTTPS
O Coolify configura automaticamente SSL/HTTPS.

#### Domínio Personalizado
1. No painel do Coolify, vá para "Domains"
2. Adicione seu domínio personalizado
3. Configure os DNS para apontar para o servidor

#### Backups
Configure backups regulares da base de dados através do painel do Coolify.

## Troubleshooting

### Problema: App não inicia
- Verifique se todas as variáveis de ambiente estão configuradas
- Verifique se a base de dados está acessível
- Consulte os logs do container

### Problema: Erro de conexão com a base de dados
- Verifique a string de conexão DATABASE_URL
- Teste a conectividade da rede entre containers
- Verifique se o PostgreSQL está em execução

### Problema: Sessões não persistem
- Verifique se SESSION_SECRET está configurado
- Certifique-se de que é uma string forte e única

## Comandos Úteis

```bash
# Ver logs da aplicação
docker logs [container_name]

# Acessar container
docker exec -it [container_name] /bin/sh

# Reiniciar aplicação
# Use o painel do Coolify para restart
```

## Segurança

1. **ALTERE A SENHA PADRÃO** do admin imediatamente após o deploy
2. Configure SESSION_SECRET com uma chave forte
3. Use HTTPS sempre (configurado automaticamente pelo Coolify)
4. Configure backups regulares da base de dados
5. Monitore os logs regularmente