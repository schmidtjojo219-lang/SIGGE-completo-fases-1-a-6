import { NextResponse } from 'next/server';
import { prisma, withTenant } from '@sigge/database';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const usuarios = await withTenant(currentUser.gremioId, async () => {
      return prisma.usuario.findMany({
        where: { ativo: true },
        select: {
          id: true,
          nome: true,
          email: true,
          matricula: true,
          nivel_acesso: {
            select: { nome_cargo: true },
          },
        },
        orderBy: { nome: 'asc' },
      });
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
