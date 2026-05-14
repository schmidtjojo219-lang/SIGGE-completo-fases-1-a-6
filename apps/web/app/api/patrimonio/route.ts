import { NextRequest, NextResponse } from 'next/server';
import { prisma, withTenant } from '@sigge/database';
import { getCurrentUser } from '@/lib/auth';
import { patrimonioSchema } from '@sigge/shared';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const categoria = searchParams.get('categoria');

    const itens = await withTenant(currentUser.gremioId, async () => {
      return prisma.patrimonio.findMany({
        where: {
          ...(status ? { status } : {}),
          ...(categoria ? { categoria } : {}),
        },
        orderBy: { created_at: 'desc' },
      });
    });

    return NextResponse.json(itens);
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
    const result = patrimonioSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: result.error.flatten() }, { status: 400 });
    }

    const { nome, descricao, categoria, localizacao, valor_aquisicao, data_aquisicao } = result.data;

    // Gerar código automático PAT-2026-XXXX
    const ano = new Date().getFullYear();
    const ultimo = await withTenant(currentUser.gremioId, async () => {
      return prisma.patrimonio.findFirst({
        where: { codigo: { startsWith: `PAT-${ano}-` } },
        orderBy: { codigo: 'desc' },
      });
    });

    let sequencial = 1;
    if (ultimo) {
      const match = ultimo.codigo.match(/PAT-\d{4}-(\d{4})/);
      if (match) sequencial = parseInt(match[1]) + 1;
    }
    const codigo = `PAT-${ano}-${String(sequencial).padStart(4, '0')}`;

    const item = await withTenant(currentUser.gremioId, async () => {
      return prisma.patrimonio.create({
        data: {
          gremio_id: currentUser.gremioId,
          codigo,
          nome,
          descricao,
          categoria,
          localizacao,
          valor_aquisicao: valor_aquisicao ? String(valor_aquisicao) : null,
          data_aquisicao: data_aquisicao ? new Date(data_aquisicao) : null,
        },
      });
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
