import { cookies } from 'next/headers';

const ACCESS_COOKIE = 'gdtech_access';
const REFRESH_COOKIE = 'gdtech_refresh';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
const SESSION_PATHS = new Set(['auth/login', 'auth/first-access', 'auth/first-access/temporary']);

type BackendSession = { accessToken: string; refreshToken: string; expiresAt?: number; user?: unknown };

function sessionCookieOptions(maxAge: number) {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge };
}

async function forward(request: Request, path: string, accessToken?: string, body?: ArrayBuffer) {
  const url = new URL(request.url);
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  if (accessToken) headers.set('authorization', `Bearer ${accessToken}`);
  return fetch(`${BACKEND_URL}/${path}${url.search}`, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : body,
    cache: 'no-store',
  });
}

async function handler(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await context.params;
  const path = parts.join('/');
  const cookieStore = await cookies();
  const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer();
  let accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  let upstream = await forward(request, path, accessToken, body);

  if (upstream.status === 401 && !SESSION_PATHS.has(path) && path !== 'auth/refresh' && cookieStore.get(REFRESH_COOKIE)?.value) {
    const refresh = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: cookieStore.get(REFRESH_COOKIE)?.value }), cache: 'no-store',
    });
    if (refresh.ok) {
      const renewed = await refresh.json() as BackendSession;
      accessToken = renewed.accessToken;
      cookieStore.set(ACCESS_COOKIE, renewed.accessToken, sessionCookieOptions(Math.max(60, (renewed.expiresAt ?? Math.floor(Date.now() / 1000) + 3600) - Math.floor(Date.now() / 1000))));
      cookieStore.set(REFRESH_COOKIE, renewed.refreshToken, sessionCookieOptions(60 * 60 * 24 * 30));
      upstream = await forward(request, path, accessToken, body);
    }
  }

  if (upstream.ok && SESSION_PATHS.has(path)) {
    const session = await upstream.json() as BackendSession;
    cookieStore.set(ACCESS_COOKIE, session.accessToken, sessionCookieOptions(Math.max(60, (session.expiresAt ?? Math.floor(Date.now() / 1000) + 3600) - Math.floor(Date.now() / 1000))));
    cookieStore.set(REFRESH_COOKIE, session.refreshToken, sessionCookieOptions(60 * 60 * 24 * 30));
    return Response.json({ user: session.user });
  }

  if (upstream.status === 401) {
    cookieStore.delete(ACCESS_COOKIE);
    cookieStore.delete(REFRESH_COOKIE);
  }
  return new Response(await upstream.arrayBuffer(), { status: upstream.status, headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' } });
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
