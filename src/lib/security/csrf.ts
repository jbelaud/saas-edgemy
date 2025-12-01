import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Protection CSRF avec Double Submit Cookie Pattern
 * 
 * Ce module implémente une protection CSRF robuste :
 * 1. Génère un token CSRF stocké dans un cookie HttpOnly
 * 2. Le client doit renvoyer ce token dans un header X-CSRF-Token
 * 3. Le serveur vérifie que les deux correspondent
 * 
 * Usage côté API:
 * ```ts
 * import { validateCsrfToken } from '@/lib/security/csrf';
 * 
 * export async function POST(request: NextRequest) {
 *   const csrfError = await validateCsrfToken(request);
 *   if (csrfError) return csrfError;
 *   // ... reste de la logique
 * }
 * ```
 * 
 * Usage côté client:
 * ```ts
 * import { getCsrfToken } from '@/lib/security/csrf-client';
 * 
 * fetch('/api/sensitive', {
 *   method: 'POST',
 *   headers: {
 *     'X-CSRF-Token': getCsrfToken(),
 *   },
 * });
 * ```
 */

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Génère un token CSRF cryptographiquement sécurisé
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Définit le cookie CSRF si absent
 * À appeler dans le middleware ou au chargement de page
 */
export async function setCsrfCookie(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!token) {
    token = generateCsrfToken();
    cookieStore.set(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Le client doit pouvoir le lire
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 heures
    });
  }

  return token;
}

/**
 * Valide le token CSRF pour les requêtes mutatives
 * 
 * @param request - La requête entrante
 * @returns null si valide, NextResponse d'erreur sinon
 */
export async function validateCsrfToken(
  request: NextRequest
): Promise<NextResponse | null> {
  // Ne valider que les méthodes mutatives
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return null;
  }

  // Vérifier l'origine de la requête
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  
  if (origin) {
    const originUrl = new URL(origin);
    const allowedHosts = [
      'localhost',
      '127.0.0.1',
      'edgemy.fr',
      'app.edgemy.fr',
      'www.edgemy.fr',
    ];
    
    if (!allowedHosts.some(h => originUrl.hostname === h || originUrl.hostname.endsWith(`.${h}`))) {
      return NextResponse.json(
        { error: 'Origine non autorisée' },
        { status: 403 }
      );
    }
  }

  // Récupérer le token du cookie
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  
  // Récupérer le token du header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  // Les deux doivent être présents et correspondre
  if (!cookieToken || !headerToken) {
    return NextResponse.json(
      { error: 'Token CSRF manquant' },
      { status: 403 }
    );
  }

  // Comparaison en temps constant pour éviter les timing attacks
  if (!timingSafeEqual(cookieToken, headerToken)) {
    return NextResponse.json(
      { error: 'Token CSRF invalide' },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Comparaison en temps constant pour éviter les timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Liste des routes qui nécessitent une validation CSRF
 * (routes sensibles avec mutations de données)
 */
export const CSRF_PROTECTED_ROUTES = [
  '/api/reservations',
  '/api/coach/profile',
  '/api/coach/availability',
  '/api/coach/announcement',
  '/api/player/profile',
  '/api/reviews',
  '/api/stripe/create-session',
  '/api/admin/',
];

/**
 * Vérifie si une route nécessite une protection CSRF
 */
export function requiresCsrfProtection(pathname: string): boolean {
  return CSRF_PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}
