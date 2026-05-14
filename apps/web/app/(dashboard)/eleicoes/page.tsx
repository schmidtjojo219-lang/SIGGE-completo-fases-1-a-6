'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Eleicao {
  id: string;
  titulo: string;
  status: string;
  data_inicio: string | null;
  data_fim: string | null;
  resultado_liberado: boolean;
  eleitores: { id: string; habilitado: boolean; votou: boolean }[];
  chapas: { id: string; numero: number; nome: string; votos: number }[];
}

export default function EleicoesPage() {
  const [eleicoes, setEleicoes] = useState<Eleicao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => { carregarEleicoes(); }, []);

  async function carregarEleicoes() {
    setCarregando(true);
    try {
      const response = await fetch('/api/eleicoes');
      if (response.ok) {
        const data = await response.json();
        setEleicoes(data);
      }
    } catch (error) { console.error('Erro:', error); }
    finally { setCarregando(false); }
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      preparacao: 'bg-gray-100 text-gray-700',
      censu: 'bg-blue-100 text-blue-700',
      habilitacao: 'bg-purple-100 text-purple-700',
      votacao: 'bg-amber-100 text-amber-700',
      apuracao: 'bg-orange-100 text-orange-700',
      encerrada: 'bg-green-100 text-green-700',
    };
    const labels: Record<string, string> = {
      preparacao: 'Preparação', censu: 'Censo', habilitacao: 'Habilitação',
      votacao: 'Votação', apuracao: 'Apuração', encerrada: 'Encerrada',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.preparacao}`}>
        {labels[status] || status}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Eleições</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Urna eletrônica com auditoria completa</p>
        </div>
        <Link href="/eleicoes/nova" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
          + Nova Eleição
        </Link>
      </div>

      {carregando ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : eleicoes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">Nenhuma eleição criada</p>
          <Link href="/eleicoes/nova" className="text-blue-600 hover:underline mt-2 inline-block">Criar primeira eleição</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {eleicoes.map((eleicao) => (
            <div key={eleicao.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{eleicao.titulo}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    {getStatusBadge(eleicao.status)}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {eleicao.eleitores.length} eleitores • {eleicao.eleitores.filter((e) => e.votou).length} votos
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/eleicoes/${eleicao.id}/painel`} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                    Painel
                  </Link>
                  {eleicao.status === 'votacao' && (
                    <Link href={`/eleicoes/${eleicao.id}/cabine`} className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                      Cabine
                    </Link>
                  )}
                </div>
              </div>
              {eleicao.status === 'encerrada' && eleicao.resultado_liberado && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">🏆 Resultado</h4>
                  <div className="space-y-2">
                    {eleicao.chapas.map((chapa, i) => (
                      <div key={chapa.id} className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">{chapa.numero} - {chapa.name}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{chapa.votos} votos</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
