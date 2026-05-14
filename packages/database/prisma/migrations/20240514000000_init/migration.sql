-- ============================================
-- MIGRAÇÃO INICIAL: SIGGE v1.0
-- PostgreSQL com Row Level Security (RLS)
-- ============================================

-- Criar extensão UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: gremios (NÃO tem RLS - é a raiz)
-- ============================================
CREATE TABLE "gremios" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nome" TEXT NOT NULL,
    "subdominio" TEXT NOT NULL,
    "logo" TEXT,
    "brasao" TEXT,
    "status_assinatura" TEXT NOT NULL DEFAULT 'trial',
    "data_expiracao" TIMESTAMP(3),
    "salt_hash" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gremios_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "gremios_subdominio_key" ON "gremios"("subdominio");

-- ============================================
-- TABELA: niveis_acesso
-- ============================================
CREATE TABLE "niveis_acesso" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "gremio_id" UUID NOT NULL,
    "nome_cargo" TEXT NOT NULL,
    "permissoes" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "niveis_acesso_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "niveis_acesso_gremio_id_idx" ON "niveis_acesso"("gremio_id");

-- ============================================
-- TABELA: usuarios
-- ============================================
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "gremio_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "nivel_acesso_id" UUID NOT NULL,
    "assinatura_png" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "token_version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "usuarios_gremio_id_email_key" ON "usuarios"("gremio_id", "email");
CREATE UNIQUE INDEX "usuarios_gremio_id_matricula_key" ON "usuarios"("gremio_id", "matricula");
CREATE INDEX "usuarios_gremio_id_idx" ON "usuarios"("gremio_id");

-- ============================================
-- TABELA: documentos
-- ============================================
CREATE TABLE "documentos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "gremio_id" UUID NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo_html" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'rascunho',
    "hash_sha256" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "documentos_gremio_id_idx" ON "documentos"("gremio_id");
CREATE INDEX "documentos_gremio_id_status_idx" ON "documentos"("gremio_id", "status");
CREATE INDEX "documentos_gremio_id_created_at_idx" ON "documentos"("gremio_id", "created_at");

-- ============================================
-- TABELA: documento_assinantes
-- ============================================
CREATE TABLE "documento_assinantes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "documento_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "data_assinatura" TIMESTAMP(3),
    "ordem" INTEGER NOT NULL,
    "ip_assinatura" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documento_assinantes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "documento_assinantes_documento_id_usuario_id_key" ON "documento_assinantes"("documento_id", "usuario_id");
CREATE INDEX "documento_assinantes_documento_id_idx" ON "documento_assinantes"("documento_id");
CREATE INDEX "documento_assinantes_usuario_id_idx" ON "documento_assinantes"("usuario_id");

-- ============================================
-- TABELA: validacao_publica
-- ============================================
CREATE TABLE "validacao_publica" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "hash" TEXT NOT NULL,
    "documento_id" UUID NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validacao_publica_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "validacao_publica_hash_key" ON "validacao_publica"("hash");
CREATE UNIQUE INDEX "validacao_publica_documento_id_key" ON "validacao_publica"("documento_id");
CREATE INDEX "validacao_publica_hash_idx" ON "validacao_publica"("hash");

-- ============================================
-- TABELA: patrimonios
-- ============================================
CREATE TABLE "patrimonios" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "gremio_id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "categoria" TEXT NOT NULL,
    "localizacao" TEXT NOT NULL,
    "valor_aquisicao" DECIMAL(15,2),
    "data_aquisicao" TIMESTAMP(3),
    "foto_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "ultimo_inventario" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patrimonios_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "patrimonios_gremio_id_codigo_key" ON "patrimonios"("gremio_id", "codigo");
CREATE INDEX "patrimonios_gremio_id_idx" ON "patrimonios"("gremio_id");
CREATE INDEX "patrimonios_gremio_id_status_idx" ON "patrimonios"("gremio_id", "status");
CREATE INDEX "patrimonios_gremio_id_categoria_idx" ON "patrimonios"("gremio_id", "categoria");

-- ============================================
-- TABELA: categorias_custo
-- ============================================
CREATE TABLE "categorias_custo" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "gremio_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_custo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "categorias_custo_gremio_id_nome_key" ON "categorias_custo"("gremio_id", "nome");
CREATE INDEX "categorias_custo_gremio_id_idx" ON "categorias_custo"("gremio_id");

-- ============================================
-- TABELA: transacoes
-- ============================================
CREATE TABLE "transacoes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "gremio_id" UUID NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria_id" UUID NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(15,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "comprovante_url" TEXT NOT NULL,
    "status_auditoria" TEXT NOT NULL DEFAULT 'pendente',
    "observacao_auditoria" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transacoes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "transacoes_gremio_id_idx" ON "transacoes"("gremio_id");
CREATE INDEX "transacoes_gremio_id_data_idx" ON "transacoes"("gremio_id", "data");
CREATE INDEX "transacoes_gremio_id_status_auditoria_idx" ON "transacoes"("gremio_id", "status_auditoria");

-- ============================================
-- TABELA: eleicoes
-- ============================================
CREATE TABLE "eleicoes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "gremio_id" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'preparacao',
    "data_inicio" TIMESTAMP(3),
    "data_fim" TIMESTAMP(3),
    "resultado_liberado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eleicoes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "eleicoes_gremio_id_idx" ON "eleicoes"("gremio_id");
CREATE INDEX "eleicoes_gremio_id_status_idx" ON "eleicoes"("gremio_id", "status");

-- ============================================
-- TABELA: eleitores
-- ============================================
CREATE TABLE "eleitores" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "eleicao_id" UUID NOT NULL,
    "matricula" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "habilitado" BOOLEAN NOT NULL DEFAULT false,
    "codigo_acesso" TEXT,
    "codigo_expiracao" TIMESTAMP(3),
    "votou" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eleitores_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "eleitores_eleicao_id_matricula_key" ON "eleitores"("eleicao_id", "matricula");
CREATE INDEX "eleitores_eleicao_id_idx" ON "eleitores"("eleicao_id");
CREATE INDEX "eleitores_eleicao_id_habilitado_idx" ON "eleitores"("eleicao_id", "habilitado");

-- ============================================
-- TABELA: chapas
-- ============================================
CREATE TABLE "chapas" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "eleicao_id" UUID NOT NULL,
    "numero" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "membros" TEXT NOT NULL,
    "votos" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chapas_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "chapas_eleicao_id_numero_key" ON "chapas"("eleicao_id", "numero");
CREATE INDEX "chapas_eleicao_id_idx" ON "chapas"("eleicao_id");

-- ============================================
-- TABELA: logs_seguranca
-- ============================================
CREATE TABLE "logs_seguranca" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "gremio_id" UUID,
    "usuario_id" UUID,
    "acao" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "sucesso" BOOLEAN NOT NULL,
    "detalhes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_seguranca_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "logs_seguranca_gremio_id_idx" ON "logs_seguranca"("gremio_id");
CREATE INDEX "logs_seguranca_created_at_idx" ON "logs_seguranca"("created_at");
CREATE INDEX "logs_seguranca_acao_idx" ON "logs_seguranca"("acao");

-- ============================================
-- TABELA: chamados
-- ============================================
CREATE TABLE "chamados" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "gremio_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aberto',
    "prioridade" TEXT NOT NULL DEFAULT 'media',
    "resposta" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chamados_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "chamados_gremio_id_idx" ON "chamados"("gremio_id");
CREATE INDEX "chamados_gremio_id_status_idx" ON "chamados"("gremio_id", "status");
CREATE INDEX "chamados_status_prioridade_idx" ON "chamados"("status", "prioridade");

-- ============================================
-- FOREIGN KEYS
-- ============================================
ALTER TABLE "niveis_acesso" ADD CONSTRAINT "niveis_acesso_gremio_id_fkey" 
    FOREIGN KEY ("gremio_id") REFERENCES "gremios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_gremio_id_fkey" 
    FOREIGN KEY ("gremio_id") REFERENCES "gremios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_nivel_acesso_id_fkey" 
    FOREIGN KEY ("nivel_acesso_id") REFERENCES "niveis_acesso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "documentos" ADD CONSTRAINT "documentos_gremio_id_fkey" 
    FOREIGN KEY ("gremio_id") REFERENCES "gremios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_created_by_fkey" 
    FOREIGN KEY ("created_by") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "documento_assinantes" ADD CONSTRAINT "documento_assinantes_documento_id_fkey" 
    FOREIGN KEY ("documento_id") REFERENCES "documentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documento_assinantes" ADD CONSTRAINT "documento_assinantes_usuario_id_fkey" 
    FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "validacao_publica" ADD CONSTRAINT "validacao_publica_documento_id_fkey" 
    FOREIGN KEY ("documento_id") REFERENCES "documentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "patrimonios" ADD CONSTRAINT "patrimonios_gremio_id_fkey" 
    FOREIGN KEY ("gremio_id") REFERENCES "gremios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "categorias_custo" ADD CONSTRAINT "categorias_custo_gremio_id_fkey" 
    FOREIGN KEY ("gremio_id") REFERENCES "gremios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_gremio_id_fkey" 
    FOREIGN KEY ("gremio_id") REFERENCES "gremios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_categoria_id_fkey" 
    FOREIGN KEY ("categoria_id") REFERENCES "categorias_custo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_created_by_fkey" 
    FOREIGN KEY ("created_by") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "eleicoes" ADD CONSTRAINT "eleicoes_gremio_id_fkey" 
    FOREIGN KEY ("gremio_id") REFERENCES "gremios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "eleitores" ADD CONSTRAINT "eleitores_eleicao_id_fkey" 
    FOREIGN KEY ("eleicao_id") REFERENCES "eleicoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chapas" ADD CONSTRAINT "chapas_eleicao_id_fkey" 
    FOREIGN KEY ("eleicao_id") REFERENCES "eleicoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "logs_seguranca" ADD CONSTRAINT "logs_seguranca_gremio_id_fkey" 
    FOREIGN KEY ("gremio_id") REFERENCES "gremios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "logs_seguranca" ADD CONSTRAINT "logs_seguranca_usuario_id_fkey" 
    FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "chamados" ADD CONSTRAINT "chamados_gremio_id_fkey" 
    FOREIGN KEY ("gremio_id") REFERENCES "gremios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chamados" ADD CONSTRAINT "chamados_usuario_id_fkey" 
    FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================
-- ROW LEVEL SECURITY (RLS) - POLICIES
-- ============================================

-- Habilitar RLS em todas as tabelas tenantizadas
ALTER TABLE "niveis_acesso" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usuarios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documentos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documento_assinantes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "validacao_publica" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "patrimonios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categorias_custo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transacoes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "eleicoes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "eleitores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "chapas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "chamados" ENABLE ROW LEVEL SECURITY;

-- Criar função para extrair gremio_id do contexto
CREATE OR REPLACE FUNCTION get_current_gremio_id()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_gremio', true), '')::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- POLICIES: niveis_acesso
-- ============================================
CREATE POLICY "niveis_acesso_isolation" ON "niveis_acesso"
    USING ("gremio_id" = get_current_gremio_id());

-- ============================================
-- POLICIES: usuarios
-- ============================================
CREATE POLICY "usuarios_isolation" ON "usuarios"
    USING ("gremio_id" = get_current_gremio_id());

-- ============================================
-- POLICIES: documentos
-- ============================================
CREATE POLICY "documentos_isolation" ON "documentos"
    USING ("gremio_id" = get_current_gremio_id());

-- ============================================
-- POLICIES: documento_assinantes
-- ============================================
CREATE POLICY "documento_assinantes_isolation" ON "documento_assinantes"
    USING (EXISTS (
        SELECT 1 FROM "documentos" d 
        WHERE d.id = "documento_assinantes"."documento_id" 
        AND d."gremio_id" = get_current_gremio_id()
    ));

-- ============================================
-- POLICIES: validacao_publica
-- ============================================
CREATE POLICY "validacao_publica_isolation" ON "validacao_publica"
    USING (EXISTS (
        SELECT 1 FROM "documentos" d 
        WHERE d.id = "validacao_publica"."documento_id" 
        AND d."gremio_id" = get_current_gremio_id()
    ));

-- ============================================
-- POLICIES: patrimonios
-- ============================================
CREATE POLICY "patrimonios_isolation" ON "patrimonios"
    USING ("gremio_id" = get_current_gremio_id());

-- ============================================
-- POLICIES: categorias_custo
-- ============================================
CREATE POLICY "categorias_custo_isolation" ON "categorias_custo"
    USING ("gremio_id" = get_current_gremio_id());

-- ============================================
-- POLICIES: transacoes
-- ============================================
CREATE POLICY "transacoes_isolation" ON "transacoes"
    USING ("gremio_id" = get_current_gremio_id());

-- ============================================
-- POLICIES: eleicoes
-- ============================================
CREATE POLICY "eleicoes_isolation" ON "eleicoes"
    USING ("gremio_id" = get_current_gremio_id());

-- ============================================
-- POLICIES: eleitores
-- ============================================
CREATE POLICY "eleitores_isolation" ON "eleitores"
    USING (EXISTS (
        SELECT 1 FROM "eleicoes" e 
        WHERE e.id = "eleitores"."eleicao_id" 
        AND e."gremio_id" = get_current_gremio_id()
    ));

-- ============================================
-- POLICIES: chapas
-- ============================================
CREATE POLICY "chapas_isolation" ON "chapas"
    USING (EXISTS (
        SELECT 1 FROM "eleicoes" e 
        WHERE e.id = "chapas"."eleicao_id" 
        AND e."gremio_id" = get_current_gremio_id()
    ));

-- ============================================
-- POLICIES: chamados
-- ============================================
CREATE POLICY "chamados_isolation" ON "chamados"
    USING ("gremio_id" = get_current_gremio_id());

-- ============================================
-- POLICIES: logs_seguranca (visível para super admin)
-- ============================================
CREATE POLICY "logs_seguranca_isolation" ON "logs_seguranca"
    USING (
        "gremio_id" = get_current_gremio_id() 
        OR get_current_gremio_id() IS NULL
    );
