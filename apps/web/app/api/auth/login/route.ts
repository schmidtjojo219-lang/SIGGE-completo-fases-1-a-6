import { NextRequest, NextResponse } from 'next/server';
import { prisma, withTenant } from '@sigge/database';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyPassword,
  setAuthCookies 
} from '@/lib/auth';
import { loginSchema } from '@sigge/shared';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email, senha, subdominio } = result.data;

    let effectiveSubdominio = subdominio;
    if (!effectiveSubdominio) {
      const hostname = request.headers.get('host') || '';
      const parts = hostname.split('.');
      if (parts.length >= 3) {
        effectiveSubdominio = parts[0];
      }
    }

    if (!effectiveSubdominio) {
      return NextResponse.json(
        { error: 'Subdomínio não informado' },
        { status: 400 }
      );
    }

    const gremio = await prisma.gremio.findUnique({
      where: { subdominio: effectiveSubdominio },
    });

    if (!gremio) {
      return NextResponse.json(
        { error: 'Grêmio não encontrado' },
        { status: 404 }
      );
    }

    if (gremio.status_assinatura === 'suspenso' || gremio.status_assinatura === 'cancelado') {
      return NextResponse.json(
        { error: 'Grêmio suspenso ou cancelado. Entre em contato com o suporte.' },
        { status: 403 }
      );
    }

    if (gremio.data_expiracao && new Date() > gremio.data_expiracao) {
      return NextResponse.json(
        { error: 'Assinatura expirada. Renove seu plano para continuar.' },
        { status: 403 }
      );
    }

    const usuario = await withTenant(gremio.id, async () => {
      return prisma.usuario.findFirst({
        where: { email },
        include: { nivel_acesso: true },
      });
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    if (!usuario.ativo) {
      return NextResponse.json(
        { error: 'Usuário desativado' },
        { status: 403 }
      );
    }

    const senhaValida = await verifyPassword(senha, usuario.senha_hash);
    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    const permissoes = usuario.nivel_acesso.permissoes as Record<string, unknown>;
    const isSuperAdmin = permissoes?.administrativo?.super_admin === true;

    const accessToken = await generateAccessToken(
      usuario.id,
      usuario.email,
      gremio.id,
      usuario.nivel_acesso_id,
      isSuperAdmin
    );

    const refreshToken = await generateRefreshToken(
      usuario.id,
      usuario.token_version
    );

    await setAuthCookies(accessToken, refreshToken);

    await prisma.logSeguranca.create({
      data: {
        gremio_id: gremio.id,
        usuario_id: usuario.id,
        acao: 'LOGIN',
        ip: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        sucesso: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        matricula: usuario.matricula,
        cargo: usuario.nivel_acesso.nome_cargo,
      },
      gremio: {
        id: gremio.id,
        nome: gremio.nome,
        subdominio: gremio.subdominio,
      },
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
