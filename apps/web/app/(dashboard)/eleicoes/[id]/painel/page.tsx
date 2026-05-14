'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function PainelEleicaoPage() {
  const params = useParams();
  const id = params.id as string;
  const [eleicao, setEleicao] = useState<any>(null);
  const [csvText, setCsvText] = useState('');
  const [codigoGerado, setCodigoGerado] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => { carregarEleicao(); }, [id]);

  async function carregarEleicao() {
    try {
      const response = await fetch(`/api/eleicoes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setEleicao(data);
      }
    } catch (error) { console.error('Erro:', error); }
    finally { setCarregando(false); }
  }

  async function handleUploadCSV() {
    if (!csvText.trim()) return;
    try {
      const response = await fetch('/api/eleicoes/upload-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eleicao_id: id, csv_data: csvText }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Upload concluído! ${data.criados} eleitores cadastrados. ${data.duplicados > 0 ? data.duplicados + ' duplicados ignorados.' : ''}`);
        setCsvText('');
        carregarEleicao();
      } else {
        alert(data.error || 'Erro no upload');
      }
    } catch { alert('Erro de conexão'); }
  }

  async function habilitarEleitor(eleitorId: string) {
    try {
      const response = await fetch('/api/eleicoes/habilitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eleitor_id: eleitorId }),
      });
      const data = await response.json();
      if (response.ok) {
        setCodigoGerado(data.codigo);
        carregarEleicao();
      } else {
        alert(data.error || 'Erro');
      }
    } catch { alert('Erro de conexão'); }
  }

  async function encerrarEleicao() {
    if (!confirm('Tem certeza que deseja encerrar a eleição e apurar os resultados?')) return;
    try {
      const response = await fetch('/api/eleicoes/apurar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eleicao_id: id }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Eleição encerrada! Vencedor: ' + data.resultado.vencedor?.nome);
        carregarEleicao();
      } else {
        alert(data.error || 'Erro');
      }
    } catch { alert('Erro de conexão'); }
  }

  if (carregando) return <div className="text-center py-12">Carregando...</div>;
  if (!eleicao) return <div className="text-center py-12 text-gray-500">Eleição não encontrada</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/eleicoes" className="text-gray-500 hover:text-gray-700">← Voltar</Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{eleicao.titulo}</h1>
      </div>

      {/* Fase 1: Censo (Upload CSV) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Fase 1: Censo de Eleitores</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Cole os dados no formato CSV: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">matricula,nome</code>
        </p>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder="2026001,João Silva&#10;2026002,Maria Santos&#10;..."
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
        />
        <button
          onClick={handleUploadCSV}
          disabled={!csvText.trim()}
          className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
        >
          📤 Upload CSV
        </button>
        {eleicao.eleitores?.length > 0 && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {eleicao.eleitores.length} eleitores cadastrados
          </p>
        )}
      </div>

      {/* Fase 2: Habilitação */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🎫 Fase 2: Habilitação de Eleitores</h2>
        {codigoGerado && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-400 font-semibold">Código gerado: {codigoGerado}</p>
            <p className="text-sm text-green-600 dark:text-green-300">Válido por 5 minutos</p>
          </div>
        )}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {eleicao.eleitores?.map((eleitor: any) => (
            <div key={eleitor.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{eleitor.nome}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Matrícula: {eleitor.matricula}</p>
              </div>
              <div className="flex items-center gap-3">
                {eleitor.habilitado ? (
                  <span className="text-green-600 dark:text-green-400 text-sm font-medium">✓ Habilitado</span>
                ) : (
                  <button
                    onClick={() => habilitarEleitor(eleitor.id)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg"
                  >
                    Habilitar
                  </button>
                )}
                {eleitor.votou && <span className="text-blue-600 dark:text-blue-400 text-sm">🗳️ Votou</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fase 3: Chapas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🏛️ Chapas</h2>
        <div className="grid grid-cols-2 gap-4">
          {eleicao.chapas?.map((chapa: any) => (
            <div key={chapa.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{chapa.numero}</p>
              <p className="font-medium text-gray-700 dark:text-gray-300">{chapa.nome}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{chapa.membros}</p>
              {eleicao.status === 'encerrada' && (
                <p className="mt-2 text-lg font-bold text-blue-600 dark:text-blue-400">{chapa.votos} votos</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Encerrar */}
      {eleicao.status === 'votacao' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-400 mb-2">⚠️ Encerrar Eleição</h2>
          <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
            Após encerrar, o resultado será calculado e liberado automaticamente.
          </p>
          <button
            onClick={encerrarEleicao}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg"
          >
            Encerrar e Apurar
          </button>
        </div>
      )}
    </div>
  );
}
