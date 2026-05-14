import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { JwtPayload, RefreshTokenPayload } from '@sigge/shared';

// ============================================
// CONFIGURAÇÕES
// ============================================
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sigge-super-secret-key-change-in-production'
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_SECRET || 'sigge-refresh-secret-key-change-in-production'
);

const ACCESS_TOKEN_EXPIRY = '15m';    // 15 minutos
const REFRESH_TOKEN_EXPIRY = '7d';    // 7 dias

// ============================================
// GERAÇÃO DE TOKENS
// ============================================

export async function generateAccessToken(
  userId: string,
  email: string,
  gremioId: string,
  nivelAcessoId: string,
  isSuperAdmin: boolean = false
): Promise<string> {
  const token = await new SignJWT({
    sub: userId,
    email,
    gremio_id: gremioId,
    nivel_acesso_id: nivelAcessoId,
    super_admin: isSuperAdmin,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);

  return token;
}

export async function generateRefreshToken(
  userId: string,
  tokenVersion: number
): Promise<string> {
  const token = await new SignJWT({
    sub: userId,
    token_version: tokenVersion,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(REFRESH_SECRET);

  return token;
}

// ============================================
// VERIFICAÇÃO DE TOKENS
// ============================================

export async function verifyAccessToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      clockTolerance: 60,
    });
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET, {
      clockTolerance: 60,
    });
    return payload as unknown as RefreshTokenPayload;
  } catch {
    return null;
  }
}

// ============================================
// COOKIES
// ============================================

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutos
    path: '/',
  });

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 dias
    path: '/',
  });
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
}

// ============================================
// OBTENÇÃO DO USUÁRIO ATUAL (Server Components)
// ============================================

export async function getCurrentUser(): Promise<{
  userId: string;
  email: string;
  gremioId: string;
  nivelAcessoId: string;
  isSuperAdmin: boolean;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload) return null;

  return {
    userId: payload.sub,
    email: payload.email,
    gremioId: payload.gremio_id,
    nivelAcessoId: payload.nivel_acesso_id,
    isSuperAdmin: payload.super_admin || false,
  };
}

// ============================================
// HASH DE SENHA
// ============================================

import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
