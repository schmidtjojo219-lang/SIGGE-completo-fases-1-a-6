'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SuperAdminPage() {
  const [metricas, setMetricas] = useState<any>(null);
  const [gremios, setGremios] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => { carregarDados(); }, []);

  async function carregarDados() {
    try {
      const [respMetricas, respGremios, respLogs] = await Promise.all([
        fetch('/api/admin/metricas'),
        fetch('/api/admin/gremios'),
        fetch('/api/admin/logs'),
      ]);
      if (respMetricas.ok) setMetricas(await respMetricas.json());
      if (respGremios.ok) setGremios(await respGremios.json());
      if (respLogs.ok) setLogs(await respLogs.json());
    } catch (error) { console.error('Erro:', error); }
    finally { setCarregando(false); }
  }

  async function congelarGremio(id: string, acao: 'congelar' | 'ativar') {
    try {
      const response = await fetch('/api/admin/gremios/congelar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gremio_id: id, acao }),
      });
      if (response.ok) { alert(`Grêmio ${acao === 'congelar' ? 'congelado' : 'ativado'}!`); carregarDados(); }
    } catch { alert('Erro'); }
  }

  if (carregando) return <div className="text-center py-12">Carregando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h1>
      {metricas && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Grêmios', value: metricas.totalGremios },
            { label: 'Usuários Ativos', value: metricas.totalUsuarios },
            { label: 'Grêmios Ativos', value: metricas.gremiosAtivos },
            { label: 'Suspensos', value: metricas.gremiosSuspensos },
          ].map((m) => (
            <div key={m.label} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">{m.label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{m.value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gestão de Grêmios</h2>
          <Link href="/super-admin/gremios/novo" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">+ Novo Grêmio</Link>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Subdomínio</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Expiração</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {gremios.map((g) => (
              <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{g.nome}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{g.subdominio}.sigge.app</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    g.status_assinatura === 'ativo' ? 'bg-green-100 text-green-700' :
                    g.status_assinatura === 'trial' ? 'bg-blue-100 text-blue-700' :
                    g.status_assinatura === 'suspenso' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{g.status_assinatura}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{g.data_expiracao ? new Date(g.data_expiracao).toLocaleDateString('pt-BR') : 'N/A'}</td>
                <td className="px-4 py-3 text-right">
                  {g.status_assinatura !== 'suspenso' ? (
                    <button onClick={() => congelarGremio(g.id, 'congelar')} className="text-red-600 hover:text-red-800 text-sm">Congelar</button>
                  ) : (
                    <button onClick={() => congelarGremio(g.id, 'ativar')} className="text-green-600 hover:text-green-800 text-sm">Ativar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Logs de Segurança</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {logs.slice(0, 20).map((log) => (
            <div key={log.id} className={`flex items-center gap-3 p-3 rounded-lg ${log.sucesso ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <span className={`w-2 h-2 rounded-full ${log.sucesso ? 'bg-green-500' : 'bg-red-500'}`} />
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">{log.acao}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{log.ip} • {new Date(log.created_at).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
