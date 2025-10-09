import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  
  // Routes publiques (ne nécessitent pas d'authentification)
  const publicRoutes = [
    '/',
    '/api/auth',
    '/api/subscribe',
    '/api/subscribe-simple',
    '/api/send-welcome-email',
    '/unauthorized',
  ];

  // Vérifier si c'est une route publique
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Routes API et assets (toujours autorisées)
  const isApiOrAsset = 
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/logos');

  // Vérifier si c'est le sous-domaine app
  if (hostname.startsWith('app.')) {
    // Rewrite pour le sous-domaine app
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/app', request.url));
    }
    
    // Réécrire les routes pour pointer vers /app/*
    if (!pathname.startsWith('/app') && !isApiOrAsset) {
      return NextResponse.rewrite(new URL('/app' + pathname, request.url));
    }

    // Protection des routes /app/* (sauf routes publiques)
    if (pathname.startsWith('/app') && !isPublicRoute && !isApiOrAsset) {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      // Si pas connecté, rediriger vers la landing
      if (!session?.user) {
        const url = new URL('/', request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }

      // Protection selon le rôle
      const role = session.user.role as string;

      // Espace coach
      if (pathname.startsWith('/app/coach')) {
        if (role !== 'COACH' && role !== 'ADMIN') {
          return NextResponse.redirect(new URL('/app/unauthorized', request.url));
        }
      }

      // Espace joueur
      if (pathname.startsWith('/app/player')) {
        if (role !== 'PLAYER' && role !== 'ADMIN') {
          return NextResponse.redirect(new URL('/app/unauthorized', request.url));
        }
      }

      // Espace admin
      if (pathname.startsWith('/app/admin')) {
        if (role !== 'ADMIN') {
          return NextResponse.redirect(new URL('/app/unauthorized', request.url));
        }
      }
    }
    
    return NextResponse.next();
  }
  
  // Pour le domaine principal, bloquer l'accès à /app en production
  if (pathname.startsWith('/app')) {
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
