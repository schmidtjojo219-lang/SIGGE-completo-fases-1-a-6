import { NextRequest, NextResponse } from 'next/server';
import { prisma, withTenant } from '@sigge/database';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const body = await request.json();
    const { eleicao_id } = body;
    if (!eleicao_id) return NextResponse.json({ error: 'Eleição obrigatória' }, { status: 400 });

    const usuario = await withTenant(currentUser.gremioId, async () => {
      return prisma.usuario.findUnique({ where: { id: currentUser.userId }, include: { nivel_acesso: true } });
    });
    const permissoes = usuario?.nivel_acesso.permissoes as Record<string, unknown>;
    if (!permissoes?.eleicoes?.apurar) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });

    const eleicao = await withTenant(currentUser.gremioId, async () => {
      return prisma.eleicao.update({
        where: { id: eleicao_id },
        data: { status: 'encerrada', resultado_liberado: true, data_fim: new Date() },
        include: { chapas: { orderBy: { votos: 'desc' } }, eleitores: true },
      });
    });

    return NextResponse.json({
      success: true, eleicao,
      resultado: {
        total_eleitores: eleicao.eleitores.length,
        total_votos: eleicao.eleitores.filter((e) => e.votou).length,
        chapas: eleicao.chapas, vencedor: eleicao.chapas[0],
      },
    });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
