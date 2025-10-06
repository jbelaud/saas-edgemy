import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Vérifier si c'est le sous-domaine app
  if (hostname.startsWith('app.')) {
    // Rediriger vers /app si on est sur le sous-domaine app
    if (request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/app/dashboard', request.url));
    }
    
    // Si on est déjà sur /app/*, laisser passer
    if (request.nextUrl.pathname.startsWith('/app')) {
      return NextResponse.next();
    }
    
    // Sinon rediriger vers /app
    return NextResponse.redirect(new URL('/app' + request.nextUrl.pathname, request.url));
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
