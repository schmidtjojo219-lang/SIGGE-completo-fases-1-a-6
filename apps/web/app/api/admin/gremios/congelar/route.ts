import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@sigge/database';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.isSuperAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { gremio_id, acao } = body;
    if (!gremio_id || !acao) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const novoStatus = acao === 'congelar' ? 'suspenso' : 'ativo';
    const gremio = await prisma.gremio.update({
      where: { id: gremio_id },
      data: { status_assinatura: novoStatus },
    });

    return NextResponse.json({ success: true, gremio });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
