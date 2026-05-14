import { NextRequest, NextResponse } from 'next/server';
import { prisma, withTenant } from '@sigge/database';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const body = await request.json();
    const { codigo } = body;

    if (!codigo) {
      return NextResponse.json({ error: 'Código QR é obrigatório' }, { status: 400 });
    }

    const item = await withTenant(currentUser.gremioId, async () => {
      return prisma.patrimonio.findUnique({
        where: { codigo },
      });
    });

    if (!item) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }

    // Marcar como presente no inventário
    const atualizado = await withTenant(currentUser.gremioId, async () => {
      return prisma.patrimonio.update({
        where: { id: item.id },
        data: {
          ultimo_inventario: new Date(),
          status: item.status === 'extraviado' ? 'ativo' : item.status,
        },
      });
    });

    return NextResponse.json({
      success: true,
      item: atualizado,
      mensagem: `${item.nome} (${item.codigo}) marcado como presente`,
    });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
