import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@sigge/database';
import { getCurrentUser } from '@/lib/auth';
import { gremioSchema } from '@sigge/shared';
import { gerarSalt } from '@sigge/shared';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.isSuperAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const gremios = await prisma.gremio.findMany({
      include: {
        _count: {
          select: { usuarios: true, documentos: true, transacoes: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(gremios);
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.isSuperAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const result = gremioSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: result.error.flatten() }, { status: 400 });
    }

    const { nome, subdominio } = result.data;

    // Verificar se subdomínio já existe
    const existente = await prisma.gremio.findUnique({ where: { subdominio } });
    if (existente) {
      return NextResponse.json({ error: 'Subdomínio já em uso' }, { status: 400 });
    }

    const gremio = await prisma.gremio.create({
      data: {
        nome,
        subdominio,
        status_assinatura: 'trial',
        data_expiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias trial
        salt_hash: gerarSalt(),
      },
    });

    return NextResponse.json(gremio, { status: 201 });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
