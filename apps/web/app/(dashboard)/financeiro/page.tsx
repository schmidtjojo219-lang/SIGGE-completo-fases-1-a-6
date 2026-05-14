'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Transacao {
  id: string;
  tipo: string;
  descricao: string;
  valor: string;
  data: string;
  status_auditoria: string;
  observacao_auditoria: string | null;
  comprovante_url: string;
  categoria: { nome: string };
  criador: { nome: string };
}

export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => { carregarTransacoes(); }, [filtroStatus]);

  async function carregarTransacoes() {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (filtroStatus) params.append('status_auditoria', filtroStatus);
      const response = await fetch(`/api/financeiro?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTransacoes(data);
      }
    } catch (error) { console.error('Erro:', error); }
    finally { setCarregando(false); }
  }

  function formatarMoeda(valor: string) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  }

  const totalEntradas = transacoes.filter((t) => t.tipo === 'entrada').reduce((sum, t) => sum + Number(t.valor), 0);
  const totalSaidas = transacoes.filter((t) => t.tipo === 'saida').reduce((sum, t) => sum + Number(t.valor), 0);
  const saldo = totalEntradas - totalSaidas;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financeiro</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Controle de entradas e saídas com auditoria</p>
        </div>
        <Link href="/financeiro/nova" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
          + Nova Transação
        </Link>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <p className="text-sm text-green-600 dark:text-green-400">Entradas</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatarMoeda(String(totalEntradas))}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-sm text-red-600 dark:text-red-400">Saídas</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{formatarMoeda(String(totalSaidas))}</p>
        </div>
        <div className={`${saldo >= 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'} border rounded-xl p-4`}>
          <p className={`text-sm ${saldo >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>Saldo</p>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-amber-700 dark:text-amber-300'}`}>{formatarMoeda(String(saldo))}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Todas as transações</option>
          <option value="pendente">Pendentes</option>
          <option value="aprovada">Aprovadas</option>
          <option value="necessita_esclarecimento">Necessita Esclarecimento</option>
        </select>
      </div>

      {/* Lista */}
      {carregando ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : transacoes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">Nenhuma transação registrada</p>
          <Link href="/financeiro/nova" className="text-blue-600 hover:underline mt-2 inline-block">Registrar primeira transação</Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Categoria</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Auditoria</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Comprovante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transacoes.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{new Date(t.data).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{t.descricao}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">por {t.criador.nome}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{t.categoria.nome}</td>
                  <td className={`px-6 py-4 text-right font-semibold ${t.tipo === 'entrada' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {t.tipo === 'entrada' ? '+' : '-'}{formatarMoeda(t.valor)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      t.status_auditoria === 'aprovada' ? 'bg-green-100 text-green-700' :
                      t.status_auditoria === 'necessita_esclarecimento' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {t.status_auditoria === 'aprovada' ? 'Aprovada' : t.status_auditoria === 'necessita_esclarecimento' ? 'Esclarecimento' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a href={t.comprovante_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      📎 Ver
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
