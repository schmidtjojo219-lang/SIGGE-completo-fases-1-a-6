'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const TIPOS_DOCUMENTO = [
  { value: 'oficio', label: 'Ofício', icon: '📄' },
  { value: 'ata', label: 'Ata', icon: '📝' },
  { value: 'memorando', label: 'Memorando', icon: '📨' },
  { value: 'declaracao', label: 'Declaração', icon: '📋' },
  { value: 'outro', label: 'Outro', icon: '📎' },
];

export default function NovoDocumentoPage() {
  const router = useRouter();
  const [tipo, setTipo] = useState('oficio');
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const response = await fetch('/api/documentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, titulo, conteudo_html: conteudo }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.error || 'Erro ao criar documento');
        return;
      }

      router.push('/documentos');
      router.refresh();
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/documentos"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Novo Documento</h1>
      </div>

      {erro && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Documento
          </label>
          <div className="grid grid-cols-5 gap-3">
            {TIPOS_DOCUMENTO.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTipo(t.value)}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  tipo === t.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl block mb-1">{t.icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Título
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Solicitação de Uso de Auditório"
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Conteúdo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Conteúdo
          </label>
          <textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="Digite o conteúdo do documento..."
            required
            rows={15}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Você pode usar HTML básico para formatação. O editor rich-text será implementado em breve.
          </p>
        </div>

        {/* Preview */}
        {conteudo && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Preview</h3>
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: conteudo }}
            />
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={carregando}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {carregando ? 'Salvando...' : 'Salvar Rascunho'}
          </button>
          <Link
            href="/documentos"
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
