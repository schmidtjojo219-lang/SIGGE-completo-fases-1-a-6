import { PrismaClient } from '@prisma/client';

// Estender o PrismaClient para incluir o contexto de tenant
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Configuração do Prisma Client com logging em desenvolvimento
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });
};

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// ============================================
// TENANT CONTEXT
// ============================================

/**
 * Define o contexto de tenant (gremio_id) para a sessão atual do PostgreSQL.
 * Isso ativa o RLS (Row Level Security) automaticamente.
 * 
 * IMPORTANTE: Deve ser chamado ANTES de qualquer query no banco.
 * 
 * @param gremioId - UUID do grêmio atual
 */
export async function setTenantContext(gremioId: string | null): Promise<void> {
  if (gremioId) {
    await prisma.$executeRawUnsafe(
      `SET LOCAL app.current_gremio = '${gremioId}';`
    );
  } else {
    await prisma.$executeRawUnsafe(
      `SET LOCAL app.current_gremio = '';`
    );
  }
}

/**
 * Limpa o contexto de tenant após a operação.
 * Importante para evitar vazamento entre requests.
 */
export async function clearTenantContext(): Promise<void> {
  await prisma.$executeRawUnsafe(
    `SET LOCAL app.current_gremio = '';`
  );
}

/**
 * Wrapper para executar queries dentro de um contexto de tenant.
 * Garante que o RLS está ativo e limpa o contexto após a execução.
 * 
 * @param gremioId - UUID do grêmio
 * @param operation - Função assíncrona a ser executada
 */
export async function withTenant<T>(
  gremioId: string | null,
  operation: () => Promise<T>
): Promise<T> {
  try {
    await setTenantContext(gremioId);
    const result = await operation();
    return result;
  } finally {
    await clearTenantContext();
  }
}

/**
 * Wrapper para transações dentro de um contexto de tenant.
 */
export async function withTenantTransaction<T>(
  gremioId: string | null,
  operation: (tx: typeof prisma) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    if (gremioId) {
      await tx.$executeRawUnsafe(
        `SET LOCAL app.current_gremio = '${gremioId}';`
      );
    }
    const result = await operation(tx as unknown as typeof prisma);
    await tx.$executeRawUnsafe(`SET LOCAL app.current_gremio = '';`);
    return result;
  });
}

export { prisma };
export default prisma;
