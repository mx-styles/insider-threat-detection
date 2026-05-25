import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/api/auth/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isStaticFile = pathname.startsWith('/_next') || pathname.startsWith('/favicon');
  const isApi = pathname.startsWith('/api');

  if (isPublic || isStaticFile) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('session');
  if (!sessionCookie?.value) {
    if (isApi) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const raw = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    const session = JSON.parse(raw);
    if (session.expires < Date.now()) {
      if (isApi) {
        return Response.json({ error: 'Session expired' }, { status: 401 });
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    if (isApi) {
      return Response.json({ error: 'Invalid session' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
