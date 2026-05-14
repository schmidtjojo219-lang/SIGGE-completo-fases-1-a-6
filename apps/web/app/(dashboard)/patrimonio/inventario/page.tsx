'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function InventarioPage() {
  const [codigo, setCodigo] = useState('');
  const [resultado, setResultado] = useState<{ success: boolean; mensagem: string; item?: { nome: string; codigo: string } } | null>(null);
  const [processando, setProcessando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus no input para scan rápido
  useEffect(() => {
    inputRef.current?.focus();
  }, [resultado]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!codigo.trim()) return;

    setProcessando(true);
    setResultado(null);

    try {
      const response = await fetch('/api/patrimonio/inventario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigo.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setResultado({
          success: true,
          mensagem: data.mensagem,
          item: data.item,
        });
      } else {
        setResultado({
          success: false,
          mensagem: data.error || 'Erro ao processar',
        });
      }
    } catch {
      setResultado({
        success: false,
        mensagem: 'Erro de conexão',
      });
    } finally {
      setProcessando(false);
      setCodigo('');
      inputRef.current?.focus();
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/patrimonio" className="text-gray-500 hover:text-gray-700">← Voltar</Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventário</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Escaneie o QR Code da etiqueta ou digite o código do item.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Escaneie ou digite o código..."
            className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
            autoFocus
          />
          <button
            type="submit"
            disabled={processando || !codigo.trim()}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {processando ? 'Processando...' : '✓ Confirmar Presença'}
          </button>
        </form>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className={`p-6 rounded-xl border-2 ${
          resultado.success
            ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
            : 'bg-red-50 dark:bg-red-900/20 border-red-500'
        }`}>
          <div className="text-center">
            <span className="text-4xl mb-2 block">
              {resultado.success ? '✅' : '❌'}
            </span>
            <p className={`font-semibold ${
              resultado.success
                ? 'text-green-800 dark:text-green-400'
                : 'text-red-800 dark:text-red-400'
            }`}>
              {resultado.mensagem}
            </p>
            {resultado.item && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {resultado.item.nome}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">💡 Dicas</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Use um leitor de QR Code ou digite o código manualmente</li>
          <li>• O item será marcado como "Presente" automaticamente</li>
          <li>• Itens não escaneados em 1 ano aparecem como "Extraviado"</li>
        </ul>
      </div>
    </div>
  );
}
