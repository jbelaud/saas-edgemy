import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

// Créer le middleware next-intl
const intlMiddleware = createMiddleware(routing);

// Génère un token CSRF
function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Définit le cookie CSRF sur la réponse si absent
function ensureCsrfCookie(request: NextRequest, response: NextResponse): NextResponse {
  const existingToken = request.cookies.get('csrf-token')?.value;
  
  if (!existingToken) {
    const token = generateCsrfToken();
    console.log('[Middleware] Création cookie CSRF:', token.substring(0, 8) + '...');
    response.cookies.set('csrf-token', token, {
      httpOnly: false, // Le client doit pouvoir le lire
      secure: false, // Désactiver secure en dev pour localhost
      sameSite: 'lax', // Lax au lieu de strict pour plus de compatibilité
      path: '/',
      maxAge: 60 * 60 * 24, // 24 heures
    });
  }
  
  return response;
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Routes API et assets (toujours autorisées)
  const isApiOrAsset = 
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/logos');

  // Skip i18n for API routes and assets, but still set CSRF cookie for API
  if (isApiOrAsset) {
    const response = NextResponse.next();
    return ensureCsrfCookie(request, response);
  }

  // Note: Authentication checks are now handled at the page level
  // to reduce middleware bundle size (Edge Function limit: 1 MB)

  // Vérifier si c'est le sous-domaine app
  if (hostname.startsWith('app.')) {
    // Pour le sous-domaine app, appliquer simplement le middleware i18n
    // qui redirigera automatiquement vers /fr ou /en selon la locale
    const response = intlMiddleware(request);
    return ensureCsrfCookie(request, response);
  }
  
  // Pour le domaine principal, bloquer l'accès à /app en production
  if (pathname.match(/^\/(fr|en)\/app/)) {
    // En développement local, autoriser l'accès
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      const response = intlMiddleware(request);
      return ensureCsrfCookie(request, response);
    }
    
    // En production sur le domaine principal, rediriger vers la landing
    return NextResponse.redirect(new URL('/fr', request.url));
  }
  
  // Appliquer le middleware i18n pour toutes les autres routes
  const response = intlMiddleware(request);
  return ensureCsrfCookie(request, response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Note: API routes are included to set CSRF cookie
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
