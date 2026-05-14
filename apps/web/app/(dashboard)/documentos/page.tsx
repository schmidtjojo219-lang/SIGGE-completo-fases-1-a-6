'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Documento {
  id: string;
  tipo: string;
  titulo: string;
  status: string;
  hash_sha256: string | null;
  created_at: string;
  autor: { nome: string };
  assinantes: { data_assinatura: string | null; usuario: { nome: string } }[];
}

export default function DocumentosPage() {
  const router = useRouter();
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDocumentos();
  }, [filtroStatus, busca]);

  async function carregarDocumentos() {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (filtroStatus) params.append('status', filtroStatus);
      if (busca) params.append('busca', busca);

      const response = await fetch(`/api/documentos?${params}`);
      if (response.ok) {
        const data = await response.json();
        setDocumentos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setCarregando(false);
    }
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      rascunho: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      em_assinatura: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      assinado: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      cancelado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    const labels: Record<string, string> = {
      rascunho: 'Rascunho',
      em_assinatura: 'Em Assinatura',
      assinado: 'Assinado',
      cancelado: 'Cancelado',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.rascunho}`}>
        {labels[status] || status}
      </span>
    );
  }

  function getTipoIcon(tipo: string) {
    const icons: Record<string, string> = {
      oficio: '📄',
      ata: '📝',
      memorando: '📨',
      declaracao: '📋',
      outro: '📎',
    };
    return icons[tipo] || '📄';
  }

  async function excluirDocumento(id: string) {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;

    try {
      const response = await fetch(`/api/documentos/${id}`, { method: 'DELETE' });
      if (response.ok) {
        carregarDocumentos();
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao excluir documento');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documentos</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gerencie ofícios, atas, memorandos e declarações
          </p>
        </div>
        <Link
          href="/documentos/novo"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          + Novo Documento
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Buscar documentos..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Todos os status</option>
          <option value="rascunho">Rascunho</option>
          <option value="em_assinatura">Em Assinatura</option>
          <option value="assinado">Assinado</option>
        </select>
      </div>

      {/* Lista */}
      {carregando ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : documentos.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">Nenhum documento encontrado</p>
          <Link href="/documentos/novo" className="text-blue-600 hover:underline mt-2 inline-block">
            Criar primeiro documento
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Documento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Autor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Data</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {documentos.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTipoIcon(doc.tipo)}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{doc.titulo}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{doc.tipo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(doc.status)}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{doc.autor.nome}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/documentos/${doc.id}`}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      >
                        Ver
                      </Link>
                      {doc.status === 'rascunho' && (
                        <button
                          onClick={() => excluirDocumento(doc.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          Excluir
                        </button>
                      )}
                    </div>
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
