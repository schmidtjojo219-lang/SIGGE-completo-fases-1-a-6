import { NextRequest, NextResponse } from 'next/server';
import { prisma, withTenant } from '@sigge/database';
import { getCurrentUser } from '@/lib/auth';
import { eleicaoSchema } from '@sigge/shared';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const eleicoes = await withTenant(currentUser.gremioId, async () => {
      return prisma.eleicao.findMany({
        include: {
          eleitores: { select: { id: true, habilitado: true, votou: true } },
          chapas: { select: { id: true, numero: true, nome: true, votos: true } },
        },
        orderBy: { created_at: 'desc' },
      });
    });

    return NextResponse.json(eleicoes);
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const body = await request.json();
    const result = eleicaoSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const eleicao = await withTenant(currentUser.gremioId, async () => {
      return prisma.eleicao.create({
        data: {
          gremio_id: currentUser.gremioId,
          titulo: result.data.titulo,
          status: 'preparacao',
        },
      });
    });

    return NextResponse.json(eleicao, { status: 201 });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
