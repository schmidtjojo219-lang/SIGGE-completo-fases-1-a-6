'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NovoPatrimonioPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Eletrônicos');
  const [localizacao, setLocalizacao] = useState('');
  const [valor, setValor] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const categorias = ['Eletrônicos', 'Móveis', 'Material de Escritório', 'Equipamentos', 'Veículos', 'Outros'];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const response = await fetch('/api/patrimonio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          descricao,
          categoria,
          localizacao,
          valor_aquisicao: valor ? parseFloat(valor) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.error || 'Erro ao cadastrar');
        return;
      }

      router.push('/patrimonio');
      router.refresh();
    } catch {
      setErro('Erro de conexão');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/patrimonio" className="text-gray-500 hover:text-gray-700">← Voltar</Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Novo Item de Patrimônio</h1>
      </div>

      {erro && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Item *</label>
          <input
            type="text" value={nome} onChange={(e) => setNome(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
          <textarea
            value={descricao} onChange={(e) => setDescricao(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria *</label>
            <select
              value={categoria} onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localização *</label>
            <input
              type="text" value={localizacao} onChange={(e) => setLocalizacao(e.target.value)}
              placeholder="Ex: Sala do Grêmio"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor de Aquisição (R$)</label>
          <input
            type="number" value={valor} onChange={(e) => setValor(e.target.value)}
            step="0.01" min="0"
            placeholder="0,00"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit" disabled={carregando}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {carregando ? 'Salvando...' : 'Cadastrar Item'}
          </button>
          <Link href="/patrimonio" className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
