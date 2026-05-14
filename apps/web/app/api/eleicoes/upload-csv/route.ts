import { NextRequest, NextResponse } from 'next/server';
import { prisma, withTenant } from '@sigge/database';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const body = await request.json();
    const { eleicao_id, csv_data } = body as { eleicao_id: string; csv_data: string };

    if (!eleicao_id || !csv_data) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const linhas = csv_data.trim().split('\n').filter((l) => l.trim());
    const eleitores: { matricula: string; nome: string }[] = [];
    const duplicados: string[] = [];

    for (const linha of linhas) {
      const [matricula, nome] = linha.split(',').map((s) => s.trim());
      if (!matricula || !nome) continue;
      if (eleitores.some((e) => e.matricula === matricula)) {
        duplicados.push(matricula);
        continue;
      }
      eleitores.push({ matricula, nome });
    }

    const criados = await withTenant(currentUser.gremioId, async () => {
      const resultados = [];
      for (const eleitor of eleitores) {
        try {
          const criado = await prisma.eleitor.create({
            data: { eleicao_id, matricula: eleitor.matricula, nome: eleitor.nome },
          });
          resultados.push(criado);
        } catch { duplicados.push(eleitor.matricula); }
      }
      return resultados;
    });

    return NextResponse.json({
      success: true, total: eleitores.length, criados: criados.length,
      duplicados: duplicados.length, lista_duplicados: duplicados,
    });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
