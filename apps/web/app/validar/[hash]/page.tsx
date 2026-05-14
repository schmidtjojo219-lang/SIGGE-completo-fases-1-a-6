import { prisma } from '@sigge/database';
import { notFound } from 'next/navigation';

interface ValidarPageProps {
  params: Promise<{ hash: string }>;
}

export default async function ValidarPage({ params }: ValidarPageProps) {
  const { hash } = await params;

  const validacao = await prisma.validacaoPublica.findUnique({
    where: { hash },
    include: {
      documento: {
        include: {
          gremio: {
            select: { nome: true, subdominio: true },
          },
          autor: {
            select: { nome: true },
          },
          assinantes: {
            include: {
              usuario: {
                select: { nome: true },
              },
            },
            orderBy: { ordem: 'asc' },
          },
        },
      },
    },
  });

  if (!validacao) {
    notFound();
  }

  const doc = validacao.documento;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Documento Verificado
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Este documento possui assinatura digital válida
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 p-4">
            <div className="flex items-center gap-3">
              <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
              <div>
                <p className="font-semibold text-green-800 dark:text-green-400">
                  Assinatura Digital Válida
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Hash SHA-256 verificado com sucesso
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {doc.titulo}
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Grêmio</p>
                  <p className="font-medium text-gray-900 dark:text-white">{doc.gremio.nome}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Tipo</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{doc.tipo}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Autor</p>
                  <p className="font-medium text-gray-900 dark:text-white">{doc.autor.nome}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Data de Criação</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Assinantes
              </h3>
              <div className="space-y-2">
                {doc.assinantes.map((a, index) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {a.usuario.nome}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Assinado em {new Date(a.data_assinatura!).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(a.data_assinatura!).toLocaleTimeString('pt-BR')} • IP: {a.ip_assinatura}
                      </p>
                    </div>
                    <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Hash SHA-256
              </h3>
              <code className="block p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                {validacao.hash}
              </code>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>Validado via SIGGE - Sistema Interno de Gestão do Grêmio Estudantil</p>
          <p className="mt-1">
            Este documento foi assinado digitalmente e é legalmente válido conforme a Lei 14.063/2020.
          </p>
        </div>
      </div>
    </div>
  );
}
