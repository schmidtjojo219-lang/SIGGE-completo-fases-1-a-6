import { NextRequest, NextResponse } from 'next/server';
import { prisma, withTenant, withTenantTransaction } from '@sigge/database';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { documento_id, assinantes } = body as {
      documento_id: string;
      assinantes: { usuario_id: string; ordem: number }[];
    };

    if (!documento_id || !assinantes || assinantes.length === 0) {
      return NextResponse.json(
        { error: 'Documento e assinantes são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar permissão
    const usuario = await withTenant(currentUser.gremioId, async () => {
      return prisma.usuario.findUnique({
        where: { id: currentUser.userId },
        include: { nivel_acesso: true },
      });
    });

    const permissoes = usuario?.nivel_acesso.permissoes as Record<string, unknown>;
    if (!permissoes?.documentos?.assinar) {
      return NextResponse.json(
        { error: 'Sem permissão para enviar documentos para assinatura' },
        { status: 403 }
      );
    }

    // Verificar documento
    const documento = await withTenant(currentUser.gremioId, async () => {
      return prisma.documento.findUnique({
        where: { id: documento_id },
        select: { status: true, created_by: true },
      });
    });

    if (!documento) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });
    }

    if (documento.status !== 'rascunho') {
      return NextResponse.json(
        { error: 'Documento já foi enviado para assinatura ou está assinado' },
        { status: 403 }
      );
    }

    // Criar assinantes em transação
    await withTenantTransaction(currentUser.gremioId, async (tx) => {
      // Atualizar status do documento
      await tx.documento.update({
        where: { id: documento_id },
        data: { status: 'em_assinatura' },
      });

      // Criar registros de assinantes
      for (const assinante of assinantes) {
        await tx.documentoAssinante.create({
          data: {
            documento_id,
            usuario_id: assinante.usuario_id,
            ordem: assinante.ordem,
          },
        });
      }
    });

    // Log de segurança
    await prisma.logSeguranca.create({
      data: {
        gremio_id: currentUser.gremioId,
        usuario_id: currentUser.userId,
        acao: 'DOCUMENTO_ENVIAR_ASSINATURA',
        ip: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        sucesso: true,
        detalhes: `Documento ${documento_id} enviado para assinatura`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar para assinatura:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
