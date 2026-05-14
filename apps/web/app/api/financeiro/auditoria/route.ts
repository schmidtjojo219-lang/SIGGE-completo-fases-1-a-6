import { NextRequest, NextResponse } from 'next/server';
import { prisma, withTenant } from '@sigge/database';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const body = await request.json();
    const { transacao_id, status, observacao } = body;

    if (!transacao_id || !status) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Verificar permissão de auditoria
    const usuario = await withTenant(currentUser.gremioId, async () => {
      return prisma.usuario.findUnique({
        where: { id: currentUser.userId },
        include: { nivel_acesso: true },
      });
    });

    const permissoes = usuario?.nivel_acesso.permissoes as Record<string, unknown>;
    if (!permissoes?.financeiro?.auditar) {
      return NextResponse.json({ error: 'Sem permissão para auditar' }, { status: 403 });
    }

    const transacao = await withTenant(currentUser.gremioId, async () => {
      return prisma.transacao.update({
        where: { id: transacao_id },
        data: {
          status_auditoria: status,
          observacao_auditoria: observacao || null,
        },
        include: { categoria: true, criador: { select: { nome: true } } },
      });
    });

    return NextResponse.json(transacao);
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
