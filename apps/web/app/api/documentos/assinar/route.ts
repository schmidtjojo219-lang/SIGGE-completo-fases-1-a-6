import { NextRequest, NextResponse } from 'next/server';
import { prisma, withTenant } from '@sigge/database';
import { getCurrentUser, verifyPassword } from '@/lib/auth';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { documento_id, senha } = body as { documento_id: string; senha: string };

    if (!documento_id || !senha) {
      return NextResponse.json(
        { error: 'Documento e senha são obrigatórios' },
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
        { error: 'Sem permissão para assinar documentos' },
        { status: 403 }
      );
    }

    // Verificar senha
    const senhaValida = await verifyPassword(senha, usuario.senha_hash);
    if (!senhaValida) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    // Buscar documento e assinante
    const documento = await withTenant(currentUser.gremioId, async () => {
      return prisma.documento.findUnique({
        where: { id: documento_id },
        include: {
          assinantes: {
            include: {
              usuario: {
                select: { id: true, nome: true },
              },
            },
            orderBy: { ordem: 'asc' },
          },
        },
      });
    });

    if (!documento) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });
    }

    if (documento.status !== 'em_assinatura') {
      return NextResponse.json(
        { error: 'Documento não está em processo de assinatura' },
        { status: 403 }
      );
    }

    // Verificar se o usuário é assinante deste documento
    const assinanteRegistro = documento.assinantes.find(
      (a) => a.usuario_id === currentUser.userId && !a.data_assinatura
    );

    if (!assinanteRegistro) {
      return NextResponse.json(
        { error: 'Você não está autorizado a assinar este documento ou já assinou' },
        { status: 403 }
      );
    }

    // Verificar ordem (assinatura sequencial)
    const ordemAtual = assinanteRegistro.ordem;
    const assinantesAnteriores = documento.assinantes.filter(
      (a) => a.ordem < ordemAtual
    );

    const todosAnterioresAssinaram = assinantesAnteriores.every(
      (a) => a.data_assinatura !== null
    );

    if (!todosAnterioresAssinaram) {
      return NextResponse.json(
        { error: 'Existem assinantes anteriores que ainda não assinaram' },
        { status: 403 }
      );
    }

    // Registrar assinatura
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';

    await withTenant(currentUser.gremioId, async () => {
      return prisma.documentoAssinante.update({
        where: { id: assinanteRegistro.id },
        data: {
          data_assinatura: new Date(),
          ip_assinatura: ip,
        },
      });
    });

    // Verificar se foi a última assinatura
    const documentoAtualizado = await withTenant(currentUser.gremioId, async () => {
      return prisma.documento.findUnique({
        where: { id: documento_id },
        include: {
          assinantes: {
            include: {
              usuario: {
                select: { id: true, nome: true },
              },
            },
            orderBy: { ordem: 'asc' },
          },
        },
      });
    });

    const todasAssinaturas = documentoAtualizado?.assinantes.every(
      (a) => a.data_assinatura !== null
    );

    let hash_sha256: string | null = null;

    if (todasAssinaturas) {
      // Buscar salt do grêmio
      const gremio = await prisma.gremio.findUnique({
        where: { id: currentUser.gremioId },
        select: { salt_hash: true },
      });

      // Gerar Hash SHA-256
      const hashInput = JSON.stringify({
        conteudo: documentoAtualizado?.conteudo_html,
        assinantes: documentoAtualizado?.assinantes.map((a) => ({
          id: a.usuario_id,
          nome: a.usuario.nome,
          data: a.data_assinatura,
          ip: a.ip_assinatura,
        })),
        salt: gremio?.salt_hash,
      });

      hash_sha256 = createHash('sha256').update(hashInput).digest('hex');

      // Atualizar documento como assinado
      await withTenant(currentUser.gremioId, async () => {
        return prisma.documento.update({
          where: { id: documento_id },
          data: {
            status: 'assinado',
            hash_sha256,
          },
        });
      });

      // Criar validação pública
      await prisma.validacaoPublica.create({
        data: {
          hash: hash_sha256,
          documento_id,
        },
      });
    }

    // Log de segurança
    await prisma.logSeguranca.create({
      data: {
        gremio_id: currentUser.gremioId,
        usuario_id: currentUser.userId,
        acao: 'DOCUMENTO_ASSINAR',
        ip,
        user_agent: request.headers.get('user-agent') || 'unknown',
        sucesso: true,
        detalhes: `Documento ${documento_id} assinado`,
      },
    });

    return NextResponse.json({
      success: true,
      assinado: todasAssinaturas,
      hash: hash_sha256,
    });
  } catch (error) {
    console.error('Erro ao assinar documento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
