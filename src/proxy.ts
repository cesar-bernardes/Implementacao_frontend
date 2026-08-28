import { NextRequest, NextResponse } from 'next/server';

const ACCESS_COOKIE = 'gdtech_access';
const REFRESH_COOKIE = 'gdtech_refresh';

function tokenIsCurrent(token?: string) {
  if (!token) return false;
  try {
    const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(encoded)) as { exp?: number };
    return Boolean(payload.exp && payload.exp > Math.floor(Date.now() / 1000) + 15);
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!tokenIsCurrent(accessToken) && !refreshToken) {
    const login = new URL('/login', request.url);
    login.searchParams.set('returnTo', request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/empresas/:path*', '/implementacoes/:path*', '/calendario/:path*', '/templates/:path*', '/usuarios/:path*', '/auditoria/:path*', '/perguntas/:path*'],
};
