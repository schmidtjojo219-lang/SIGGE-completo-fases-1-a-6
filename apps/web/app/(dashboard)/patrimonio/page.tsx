'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PatrimonioItem {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  localizacao: string;
  status: string;
  ultimo_inventario: string | null;
  valor_aquisicao: string | null;
}

export default function PatrimonioPage() {
  const [itens, setItens] = useState<PatrimonioItem[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarItens();
  }, [filtroStatus]);

  async function carregarItens() {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (filtroStatus) params.append('status', filtroStatus);
      const response = await fetch(`/api/patrimonio?${params}`);
      if (response.ok) {
        const data = await response.json();
        setItens(data);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setCarregando(false);
    }
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      ativo: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      em_manutencao: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      baixado: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      extraviado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    const labels: Record<string, string> = {
      ativo: 'Ativo',
      em_manutencao: 'Em Manutenção',
      baixado: 'Baixado',
      extraviado: 'Extraviado',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.ativo}`}>
        {labels[status] || status}
      </span>
    );
  }

  // Verificar itens extraviados (não inventariados em 1 ano)
  const itensExtraviados = itens.filter((item) => {
    if (!item.ultimo_inventario) return true;
    const ultimo = new Date(item.ultimo_inventario);
    const umAnoAtras = new Date();
    umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);
    return ultimo < umAnoAtras;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patrimônio</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestão de bens com rastreabilidade via QR Code
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/patrimonio/inventario"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            📱 Inventário
          </Link>
          <Link
            href="/patrimonio/novo"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            + Novo Item
          </Link>
        </div>
      </div>

      {/* Alerta de extraviados */}
      {itensExtraviados.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400 font-medium">
            ⚠️ {itensExtraviados.length} item(s) não inventariado(s) há mais de 1 ano
          </p>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-4">
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="em_manutencao">Em Manutenção</option>
          <option value="baixado">Baixado</option>
          <option value="extraviado">Extraviado</option>
        </select>
      </div>

      {/* Lista */}
      {carregando ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : itens.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">Nenhum item de patrimônio</p>
          <Link href="/patrimonio/novo" className="text-blue-600 hover:underline mt-2 inline-block">
            Cadastrar primeiro item
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Local</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Último Invent.</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {itens.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4 font-mono text-sm text-gray-700 dark:text-gray-300">{item.codigo}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{item.nome}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{item.categoria}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{item.localizacao}</td>
                  <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {item.ultimo_inventario
                      ? new Date(item.ultimo_inventario).toLocaleDateString('pt-BR')
                      : 'Nunca'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/patrimonio/${item.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Ver
                    </Link>
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
