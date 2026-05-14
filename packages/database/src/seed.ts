import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { gerarSalt } from '@sigge/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do SIGGE...');

  // ============================================
  // 1. CRIAR GRÊMIO DEMO
  // ============================================
  const gremioDemo = await prisma.gremio.create({
    data: {
      nome: 'Grêmio Estudantil Demo',
      subdominio: 'demo',
      status_assinatura: 'ativo',
      data_expiracao: new Date('2027-12-31'),
      salt_hash: gerarSalt(),
    },
  });

  console.log(`✅ Grêmio criado: ${gremioDemo.nome} (${gremioDemo.subdominio})`);

  // ============================================
  // 2. CRIAR NÍVEIS DE ACESSO
  // ============================================
  const permissoesAdmin = {
    documentos: { criar: true, editar: true, assinar: true, excluir: true, visualizar: true },
    patrimonio: { criar: true, editar: true, excluir: true, visualizar: true, inventariar: true },
    eleicoes: { criar: true, gerenciar: true, apurar: true, visualizar: true },
    financeiro: { criar: true, editar: true, aprovar: true, visualizar: true, auditar: true },
    administrativo: { gerenciar_usuarios: true, gerenciar_cargos: true, configuracoes: true, super_admin: true },
  };

  const permissoesDiretor = {
    documentos: { criar: true, editar: true, assinar: true, excluir: false, visualizar: true },
    patrimonio: { criar: true, editar: true, excluir: false, visualizar: true, inventariar: true },
    eleicoes: { criar: true, gerenciar: true, apurar: false, visualizar: true },
    financeiro: { criar: true, editar: true, aprovar: false, visualizar: true, auditar: false },
    administrativo: { gerenciar_usuarios: false, gerenciar_cargos: false, configuracoes: false, super_admin: false },
  };

  const permissoesTesoureiro = {
    documentos: { criar: false, editar: false, assinar: false, excluir: false, visualizar: true },
    patrimonio: { criar: false, editar: false, excluir: false, visualizar: true, inventariar: false },
    eleicoes: { criar: false, gerenciar: false, apurar: false, visualizar: true },
    financeiro: { criar: true, editar: true, aprovar: true, visualizar: true, auditar: true },
    administrativo: { gerenciar_usuarios: false, gerenciar_cargos: false, configuracoes: false, super_admin: false },
  };

  const permissoesMembro = {
    documentos: { criar: false, editar: false, assinar: false, excluir: false, visualizar: true },
    patrimonio: { criar: false, editar: false, excluir: false, visualizar: true, inventariar: false },
    eleicoes: { criar: false, gerenciar: false, apurar: false, visualizar: true },
    financeiro: { criar: false, editar: false, aprovar: false, visualizar: false, auditar: false },
    administrativo: { gerenciar_usuarios: false, gerenciar_cargos: false, configuracoes: false, super_admin: false },
  };

  const [nivelAdmin, nivelDiretor, nivelTesoureiro, nivelMembro] = await Promise.all([
    prisma.nivelAcesso.create({
      data: { gremio_id: gremioDemo.id, nome_cargo: 'Presidente', permissoes: permissoesAdmin },
    }),
    prisma.nivelAcesso.create({
      data: { gremio_id: gremioDemo.id, nome_cargo: 'Diretor', permissoes: permissoesDiretor },
    }),
    prisma.nivelAcesso.create({
      data: { gremio_id: gremioDemo.id, nome_cargo: 'Tesoureiro', permissoes: permissoesTesoureiro },
    }),
    prisma.nivelAcesso.create({
      data: { gremio_id: gremioDemo.id, nome_cargo: 'Membro', permissoes: permissoesMembro },
    }),
  ]);

  console.log(`✅ Níveis de acesso criados: ${nivelAdmin.nome_cargo}, ${nivelDiretor.nome_cargo}, ${nivelTesoureiro.nome_cargo}, ${nivelMembro.nome_cargo}`);

  // ============================================
  // 3. CRIAR USUÁRIOS DEMO
  // ============================================
  const senhaHash = await bcrypt.hash('sigge2026', 10);

  const [usuarioAdmin, usuarioDiretor, usuarioTesoureiro] = await Promise.all([
    prisma.usuario.create({
      data: {
        gremio_id: gremioDemo.id,
        nome: 'Ana Silva',
        email: 'ana.silva@demo.sigge.app',
        matricula: '2026001',
        senha_hash: senhaHash,
        nivel_acesso_id: nivelAdmin.id,
        ativo: true,
      },
    }),
    prisma.usuario.create({
      data: {
        gremio_id: gremioDemo.id,
        nome: 'Bruno Costa',
        email: 'bruno.costa@demo.sigge.app',
        matricula: '2026002',
        senha_hash: senhaHash,
        nivel_acesso_id: nivelDiretor.id,
        ativo: true,
      },
    }),
    prisma.usuario.create({
      data: {
        gremio_id: gremioDemo.id,
        nome: 'Carla Mendes',
        email: 'carla.mendes@demo.sigge.app',
        matricula: '2026003',
        senha_hash: senhaHash,
        nivel_acesso_id: nivelTesoureiro.id,
        ativo: true,
      },
    }),
  ]);

  console.log(`✅ Usuários criados: ${usuarioAdmin.nome}, ${usuarioDiretor.nome}, ${usuarioTesoureiro.nome}`);

  // ============================================
  // 4. CRIAR CATEGORIAS DE CUSTO
  // ============================================
  const categorias = [
    { nome: 'Mensalidade', tipo: 'entrada' },
    { nome: 'Doação', tipo: 'entrada' },
    { nome: 'Evento', tipo: 'entrada' },
    { nome: 'Material de Escritório', tipo: 'saida' },
    { nome: 'Alimentação', tipo: 'saida' },
    { nome: 'Transporte', tipo: 'saida' },
    { nome: 'Material de Campanha', tipo: 'saida' },
    { nome: 'Outros', tipo: 'saida' },
  ];

  for (const cat of categorias) {
    await prisma.categoriaCusto.create({
      data: {
        gremio_id: gremioDemo.id,
        nome: cat.nome,
        tipo: cat.tipo,
      },
    });
  }

  console.log(`✅ ${categorias.length} categorias de custo criadas`);

  // ============================================
  // 5. CRIAR DOCUMENTO DE EXEMPLO
  // ============================================
  const documento = await prisma.documento.create({
    data: {
      gremio_id: gremioDemo.id,
      tipo: 'oficio',
      titulo: 'Ofício de Exemplo - Solicitação de Uso de Auditório',
      conteudo_html: `
        <h1>Ofício nº 001/2026</h1>
        <p><strong>Assunto:</strong> Solicitação de uso do auditório para assembleia geral</p>
        <p>Venho por meio deste solicitar o uso do auditório principal para realização da assembleia geral do grêmio estudantil.</p>
        <p><strong>Data:</strong> 15/06/2026</p>
        <p><strong>Horário:</strong> 14h às 17h</p>
        <p>Atenciosamente,</p>
      `,
      status: 'rascunho',
      created_by: usuarioAdmin.id,
    },
  });

  console.log(`✅ Documento de exemplo criado: ${documento.titulo}`);

  // ============================================
  // 6. CRIAR PATRIMÔNIO DE EXEMPLO
  // ============================================
  const patrimonio = await prisma.patrimonio.create({
    data: {
      gremio_id: gremioDemo.id,
      codigo: 'PAT-2026-0001',
      nome: 'Notebook Dell Inspiron',
      descricao: 'Notebook utilizado para gestão administrativa do grêmio',
      categoria: 'Eletrônicos',
      localizacao: 'Sala do Grêmio - Bloco A',
      valor_aquisicao: 3500.00,
      data_aquisicao: new Date('2026-01-15'),
      status: 'ativo',
    },
  });

  console.log(`✅ Patrimônio criado: ${patrimonio.nome} (${patrimonio.codigo})`);

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Dados de acesso demo:');
  console.log('   Email: ana.silva@demo.sigge.app');
  console.log('   Senha: sigge2026');
  console.log('   Subdomínio: demo.sigge.app');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
