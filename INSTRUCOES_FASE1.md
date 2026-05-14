# 🚀 SIGGE - Fase 1: Instruções de Execução

## ✅ O que foi entregue nesta Fase

A **Fase 1 (Fundação)** está completa com:

### 1. Monorepo Turborepo
- Estrutura de pastas organizada (`apps/` + `packages/`)
- Configurações compartilhadas (ESLint, TypeScript, Tailwind)
- Scripts automatizados no `package.json` raiz

### 2. Banco de Dados PostgreSQL com RLS
- **Schema Prisma completo** com todas as 12 tabelas
- **Migration SQL** com Row Level Security (RLS) ativado
- **Índices otimizados** para performance multi-tenant
- **Foreign Keys** com CASCADE/RESTRICT adequados
- **Função PostgreSQL** `get_current_gremio_id()` para RLS

### 3. Cliente Prisma com Tenant Context
- `setTenantContext()` - injeta `gremio_id` na sessão PostgreSQL
- `withTenant()` - wrapper para queries isoladas
- `withTenantTransaction()` - transações com RLS
- Proteção contra vazamento de dados entre requests

### 4. Autenticação JWT Completa
- Access Token (15 min) + Refresh Token (7 dias)
- Cookies httpOnly, secure, sameSite
- Hash de senha com bcrypt (12 rounds)
- Versionamento de tokens para invalidação

### 5. Middleware Next.js
- Extração automática de subdomínio
- Verificação de JWT em todas as rotas protegidas
- Headers injetados (`x-user-id`, `x-gremio-id`)
- Proteção de rotas Super Admin
- Verificação de status do grêmio (ativo/suspenso/expirado)

### 6. Frontend
- **Login** com subdomínio, email e senha
- **Dashboard** com estatísticas em tempo real
- **Sidebar** responsiva com navegação
- **Layout protegido** (redireciona para login se não autenticado)
- **Páginas placeholder** para todos os módulos futuros

### 7. Seed de Dados
- Grêmio demo (`demo.sigge.app`)
- 4 níveis de acesso (Presidente, Diretor, Tesoureiro, Membro)
- 3 usuários demo
- 8 categorias de custo
- 1 documento de exemplo
- 1 patrimônio de exemplo

---

## 🛠️ Como Executar

### Passo 1: Instalar Dependências Globais

```bash
# Instalar pnpm (se não tiver)
npm install -g pnpm

# Verificar Node.js 22+
node -v  # Deve mostrar v22.x.x
```

### Passo 2: Configurar o Projeto

```bash
# Navegar até a pasta do projeto
cd sigge

# Instalar dependências de TODOS os pacotes
pnpm install
```

### Passo 3: Iniciar Banco de Dados

```bash
# Navegar até a pasta docker
cd docker

# Iniciar PostgreSQL e Redis
docker-compose up -d

# Verificar se está rodando
docker-compose ps
# Deve mostrar sigge-postgres e sigge-redis como "healthy"

# Voltar para a raiz
cd ..
```

### Passo 4: Configurar Variáveis de Ambiente

```bash
# Copiar template
cp apps/web/.env.example apps/web/.env

# Editar apps/web/.env se necessário (já está configurado para localhost)
```

### Passo 5: Preparar o Banco de Dados

```bash
# Gerar cliente Prisma
pnpm db:generate

# Rodar migrations (cria todas as tabelas + RLS)
pnpm db:migrate

# Popular com dados demo
pnpm db:seed
```

> **Nota:** Se o `db:migrate` perguntar por um nome, digite `init`

### Passo 6: Iniciar o Servidor

```bash
# Iniciar em modo desenvolvimento
pnpm dev
```

O servidor estará em: **http://localhost:3000**

---

## 🔑 Dados de Acesso Demo

| Campo | Valor |
|-------|-------|
| URL | http://localhost:3000/login |
| Subdomínio | `demo` |
| Email | `ana.silva@demo.sigge.app` |
| Senha | `sigge2026` |
| Cargo | Presidente (Super Admin) |

**Outros usuários demo:**
- `bruno.costa@demo.sigge.app` / `sigge2026` (Diretor)
- `carla.mendes@demo.sigge.app` / `sigge2026` (Tesoureiro)

---

## 🧪 Testando o Sistema

### 1. Login
1. Acesse http://localhost:3000/login
2. Preencha: Subdomínio=`demo`, Email=`ana.silva@demo.sigge.app`, Senha=`sigge2026`
3. Clique em "Entrar"
4. Você será redirecionado para o Dashboard

### 2. Verificar Isolamento (RLS)
```bash
# Conectar ao PostgreSQL
docker exec -it sigge-postgres psql -U sigge -d sigge

# Tentar acessar dados SEM contexto de tenant
SELECT * FROM usuarios;
# Resultado: 0 registros (RLS bloqueia!)

# Definir contexto de tenant
SET LOCAL app.current_gremio = (SELECT id FROM gremios WHERE subdominio = 'demo');

# Agora funciona!
SELECT * FROM usuarios;
# Resultado: 3 usuários do grêmio demo

# Sair
\q
```

### 3. Verificar APIs
```bash
# Login via curl
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana.silva@demo.sigge.app","senha":"sigge2026","subdominio":"demo"}'

# Buscar dados do usuário logado (requer cookie)
curl http://localhost:3000/api/auth/me \
  -H "Cookie: access_token=SEU_TOKEN_AQUI"
```

---

## 📁 Arquivos Principais Entregues

| Arquivo | Descrição |
|---------|-----------|
| `packages/database/prisma/schema.prisma` | Schema completo com 12 tabelas |
| `packages/database/prisma/migrations/*/migration.sql` | Migration com RLS |
| `packages/database/src/client.ts` | Prisma + Tenant Context |
| `packages/database/src/seed.ts` | Dados demo |
| `apps/web/middleware.ts` | Middleware de auth + tenant |
| `apps/web/lib/auth.ts` | JWT, cookies, hash de senha |
| `apps/web/app/api/auth/login/route.ts` | API de login |
| `apps/web/app/(dashboard)/page.tsx` | Dashboard com stats |
| `apps/web/components/DashboardSidebar.tsx` | Navegação lateral |

---

## ⚠️ O que PRECISA ser alterado antes da Produção

### 1. Segurança (CRÍTICO)
```bash
# Editar apps/web/.env
JWT_SECRET="sua-chave-super-secreta-de-pelo-menos-32-caracteres-aqui"
REFRESH_SECRET="outra-chave-super-secreta-de-pelo-menos-32-caracteres"
```

### 2. Banco de Dados
- Trocar `DATABASE_URL` para o Supabase em produção
- Configurar backups automáticos
- Habilitar SSL

### 3. Armazenamento
- Configurar AWS S3 (buckets, políticas IAM)
- Configurar CloudFront CDN

### 4. Email
- Configurar Resend (domínio verificado)
- Configurar DKIM/SPF

### 5. Domínio
- Configurar DNS wildcard (`*.sigge.app`)
- Configurar SSL/TLS (Let's Encrypt ou Cloudflare)

### 6. Monitoramento
- Configurar Sentry
- Configurar Vercel Analytics
- Configurar logs centralizados

---

## 🎯 Próxima Fase (Fase 2: Documentos & Assinaturas)

Quando estiver pronto, a Fase 2 incluirá:
- Editor rich-text (TipTap)
- Templates de documentos (Ofício, Ata, Memorando)
- Fluxo de assinatura digital (sequencial/paralela)
- Hash SHA-256 com salt do grêmio
- Geração de PDF com Playwright
- QR Code de validação pública

---

## 🆘 Troubleshooting

### Erro: "Cannot find module '@sigge/database'"
```bash
pnpm install
pnpm db:generate
```

### Erro: "database "sigge" does not exist"
```bash
cd docker
docker-compose down -v
docker-compose up -d
cd ..
pnpm db:migrate
pnpm db:seed
```

### Erro: "Port 3000 is already in use"
```bash
# Matar processo na porta 3000
npx kill-port 3000
# Ou usar outra porta
pnpm dev -- --port 3001
```

### Erro: "Invalid prisma.XXX.findMany() invocation"
```bash
# O RLS pode estar bloqueando. Verifique se o tenant context está sendo setado
# Nas API routes, sempre use withTenant(gremioId, () => prisma...)
```

---

**Status: ✅ Fase 1 Concluída e Pronta para Testes**
