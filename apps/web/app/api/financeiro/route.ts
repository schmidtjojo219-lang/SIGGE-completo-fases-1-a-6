import { NextRequest, NextResponse } from 'next/server';
import { prisma, withTenant } from '@sigge/database';
import { getCurrentUser } from '@/lib/auth';
import { transacaoSchema } from '@sigge/shared';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status_auditoria');

    const transacoes = await withTenant(currentUser.gremioId, async () => {
      return prisma.transacao.findMany({
        where: status ? { status_auditoria: status } : {},
        include: { categoria: true, criador: { select: { nome: true } } },
        orderBy: { data: 'desc' },
      });
    });

    return NextResponse.json(transacoes);
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
    const result = transacaoSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: result.error.flatten() }, { status: 400 });
    }

    const { tipo, categoria_id, descricao, valor, data } = result.data;

    // Verificar se tem comprovante (anexo obrigatório)
    if (!body.comprovante_url) {
      return NextResponse.json({ error: 'Comprovante fiscal é obrigatório' }, { status: 400 });
    }

    const transacao = await withTenant(currentUser.gremioId, async () => {
      return prisma.transacao.create({
        data: {
          gremio_id: currentUser.gremioId,
          tipo,
          categoria_id,
          descricao,
          valor: String(valor),
          data: new Date(data),
          comprovante_url: body.comprovante_url,
          created_by: currentUser.userId,
        },
        include: { categoria: true },
      });
    });

    return NextResponse.json(transacao, { status: 201 });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
