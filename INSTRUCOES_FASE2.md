# 🚀 SIGGE - Fase 2: Documentos & Assinaturas Digitais

## ✅ O que foi entregue nesta Fase

### 1. API Routes de Documentos

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/documentos` | GET | Listar documentos (com filtros de status, tipo, busca) |
| `/api/documentos` | POST | Criar novo documento (rascunho) |
| `/api/documentos/[id]` | GET | Buscar documento específico |
| `/api/documentos/[id]` | PUT | Editar documento (somente rascunho) |
| `/api/documentos/[id]` | DELETE | Excluir documento (somente rascunho/assinado) |
| `/api/documentos/enviar-assinatura` | POST | Enviar documento para fluxo de assinatura |
| `/api/documentos/assinar` | POST | Assinar documento com senha + IP |
| `/api/usuarios` | GET | Listar usuários do grêmio (para selecionar assinantes) |

### 2. Frontend de Documentos

| Página | Descrição |
|--------|-----------|
| `/documentos` | Listagem com filtros, busca, status badges |
| `/documentos/novo` | Criar documento (tipo, título, conteúdo HTML) |
| `/documentos/[id]` | Visualizar documento + fluxo de assinatura |
| `/validar/[hash]` | **Página pública** de validação de assinatura |

### 3. Fluxo de Assinatura Digital

```
1. Criar Documento (Rascunho)
   ↓
2. Editar conteúdo HTML livremente
   ↓
3. "Enviar para Assinatura" → Selecionar assinantes (ordem definida)
   ↓
4. Documento fica EM_ASSINATURA (read-only)
   ↓
5. Assinantes recebem notificação (placeholder)
   ↓
6. Cada assinante digita SENHA para confirmar
   ↓
7. Sistema registra IP + Timestamp da assinatura
   ↓
8. Após última assinatura:
   - Gera Hash SHA-256 (conteúdo + assinantes + salt do grêmio)
   - Status → ASSINADO
   - Cria registro em validacao_publica
   ↓
9. Qualquer pessoa pode verificar em /validar/[hash]
```

### 4. Segurança Implementada

- **Bloqueio pós-envio**: Documentos em assinatura não podem ser editados
- **Verificação de ordem**: Assinatura sequencial (assinante 2 só assina após 1)
- **Confirmação de senha**: Assinante deve digitar senha de login
- **Registro de IP**: Cada assinatura armazena IP e timestamp
- **Hash SHA-256**: Imutável, inclui salt único do grêmio
- **Validação pública**: Página externa sem autenticação

---

## 🛠️ Como aplicar no seu projeto local

### Passo 1: Copiar os novos arquivos

Copie os seguintes arquivos do ZIP para seu projeto:

```
apps/web/app/api/documentos/route.ts
apps/web/app/api/documentos/[id]/route.ts
apps/web/app/api/documentos/enviar-assinatura/route.ts
apps/web/app/api/documentos/assinar/route.ts
apps/web/app/api/usuarios/route.ts
apps/web/app/(dashboard)/documentos/page.tsx
apps/web/app/(dashboard)/documentos/novo/page.tsx
apps/web/app/(dashboard)/documentos/[id]/page.tsx
apps/web/app/validar/[hash]/page.tsx
```

### Passo 2: Verificar importações

No seu projeto, os imports `@sigge/database` e `@sigge/shared` devem estar configurados. Se não estiverem, ajuste para caminhos relativos:

```typescript
// Se @sigge/database não funcionar, use:
import { prisma, withTenant, withTenantTransaction } from '../../../../../packages/database/src/client';

// Ou melhor: configure o tsconfig.json paths
```

### Passo 3: Atualizar o Sidebar (se necessário)

Verifique se o link de Documentos no sidebar aponta para `/documentos`:

```typescript
// apps/web/components/DashboardSidebar.tsx
{ href: '/documentos', label: 'Documentos', icon: '📄' },
```

### Passo 4: Testar o fluxo completo

1. **Criar documento**
   - Acesse `/documentos` → "Novo Documento"
   - Escolha tipo, título, conteúdo HTML
   - Salvar → aparece na listagem como "Rascunho"

2. **Enviar para assinatura**
   - Abra o documento → clique "Enviar para Assinatura"
   - Selecione membros do grêmio (ex: Bruno Costa)
   - Confirme → status muda para "Em Assinatura"

3. **Assinar**
   - Faça login como o assinante selecionado
   - Abra o documento → clique "Assinar Documento"
   - Digite a senha → assinatura registrada

4. **Verificar hash**
   - Após todas as assinaturas, o hash SHA-256 aparece
   - Acesse `/validar/[hash]` para página pública de validação

---

## 📋 Checklist de Testes

- [ ] Criar documento (rascunho)
- [ ] Editar documento em rascunho
- [ ] Tentar editar documento "em_assinatura" (deve bloquear)
- [ ] Enviar para assinatura (selecionar assinantes)
- [ ] Assinar com senha correta
- [ ] Tentar assinar com senha errada (deve bloquear)
- [ ] Verificar ordem de assinatura (sequencial)
- [ ] Verificar hash SHA-256 após assinatura completa
- [ ] Acessar página pública de validação
- [ ] Verificar logs de segurança no banco

---

## ⚠️ O que ainda será feito nas próximas fases

| Funcionalidade | Fase |
|----------------|------|
| Editor Rich Text (TipTap) | Fase 2.5 (melhoria) |
| Templates dinâmicos com cabeçalho do grêmio | Fase 2.5 |
| Geração de PDF com Playwright | Fase 2.5 |
| QR Code no rodapé do PDF | Fase 2.5 |
| Upload de assinatura PNG | Fase 3 |
| Notificações por email (Resend) | Fase 6 |

---

## 🐛 Troubleshooting

### "Cannot find module '@sigge/database'"
```bash
cd packages/database
pnpm build
# ou
pnpm db:generate
```

### "RLS policy violation"
Verifique se está usando `withTenant()` ou `withTenantTransaction()` antes das queries.

### "Documento não pode ser editado"
Documentos só podem ser editados em status "rascunho". Verifique o status no banco:
```sql
SELECT id, titulo, status FROM documentos;
```

---

**Status: ✅ Fase 2 Concluída**

Próximo passo: Fase 3 (Patrimônio & QR Code) ou Fase 2.5 (PDF + Editor Rich Text)
