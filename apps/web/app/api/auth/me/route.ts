import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma, withTenant } from '@sigge/database';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const usuario = await withTenant(currentUser.gremioId, async () => {
      return prisma.usuario.findUnique({
        where: { id: currentUser.userId },
        include: { nivel_acesso: true },
      });
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      matricula: usuario.matricula,
      cargo: usuario.nivel_acesso.nome_cargo,
      permissoes: usuario.nivel_acesso.permissoes,
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
