import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  
  // Vérifier si c'est le sous-domaine app
  if (hostname.startsWith('app.')) {
    // Routes publiques de l'app (pas besoin d'auth)
    const publicRoutes = [
      '/app',                        // Page d'accueil app (publique)
      '/app/auth/login',
      '/app/auth/register',
      '/app/auth/test',
      '/app/auth/forgot-password',
    ];
    
    // Routes API et assets (toujours accessibles)
    const isApiOrAsset = pathname.startsWith('/api') || 
                         pathname.startsWith('/_next') || 
                         pathname.startsWith('/favicon.ico');
    
    // Vérifier l'authentification pour les routes protégées
    if (!isApiOrAsset && !publicRoutes.includes(pathname) && pathname.startsWith('/app')) {
      const token = request.cookies.get('better-auth.session_token')?.value;
      
      // Si pas de token, rediriger vers login
      if (!token) {
        const loginUrl = new URL('/app/auth/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
    
    // Rewrite pour le sous-domaine app
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/app', request.url));
    }
    
    // Réécrire les routes pour pointer vers /app/*
    if (!pathname.startsWith('/app') && !isApiOrAsset) {
      return NextResponse.rewrite(new URL('/app' + pathname, request.url));
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
