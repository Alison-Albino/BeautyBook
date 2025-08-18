# 💅 Beatriz Sousa - Sistema de Agendamento

Sistema completo de gestão para salão de beleza, desenvolvido com tecnologias modernas para otimizar operações administrativas e melhorar a experiência do cliente.

## 🌟 Funcionalidades

### 🏠 Para Clientes
- **Agendamento Simplificado**: Apenas nome e telefone
- **Integração WhatsApp**: Confirmação automática via WhatsApp
- **Design Responsivo**: Funciona perfeitamente em todos os dispositivos
- **Interface Intuitiva**: Processo de agendamento em 3 passos

### 👩‍💼 Painel Administrativo
- **Gestão de Serviços**: Pestanas, sobrancelhas, preços e durações
- **Gestão de Agendamentos**: Visualização e controlo completo
- **Relatórios Avançados**: Estatísticas de receita por período
- **Filtros Inteligentes**: Por dia, semana, mês, ano ou período personalizado
- **Autenticação Segura**: Sistema de login protegido

## 🛠️ Tecnologias

### Frontend
- **React 18** com TypeScript
- **Vite** para desenvolvimento rápido
- **Tailwind CSS** + **Shadcn/ui** para design moderno
- **TanStack Query** para gestão de estado do servidor
- **Wouter** para roteamento
- **React Hook Form** + **Zod** para validações

### Backend
- **Node.js** com **Express**
- **TypeScript** end-to-end
- **PostgreSQL** com **Drizzle ORM**
- **Sessões seguras** com bcrypt
- **APIs RESTful** completas

## 🚀 Deploy Direto no Coolify (Node.js)

### 1. Configurar no Coolify
1. **Criar projeto** → **Node.js Application**
2. **Conectar GitHub** → Selecionar repositório
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `./start.sh`
5. **Port**: `5000`

### 2. Variáveis de Ambiente
```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:123456@postgresql-database:5432/postgres
SESSION_SECRET=chave-secreta-muito-forte-32-caracteres-minimo
PORT=5000
```

### 3. Deploy
Clique em **"Deploy"** - muito mais rápido que Docker!

📖 **Guia Completo**: [`COOLIFY-NODEJS-DEPLOY.md`](./COOLIFY-NODEJS-DEPLOY.md)

## 🏃‍♂️ Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- npm ou yarn

### Instalação
```bash
# Instalar dependências
npm install

# Configurar base de dados
# Criar ficheiro .env com DATABASE_URL

# Executar migrações
npm run db:push

# Iniciar em modo desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5000`

## 📱 Como Usar

### Agendamento (Cliente)
1. Aceder à página principal
2. Escolher serviço (pestanas/sobrancelhas)
3. Selecionar data e hora
4. Inserir nome e telefone
5. Confirmação automática via WhatsApp

### Administração
1. Aceder a `/admin`
2. Fazer login com credenciais de admin
3. Gerir serviços, agendamentos e visualizar relatórios

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start

# Migrações de base de dados
npm run db:push

# Verificação de tipos
npm run check
```

## 📁 Estrutura do Projeto

```
beatriz-sousa/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   └── lib/           # Utilitários e configurações
├── server/                # Backend Express
│   ├── routes.ts          # Rotas da API
│   ├── storage.ts         # Interface de dados
│   └── db.ts             # Configuração da base de dados
├── shared/               # Tipos e esquemas partilhados
│   └── schema.ts         # Esquemas Drizzle + Zod
├── Dockerfile.coolify    # Docker otimizado para Coolify
└── docker-compose.coolify.yml # Configuração Docker Compose
```

## 🎨 Design System

- **Cores**: Bege (#F3ECE3), Preto (#000000), Castanho (#9F766E), Rosa (#C8A49C)
- **Tipografia**: Inter (sistema padrão)
- **Componentes**: Baseados em Radix UI
- **Ícones**: Lucide React

## 🔐 Segurança

- ✅ Validação de formulários client-side e server-side
- ✅ Senhas hasheadas com bcrypt
- ✅ Sessões seguras com cookies HttpOnly
- ✅ Validação de tipos com TypeScript + Zod
- ✅ Sanitização de inputs
- ✅ HTTPS automático (via Coolify)

## 📊 Funcionalidades do Admin

- **Dashboard**: Visão geral com estatísticas
- **Gestão de Serviços**: CRUD completo
- **Agendamentos**: Visualização e gestão
- **Relatórios**: Receita filtrada por período
- **Clientes**: Base de dados de clientes

## 🌍 Características Locais (Portugal)

- **Idioma**: Português (Portugal)
- **Telefone**: Validação formato português (+351)
- **Datas**: Formato DD/MM/AAAA
- **Moeda**: Euro (€)
- **WhatsApp**: Integração com número português

## 🔄 Atualizações Futuras

- [ ] Sistema de notificações push
- [ ] Calendário integrado
- [ ] Relatórios em PDF
- [ ] Multi-idioma
- [ ] App mobile
- [ ] Integração com sistemas de pagamento

## 📞 Suporte

Para questões técnicas ou suporte:
1. Verificar documentação completa
2. Consultar logs da aplicação
3. Testar conectividade da base de dados

---

**Desenvolvido com ❤️ para o mercado português de beleza e estética**