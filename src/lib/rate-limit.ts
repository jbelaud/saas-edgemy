import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

/**
 * Configuration du Rate Limiting avec Upstash Redis
 * 
 * Variables d'environnement requises:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 * 
 * Documentation: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 */

// Vérifier si les variables d'environnement sont configurées
const isConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_TOKEN
);

// Créer l'instance Redis uniquement si configurée
const redis = isConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * Rate limiter pour les APIs d'authentification (login, signup)
 * Limite: 5 requêtes par minute par IP
 */
export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: 'ratelimit:auth',
    })
  : null;

/**
 * Rate limiter pour les APIs publiques (subscribe, contact)
 * Limite: 10 requêtes par minute par IP
 */
export const publicApiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: 'ratelimit:public',
    })
  : null;

/**
 * Rate limiter pour les APIs sensibles (paiement, création de session)
 * Limite: 20 requêtes par minute par utilisateur
 */
export const sensitiveApiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      analytics: true,
      prefix: 'ratelimit:sensitive',
    })
  : null;

/**
 * Rate limiter général pour les APIs
 * Limite: 100 requêtes par minute par IP
 */
export const generalRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: 'ratelimit:general',
    })
  : null;

/**
 * Extraire l'IP du client depuis les headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return '127.0.0.1';
}

/**
 * Vérifier le rate limit et retourner une réponse d'erreur si dépassé
 * 
 * @param rateLimiter - Instance du rate limiter à utiliser
 * @param identifier - Identifiant unique (IP ou userId)
 * @returns null si OK, NextResponse si rate limited
 */
export async function checkRateLimit(
  rateLimiter: Ratelimit | null,
  identifier: string
): Promise<NextResponse | null> {
  // Si le rate limiter n'est pas configuré, laisser passer
  if (!rateLimiter) {
    return null;
  }

  try {
    const { success, limit, remaining, reset } = await rateLimiter.limit(identifier);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      
      return NextResponse.json(
        {
          error: 'Trop de requêtes. Veuillez réessayer plus tard.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': retryAfter.toString(),
          },
        }
      );
    }

    return null;
  } catch (error) {
    // En cas d'erreur Redis, laisser passer (fail-open)
    console.error('Rate limit check failed:', error);
    return null;
  }
}

/**
 * Helper pour appliquer le rate limiting dans une route API
 * 
 * Usage:
 * ```ts
 * export async function POST(request: Request) {
 *   const rateLimitResponse = await applyRateLimit(request, 'public');
 *   if (rateLimitResponse) return rateLimitResponse;
 *   
 *   // ... reste de la logique
 * }
 * ```
 */
export async function applyRateLimit(
  request: Request,
  type: 'auth' | 'public' | 'sensitive' | 'general' = 'general',
  customIdentifier?: string
): Promise<NextResponse | null> {
  const identifier = customIdentifier || getClientIp(request);
  
  const rateLimiter = {
    auth: authRateLimiter,
    public: publicApiRateLimiter,
    sensitive: sensitiveApiRateLimiter,
    general: generalRateLimiter,
  }[type];

  return checkRateLimit(rateLimiter, identifier);
}

/**
 * Vérifier si le rate limiting est configuré
 */
export function isRateLimitConfigured(): boolean {
  return isConfigured;
}
