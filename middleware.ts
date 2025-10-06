import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Vérifier si c'est le sous-domaine app
  if (hostname.startsWith('app.')) {
    const pathname = request.nextUrl.pathname;
    
    // Pas de redirection automatique pour l'instant - juste rewrite vers /app
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/app', request.url));
    }
    
    // Réécrire les routes pour pointer vers /app/*
    if (!pathname.startsWith('/app') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      return NextResponse.rewrite(new URL('/app' + pathname, request.url));
    }
    
    return NextResponse.next();
  }
  
  // Pour le domaine principal, bloquer l'accès à /app en production
  if (request.nextUrl.pathname.startsWith('/app')) {
    // En développement local, autoriser l'accès
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      return NextResponse.next();
    }
    
    // En production sur le domaine principal, rediriger vers la landing
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
