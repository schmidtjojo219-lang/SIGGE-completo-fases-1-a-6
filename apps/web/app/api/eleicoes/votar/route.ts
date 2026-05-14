import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@sigge/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { codigo, chapa_id } = body as { codigo: string; chapa_id: string };
    if (!codigo || !chapa_id) return NextResponse.json({ error: 'Dados obrigatórios' }, { status: 400 });

    const eleitor = await prisma.eleitor.findFirst({
      where: {
        codigo_acesso: codigo, habilitado: true, votou: false,
        codigo_expiracao: { gt: new Date() },
      },
      include: { eleicao: true },
    });

    if (!eleitor) return NextResponse.json({ error: 'Código inválido, expirado ou já utilizado' }, { status: 401 });
    if (eleitor.eleicao.status !== 'votacao') return NextResponse.json({ error: 'Eleição não está em votação' }, { status: 403 });

    const chapa = await prisma.chapa.findFirst({
      where: { id: chapa_id, eleicao_id: eleitor.eleicao_id },
    });
    if (!chapa) return NextResponse.json({ error: 'Chapa não encontrada' }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      await tx.chapa.update({ where: { id: chapa_id }, data: { votos: { increment: 1 } } });
      await tx.eleitor.update({ where: { id: eleitor.id }, data: { votou: true } });
    });

    return NextResponse.json({ success: true, mensagem: 'Voto registrado!' });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
