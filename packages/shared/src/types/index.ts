export interface Gremio {
  id: string;
  nome: string;
  subdominio: string;
  logo: string | null;
  brasao: string | null;
  status_assinatura: 'ativo' | 'trial' | 'suspenso' | 'cancelado';
  data_expiracao: Date | null;
  salt_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface Usuario {
  id: string;
  gremio_id: string;
  nome: string;
  email: string;
  matricula: string;
  senha_hash: string;
  nivel_acesso_id: string;
  assinatura_png: string | null;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface NivelAcesso {
  id: string;
  gremio_id: string;
  nome_cargo: string;
  permissoes: Permissoes;
  created_at: Date;
  updated_at: Date;
}

export interface Permissoes {
  documentos: {
    criar: boolean;
    editar: boolean;
    assinar: boolean;
    excluir: boolean;
    visualizar: boolean;
  };
  patrimonio: {
    criar: boolean;
    editar: boolean;
    excluir: boolean;
    visualizar: boolean;
    inventariar: boolean;
  };
  eleicoes: {
    criar: boolean;
    gerenciar: boolean;
    apurar: boolean;
    visualizar: boolean;
  };
  financeiro: {
    criar: boolean;
    editar: boolean;
    aprovar: boolean;
    visualizar: boolean;
    auditar: boolean;
  };
  administrativo: {
    gerenciar_usuarios: boolean;
    gerenciar_cargos: boolean;
    configuracoes: boolean;
    super_admin: boolean;
  };
}

export interface Documento {
  id: string;
  gremio_id: string;
  tipo: 'oficio' | 'ata' | 'memorando' | 'declaracao' | 'outro';
  titulo: string;
  conteudo_html: string;
  status: 'rascunho' | 'em_assinatura' | 'assinado' | 'cancelado';
  hash_sha256: string | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface DocumentoAssinante {
  id: string;
  documento_id: string;
  usuario_id: string;
  data_assinatura: Date | null;
  ordem: number;
  ip_assinatura: string | null;
  created_at: Date;
}

export interface ValidacaoPublica {
  id: string;
  hash: string;
  documento_id: string;
  data_criacao: Date;
}

export interface Patrimonio {
  id: string;
  gremio_id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  categoria: string;
  localizacao: string;
  valor_aquisicao: number | null;
  data_aquisicao: Date | null;
  foto_url: string | null;
  status: 'ativo' | 'em_manutencao' | 'baixado' | 'extraviado';
  ultimo_inventario: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Transacao {
  id: string;
  gremio_id: string;
  tipo: 'entrada' | 'saida';
  categoria_id: string;
  descricao: string;
  valor: number;
  data: Date;
  comprovante_url: string;
  status_auditoria: 'pendente' | 'aprovada' | 'necessita_esclarecimento';
  observacao_auditoria: string | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CategoriaCusto {
  id: string;
  gremio_id: string;
  nome: string;
  tipo: 'entrada' | 'saida';
  created_at: Date;
}

export interface Eleicao {
  id: string;
  gremio_id: string;
  titulo: string;
  status: 'preparacao' | 'censu' | 'habilitacao' | 'votacao' | 'apuracao' | 'encerrada';
  data_inicio: Date | null;
  data_fim: Date | null;
  resultado_liberado: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Eleitor {
  id: string;
  eleicao_id: string;
  matricula: string;
  nome: string;
  habilitado: boolean;
  codigo_acesso: string | null;
  codigo_expiracao: Date | null;
  votou: boolean;
  created_at: Date;
}

export interface Chapa {
  id: string;
  eleicao_id: string;
  numero: number;
  nome: string;
  membros: string;
  votos: number;
  created_at: Date;
}

export interface LogSeguranca {
  id: string;
  gremio_id: string | null;
  usuario_id: string | null;
  acao: string;
  ip: string;
  user_agent: string;
  sucesso: boolean;
  detalhes: string | null;
  created_at: Date;
}

export interface Chamado {
  id: string;
  gremio_id: string;
  usuario_id: string;
  titulo: string;
  descricao: string;
  status: 'aberto' | 'em_andamento' | 'resolvido' | 'fechado';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  resposta: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  gremio_id: string;
  nivel_acesso_id: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string;
  token_version: number;
  iat: number;
  exp: number;
}
