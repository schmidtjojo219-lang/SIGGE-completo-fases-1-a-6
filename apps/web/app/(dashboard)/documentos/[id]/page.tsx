'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Documento {
  id: string;
  tipo: string;
  titulo: string;
  conteudo_html: string;
  status: string;
  hash_sha256: string | null;
  created_at: string;
  autor: { id: string; nome: string; email: string };
  assinantes: {
    id: string;
    usuario_id: string;
    data_assinatura: string | null;
    ordem: number;
    ip_assinatura: string | null;
    usuario: { id: string; nome: string; email: string };
  }[];
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
}

export default function DocumentoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [documento, setDocumento] = useState<Documento | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarAssinatura, setMostrarAssinatura] = useState(false);
  const [senha, setSenha] = useState('');
  const [assinando, setAssinando] = useState(false);
  const [mostrarEnvio, setMostrarEnvio] = useState(false);
  const [assinantesSelecionados, setAssinantesSelecionados] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregarDocumento();
    carregarUsuarios();
  }, [id]);

  async function carregarDocumento() {
    try {
      const response = await fetch(`/api/documentos/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDocumento(data);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarUsuarios() {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        // Buscar usuários do grêmio
        const resp = await fetch('/api/usuarios');
        if (resp.ok) {
          const data = await resp.json();
          setUsuarios(data);
        }
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  async function handleAssinar(e: React.FormEvent) {
    e.preventDefault();
    setAssinando(true);

    try {
      const response = await fetch('/api/documentos/assinar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documento_id: id, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Erro ao assinar');
        return;
      }

      alert(data.assinado ? 'Documento assinado com sucesso!' : 'Assinatura registrada!');
      setMostrarAssinatura(false);
      setSenha('');
      carregarDocumento();
    } catch {
      alert('Erro de conexão');
    } finally {
      setAssinando(false);
    }
  }

  async function handleEnviarAssinatura(e: React.FormEvent) {
    e.preventDefault();
    if (assinantesSelecionados.length === 0) {
      alert('Selecione pelo menos um assinante');
      return;
    }

    setEnviando(true);
    try {
      const response = await fetch('/api/documentos/enviar-assinatura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documento_id: id,
          assinantes: assinantesSelecionados.map((uid, index) => ({
            usuario_id: uid,
            ordem: index + 1,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Erro ao enviar para assinatura');
        return;
      }

      alert('Documento enviado para assinatura!');
      setMostrarEnvio(false);
      carregarDocumento();
    } catch {
      alert('Erro de conexão');
    } finally {
      setEnviando(false);
    }
  }

  function podeAssinar(): boolean {
    if (!documento || documento.status !== 'em_assinatura') return false;
    return documento.assinantes.some(
      (a) => !a.data_assinatura
    );
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      rascunho: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      em_assinatura: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      assinado: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    const labels: Record<string, string> = {
      rascunho: 'Rascunho',
      em_assinatura: 'Em Assinatura',
      assinado: 'Assinado',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.rascunho}`}>
        {labels[status] || status}
      </span>
    );
  }

  if (carregando) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  if (!documento) {
    return <div className="text-center py-12 text-gray-500">Documento não encontrado</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/documentos"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← Voltar
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{documento.titulo}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {documento.tipo} • Criado por {documento.autor.nome} em{' '}
              {new Date(documento.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        {getStatusBadge(documento.status)}
      </div>

      {/* Ações */}
      <div className="flex gap-3">
        {documento.status === 'rascunho' && (
          <>
            <button
              onClick={() => setMostrarEnvio(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Enviar para Assinatura
            </button>
            <Link
              href={`/documentos/${id}/editar`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Editar
            </Link>
          </>
        )}
        {podeAssinar() && (
          <button
            onClick={() => setMostrarAssinatura(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            Assinar Documento
          </button>
        )}
      </div>

      {/* Conteúdo */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: documento.conteudo_html }}
        />
      </div>

      {/* Assinantes */}
      {documento.assinantes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Fluxo de Assinatura
          </h3>
          <div className="space-y-3">
            {documento.assinantes.map((a, index) => (
              <div
                key={a.id}
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  a.data_assinatura
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{a.usuario.nome}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{a.usuario.email}</p>
                </div>
                {a.data_assinatura ? (
                  <div className="text-right">
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">✓ Assinado</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(a.data_assinatura).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">IP: {a.ip_assinatura}</p>
                  </div>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 text-sm font-medium">
                    ⏳ Pendente
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hash SHA-256 */}
      {documento.hash_sha256 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-2">
            ✓ Documento Assinado Digitalmente
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300 mb-2">
            Este documento possui assinatura digital verificável via Hash SHA-256:
          </p>
          <code className="block p-3 bg-white dark:bg-gray-800 rounded-lg text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
            {documento.hash_sha256}
          </code>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            QR Code de validação pública será implementado em breve.
          </p>
        </div>
      )}

      {/* Modal: Assinar */}
      {mostrarAssinatura && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Assinar Documento
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Digite sua senha de login para confirmar a assinatura digital.
            </p>
            <form onSubmit={handleAssinar} className="space-y-4">
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={assinando}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {assinando ? 'Assinando...' : 'Confirmar Assinatura'}
                </button>
                <button
                  type="button"
                  onClick={() => { setMostrarAssinatura(false); setSenha(''); }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enviar para Assinatura */}
      {mostrarEnvio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Enviar para Assinatura
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Selecione os membros que devem assinar este documento (em ordem):
            </p>
            <form onSubmit={handleEnviarAssinatura} className="space-y-4">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {usuarios.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={u.id}
                      checked={assinantesSelecionados.includes(u.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAssinantesSelecionados([...assinantesSelecionados, u.id]);
                        } else {
                          setAssinantesSelecionados(assinantesSelecionados.filter((id) => id !== u.id));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{u.nome}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={enviando}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {enviando ? 'Enviando...' : 'Enviar para Assinatura'}
                </button>
                <button
                  type="button"
                  onClick={() => { setMostrarEnvio(false); setAssinantesSelecionados([]); }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
