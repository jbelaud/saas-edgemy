/**
 * Vérification côté serveur du token Turnstile
 * 
 * Usage dans une route API:
 * ```ts
 * import { verifyTurnstileToken } from '@/lib/security/turnstile';
 * 
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *   const { turnstileToken, ...data } = body;
 *   
 *   const isValid = await verifyTurnstileToken(turnstileToken, request);
 *   if (!isValid) {
 *     return NextResponse.json({ error: 'Captcha invalide' }, { status: 400 });
 *   }
 *   
 *   // ... reste de la logique
 * }
 * ```
 */

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

/**
 * Vérifie un token Turnstile côté serveur
 * 
 * @param token - Le token reçu du widget Turnstile
 * @param request - La requête pour extraire l'IP (optionnel)
 * @returns true si le token est valide, false sinon
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  request?: Request
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // Si pas de clé secrète configurée, passer en mode dev
  if (!secretKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Turnstile] Secret key not configured, skipping verification in dev mode');
      return true;
    }
    console.error('[Turnstile] TURNSTILE_SECRET_KEY not configured');
    return false;
  }

  // Token requis
  if (!token) {
    console.warn('[Turnstile] No token provided');
    return false;
  }

  try {
    // Extraire l'IP du client
    let remoteip: string | undefined;
    if (request) {
      const forwarded = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      remoteip = forwarded?.split(',')[0].trim() || realIp || undefined;
    }

    // Appeler l'API Cloudflare
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
          ...(remoteip && { remoteip }),
        }),
      }
    );

    if (!response.ok) {
      console.error('[Turnstile] API error:', response.status);
      return false;
    }

    const data: TurnstileVerifyResponse = await response.json();

    if (!data.success) {
      console.warn('[Turnstile] Verification failed:', data['error-codes']);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Turnstile] Verification error:', error);
    return false;
  }
}

/**
 * Middleware helper pour vérifier Turnstile dans les routes API
 * 
 * @param body - Le body de la requête contenant turnstileToken
 * @param request - La requête
 * @returns { valid: true } ou { valid: false, error: string }
 */
export async function validateTurnstile(
  body: { turnstileToken?: string },
  request?: Request
): Promise<{ valid: true } | { valid: false; error: string }> {
  const isValid = await verifyTurnstileToken(body.turnstileToken, request);

  if (!isValid) {
    return {
      valid: false,
      error: 'Veuillez compléter le captcha',
    };
  }

  return { valid: true };
}
