import { NextRequest, NextResponse } from 'next/server';
import { prisma, withTenant } from '@sigge/database';
import { getCurrentUser } from '@/lib/auth';
import { gerarCodigoAleatorio } from '@sigge/shared';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const body = await request.json();
    const { eleitor_id } = body;
    if (!eleitor_id) return NextResponse.json({ error: 'Eleitor obrigatório' }, { status: 400 });

    const codigo = gerarCodigoAleatorio(6);
    const expiracao = new Date(Date.now() + 5 * 60 * 1000);

    const eleitor = await withTenant(currentUser.gremioId, async () => {
      return prisma.eleitor.update({
        where: { id: eleitor_id },
        data: { habilitado: true, codigo_acesso: codigo, codigo_expiracao: expiracao },
      });
    });

    return NextResponse.json({ success: true, codigo, expiracao, eleitor });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
