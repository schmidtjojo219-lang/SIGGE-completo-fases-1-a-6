# 🚀 SIGGE - Sistema Interno de Gestão do Grêmio Estudantil

> SaaS Multi-tenant de alta complexidade para gestão de grêmios estudantis, inspirado no SIPAC.

## 📋 Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS 4 |
| **Backend** | Next.js API Routes, Node.js 22 |
| **Banco de Dados** | PostgreSQL 16 com Row Level Security (RLS) |
| **ORM** | Prisma 6 |
| **Cache** | Redis 7 |
| **Autenticação** | JWT (jose) + Refresh Tokens |
| **PDF Engine** | Playwright (14x mais rápido que Puppeteer) |
| **Armazenamento** | AWS S3 |
| **Email** | Resend |
| **Monorepo** | Turborepo + pnpm |

## 🏗️ Arquitetura Multi-Tenant

```
┌─────────────────────────────────────────────────────────────┐
│                    SIGGE SaaS Platform                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Grêmio A   │  │  Grêmio B   │  │    Super Admin      │ │
│  │  (Escola X) │  │  (Escola Y) │  │   (Você - Dono)     │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         └────────────────┼─────────────────────┘            │
│                          ▼                                  │
│              ┌─────────────────────┐                        │
│              │   Next.js API       │                        │
│              │   (Middleware de    │                        │
│              │    Tenant Context)   │                        │
│              └──────────┬──────────┘                        │
│                         ▼                                   │
│              ┌─────────────────────┐                        │
│              │  PostgreSQL + RLS   │                        │
│              │  SET LOCAL app.     │                        │
│              │  current_gremio =   │                        │
│              │  'uuid-do-gremio'   │                        │
│              └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### Isolamento de Dados (RLS)

O PostgreSQL Row Level Security garante que **mesmo com bug no código**, um grêmio nunca acessa dados de outro:

```sql
-- Antes de cada query:
SET LOCAL app.current_gremio = 'uuid-do-gremio';

-- O PostgreSQL aplica automaticamente:
WHERE gremio_id = current_setting('app.current_gremio')::uuid
```

## 🚀 Início Rápido

### Pré-requisitos

- [Node.js 22+](https://nodejs.org/)
- [pnpm 9+](https://pnpm.io/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### 1. Clone e Instale

```bash
git clone <repo-url> sigge
cd sigge
pnpm install
```

### 2. Configure o Banco de Dados

```bash
# Iniciar PostgreSQL e Redis
cd docker
docker-compose up -d

# Voltar para a raiz
cd ..

# Copiar variáveis de ambiente
cp apps/web/.env.example apps/web/.env

# Gerar cliente Prisma
pnpm db:generate

# Rodar migrations
pnpm db:migrate

# Popular com dados demo
pnpm db:seed
```

### 3. Inicie o Servidor

```bash
pnpm dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### 4. Login Demo

| Campo | Valor |
|-------|-------|
| Subdomínio | `demo` |
| Email | `ana.silva@demo.sigge.app` |
| Senha | `sigge2026` |

## 📁 Estrutura do Projeto

```
sigge/
├── apps/
│   ├── web/                 # Next.js 15 (App Router)
│   │   ├── app/
│   │   │   ├── (auth)/      # Rotas públicas
│   │   │   ├── (dashboard)/ # Dashboard do grêmio
│   │   │   └── (super-admin)/ # Painel do dono
│   │   ├── components/      # Componentes React
│   │   └── lib/             # Utilitários
│   └── worker/              # BullMQ workers
├── packages/
│   ├── database/            # Prisma + RLS
│   ├── shared/              # Types, Zod schemas, utils
│   ├── pdf-engine/          # Playwright PDF generator
│   └── config/              # ESLint, TS, Tailwind
└── docker/                  # Docker Compose
```

## 🔐 Segurança

- **JWT** com expiração curta (15 minutos)
- **Refresh Tokens** (7 dias) com versionamento
- **RLS** no PostgreSQL (última linha de defesa)
- **Hash SHA-256** para documentos assinados
- **Salt único** por grêmio para criptografia
- **Logs de segurança** em todas as ações críticas

## 📦 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia servidor de desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm db:generate` | Gera cliente Prisma |
| `pnpm db:migrate` | Roda migrations |
| `pnpm db:push` | Push schema para o banco |
| `pnpm db:studio` | Interface visual do Prisma |
| `pnpm db:seed` | Popula dados demo |
| `pnpm db:reset` | Reseta banco + seed |

## 🗓️ Cronograma de Desenvolvimento

| Fase | Módulo | Status |
|------|--------|--------|
| ✅ Fase 1 | Fundação (Monorepo, RLS, Auth) | **Concluído** |
| ⏳ Fase 2 | Documentos & Assinaturas Digitais | Pendente |
| ⏳ Fase 3 | Patrimônio & QR Code | Pendente |
| ⏳ Fase 4 | Eleições (Urna Eletrônica) | Pendente |
| ⏳ Fase 5 | Financeiro & Auditoria | Pendente |
| ⏳ Fase 6 | Super Admin & Deploy | Pendente |

## 📝 Licença

Proprietário - Todos os direitos reservados.

---

<p align="center">
  <strong>SIGGE</strong> - Governança estudantil de próxima geração 🎓
</p>
