import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminByUsernameOrEmail } from './db';
import { AdminUser } from './types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ucr-tv-studies-portal-secret-key-2026-production-secure'
);

export const AUTH_COOKIE_NAME = 'ucr_auth_token';

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
}

export async function createSessionToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const user = await getAdminByUsernameOrEmail(payload.email || payload.username);
  return user;
}

export async function verifyAdminRequest(req: NextRequest): Promise<TokenPayload | null> {
  const tokenFromCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const authHeader = req.headers.get('Authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  const token = tokenFromCookie || tokenFromHeader;
  if (!token) return null;

  return await verifySessionToken(token);
}

export function unauthorizedResponse(message = 'Unauthorized access. Admin authentication required.') {
  return NextResponse.json({ error: message, authenticated: false }, { status: 401 });
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plain, hash);
}
