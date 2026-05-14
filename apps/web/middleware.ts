import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// ============================================
// CONFIGURAÇÕES
// ============================================
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sigge-super-secret-key-change-in-production'
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_SECRET || 'sigge-refresh-secret-key-change-in-production'
);

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = [
  '/login',
  '/registro',
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/auth/logout',
  '/validar',
  '/_next',
  '/favicon.ico',
];

// Rotas do super admin
const SUPER_ADMIN_ROUTES = [
  '/super-admin',
  '/api/admin',
];

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

function isSuperAdminRoute(pathname: string): boolean {
  return SUPER_ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

function extractSubdomain(hostname: string): string | null {
  // Em desenvolvimento localhost, usar header x-subdomain
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }

  const parts = hostname.split('.');
  // sigge.app → sem subdomain
  // demo.sigge.app → demo
  // teste.demo.sigge.app → teste
  if (parts.length >= 3) {
    return parts[0];
  }
  return null;
}

// ============================================
// MIDDLEWARE PRINCIPAL
// ============================================

export async function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // Ignorar arquivos estáticos e rotas públicas
  if (isPublicRoute(pathname) || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Extrair subdomain do hostname
  const subdomain = extractSubdomain(hostname);

  // Em desenvolvimento, tentar pegar do header ou cookie
  const devSubdomain = request.headers.get('x-subdomain') || 
                       request.cookies.get('x-subdomain')?.value;

  const effectiveSubdomain = subdomain || devSubdomain;

  // Verificar token JWT
  const token = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // Se não tem token e não é rota pública, redirecionar para login
  if (!token && !refreshToken) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verificar e decodificar token
    let payload;
    try {
      const { payload: decoded } = await jwtVerify(token || '', JWT_SECRET, {
        clockTolerance: 60,
      });
      payload = decoded;
    } catch (error) {
      // Token expirado, tentar refresh
      if (refreshToken) {
        try {
          const { payload: refreshPayload } = await jwtVerify(
            refreshToken,
            REFRESH_SECRET,
            { clockTolerance: 60 }
          );

          // Aqui você faria a validação do refresh token no banco
          // Por enquanto, apenas redirecionamos para o endpoint de refresh
          if (pathname.startsWith('/api/')) {
            return NextResponse.json(
              { error: 'Token expirado', code: 'TOKEN_EXPIRED' },
              { status: 401 }
            );
          }
          return NextResponse.redirect(new URL('/login?expired=true', request.url));
        } catch {
          // Refresh token também inválido
          if (pathname.startsWith('/api/')) {
            return NextResponse.json(
              { error: 'Sessão expirada' },
              { status: 401 }
            );
          }
          return NextResponse.redirect(new URL('/login', request.url));
        }
      }
      throw error;
    }

    // Verificar se é super admin
    const isSuperAdmin = payload.super_admin === true;

    // Rotas de super admin requerem permissão especial
    if (isSuperAdminRoute(pathname) && !isSuperAdmin) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Acesso negado' },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Adicionar informações do usuário nos headers para uso nas API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.sub as string);
    requestHeaders.set('x-user-email', payload.email as string);
    requestHeaders.set('x-gremio-id', payload.gremio_id as string);
    requestHeaders.set('x-nivel-acesso-id', payload.nivel_acesso_id as string);

    if (effectiveSubdomain) {
      requestHeaders.set('x-subdomain', effectiveSubdomain);
    }

    // Verificar se o grêmio está ativo (não suspenso/cancelado)
    // Isso será feito nas API routes para evitar queries no middleware

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('Erro no middleware:', error);

    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Erro de autenticação' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// ============================================
// CONFIGURAÇÃO DO MATCHER
// ============================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
