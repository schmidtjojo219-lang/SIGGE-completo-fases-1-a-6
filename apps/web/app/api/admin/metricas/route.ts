import { NextResponse } from 'next/server';
import { prisma } from '@sigge/database';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.isSuperAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const [totalGremios, totalUsuarios, gremiosAtivos, gremiosSuspensos] = await Promise.all([
      prisma.gremio.count(),
      prisma.usuario.count(),
      prisma.gremio.count({ where: { status_assinatura: 'ativo' } }),
      prisma.gremio.count({ where: { status_assinatura: 'suspenso' } }),
    ]);

    return NextResponse.json({
      totalGremios,
      totalUsuarios,
      gremiosAtivos,
      gremiosSuspensos,
      mrr: 0, // Placeholder - integrar com gateway de pagamento
    });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
