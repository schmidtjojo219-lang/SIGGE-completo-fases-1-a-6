'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function CabinePage() {
  const params = useParams();
  const id = params.id as string;
  const [codigo, setCodigo] = useState('');
  const [etapa, setEtapa] = useState<'login' | 'votar' | 'confirmado'>('login');
  const [chapas, setChapas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function validarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      // Buscar eleição e chapas
      const response = await fetch(`/api/eleicoes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setChapas(data.chapas || []);
        setEtapa('votar');
      }
    } catch { setErro('Erro de conexão'); }
    finally { setCarregando(false); }
  }

  async function votar(chapaId: string) {
    setCarregando(true);
    try {
      const response = await fetch('/api/eleicoes/votar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, chapa_id: chapaId }),
      });
      const data = await response.json();
      if (response.ok) {
        setEtapa('confirmado');
      } else {
        setErro(data.error || 'Erro ao votar');
      }
    } catch { setErro('Erro de conexão'); }
    finally { setCarregando(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {etapa === 'login' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center mb-6">
              <span className="text-4xl">🗳️</span>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Cabine de Voto</h1>
              <p className="text-gray-500 dark:text-gray-400">Digite seu código de acesso de 6 dígitos</p>
            </div>
            {erro && <p className="text-red-600 text-center mb-4">{erro}</p>}
            <form onSubmit={validarCodigo} className="space-y-4">
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
              />
              <button
                type="submit"
                disabled={carregando || codigo.length !== 6}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
              >
                {carregando ? 'Validando...' : 'Entrar'}
              </button>
            </form>
          </div>
        )}

        {etapa === 'votar' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-6">Selecione sua Chapa</h2>
            {erro && <p className="text-red-600 text-center mb-4">{erro}</p>}
            <div className="space-y-3">
              {chapas.map((chapa) => (
                <button
                  key={chapa.id}
                  onClick={() => votar(chapa.id)}
                  disabled={carregando}
                  className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                      {chapa.numero}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{chapa.nome}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{chapa.membros}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {etapa === 'confirmado' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <span className="text-6xl">✅</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Voto Confirmado!</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Seu voto foi registrado com sucesso.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">
              Obrigado por participar da eleição!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
