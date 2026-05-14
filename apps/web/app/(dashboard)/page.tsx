import { getCurrentUser } from '@/lib/auth';
import { prisma, withTenant } from '@sigge/database';
import { formatarMoeda } from '@sigge/shared';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) return null;

  const stats = await withTenant(user.gremioId, async () => {
    const [totalDocumentos, totalPatrimonio, totalTransacoes, transacoesRecentes] = await Promise.all([
      prisma.documento.count(),
      prisma.patrimonio.count(),
      prisma.transacao.count(),
      prisma.transacao.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: { categoria: true },
      }),
    ]);

    return { totalDocumentos, totalPatrimonio, totalTransacoes, transacoesRecentes };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Bem-vindo de volta! Aqui está o resumo do seu grêmio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Documentos
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalDocumentos}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Patrimônio
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalPatrimonio}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Transações
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalTransacoes}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transações Recentes
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {stats.transacoesRecentes.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Nenhuma transação registrada ainda.
            </div>
          ) : (
            stats.transacoesRecentes.map((transacao) => (
              <div key={transacao.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {transacao.descricao}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {transacao.categoria.nome} • {new Date(transacao.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className={`font-semibold ${
                  transacao.tipo === 'entrada' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {transacao.tipo === 'entrada' ? '+' : '-'}
                  {formatarMoeda(Number(transacao.valor))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
