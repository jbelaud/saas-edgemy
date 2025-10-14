import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

// Créer le middleware next-intl
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Routes API et assets (toujours autorisées)
  const isApiOrAsset = 
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/logos');

  // Skip i18n for API routes and assets
  if (isApiOrAsset) {
    return NextResponse.next();
  }

  // Vérifier si c'est le sous-domaine app
  if (hostname.startsWith('app.')) {
    // Rewrite pour le sous-domaine app
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/fr/app', request.url));
    }
    
    // Réécrire les routes pour pointer vers /[locale]/app/*
    if (!pathname.match(/^\/(fr|en)\//)) {
      return NextResponse.rewrite(new URL('/fr' + pathname, request.url));
    }
    
    return intlMiddleware(request);
  }
  
  // Pour le domaine principal, bloquer l'accès à /app en production
  if (pathname.match(/^\/(fr|en)\/app/)) {
    // En développement local, autoriser l'accès
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      return intlMiddleware(request);
    }
    
    // En production sur le domaine principal, rediriger vers la landing
    return NextResponse.redirect(new URL('/fr', request.url));
  }
  
  // Appliquer le middleware i18n pour toutes les autres routes
  return intlMiddleware(request);
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
