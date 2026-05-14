import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  subdominio: z.string().min(3, 'Subdomínio inválido').optional(),
});

export const registroSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  matricula: z.string().min(3, 'Matrícula inválida'),
  senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  confirmar_senha: z.string(),
  gremio_id: z.string().uuid(),
}).refine((data) => data.senha === data.confirmar_senha, {
  message: 'Senhas não conferem',
  path: ['confirmar_senha'],
});

export const gremioSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  subdominio: z.string()
    .min(3, 'Subdomínio deve ter no mínimo 3 caracteres')
    .max(63, 'Subdomínio muito longo')
    .regex(/^[a-z0-9-]+$/, 'Apenas letras minúsculas, números e hífens'),
});

export const documentoSchema = z.object({
  tipo: z.enum(['oficio', 'ata', 'memorando', 'declaracao', 'outro']),
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  conteudo_html: z.string().min(1, 'Conteúdo é obrigatório'),
});

export const assinaturaSchema = z.object({
  documento_id: z.string().uuid(),
  senha: z.string().min(6, 'Senha é obrigatória'),
});

export const patrimonioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  descricao: z.string().optional(),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  localizacao: z.string().min(1, 'Localização é obrigatória'),
  valor_aquisicao: z.number().min(0).optional(),
  data_aquisicao: z.string().datetime().optional(),
});

export const transacaoSchema = z.object({
  tipo: z.enum(['entrada', 'saida']),
  categoria_id: z.string().uuid(),
  descricao: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
  valor: z.number().positive('Valor deve ser positivo'),
  data: z.string().datetime(),
});

export const eleicaoSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
});

export const habilitarEleitorSchema = z.object({
  eleitor_id: z.string().uuid(),
});

export const votoSchema = z.object({
  codigo: z.string().length(6, 'Código deve ter 6 dígitos'),
  chapa_id: z.string().uuid(),
});

export const chamadoSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  descricao: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']),
});

export const nivelAcessoSchema = z.object({
  nome_cargo: z.string().min(2, 'Nome do cargo é obrigatório'),
  permissoes: z.object({
    documentos: z.object({
      criar: z.boolean(),
      editar: z.boolean(),
      assinar: z.boolean(),
      excluir: z.boolean(),
      visualizar: z.boolean(),
    }),
    patrimonio: z.object({
      criar: z.boolean(),
      editar: z.boolean(),
      excluir: z.boolean(),
      visualizar: z.boolean(),
      inventariar: z.boolean(),
    }),
    eleicoes: z.object({
      criar: z.boolean(),
      gerenciar: z.boolean(),
      apurar: z.boolean(),
      visualizar: z.boolean(),
    }),
    financeiro: z.object({
      criar: z.boolean(),
      editar: z.boolean(),
      aprovar: z.boolean(),
      visualizar: z.boolean(),
      auditar: z.boolean(),
    }),
    administrativo: z.object({
      gerenciar_usuarios: z.boolean(),
      gerenciar_cargos: z.boolean(),
      configuracoes: z.boolean(),
      super_admin: z.boolean(),
    }),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegistroInput = z.infer<typeof registroSchema>;
export type GremioInput = z.infer<typeof gremioSchema>;
export type DocumentoInput = z.infer<typeof documentoSchema>;
export type AssinaturaInput = z.infer<typeof assinaturaSchema>;
export type PatrimonioInput = z.infer<typeof patrimonioSchema>;
export type TransacaoInput = z.infer<typeof transacaoSchema>;
export type EleicaoInput = z.infer<typeof eleicaoSchema>;
export type HabilitarEleitorInput = z.infer<typeof habilitarEleitorSchema>;
export type VotoInput = z.infer<typeof votoSchema>;
export type ChamadoInput = z.infer<typeof chamadoSchema>;
export type NivelAcessoInput = z.infer<typeof nivelAcessoSchema>;
