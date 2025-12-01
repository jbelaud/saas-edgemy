'use client';

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useRef, useCallback } from 'react';

/**
 * Composant Turnstile (Captcha Cloudflare)
 * 
 * Variables d'environnement requises:
 * - NEXT_PUBLIC_TURNSTILE_SITE_KEY : Clé publique Turnstile
 * - TURNSTILE_SECRET_KEY : Clé secrète (côté serveur uniquement)
 * 
 * Usage:
 * ```tsx
 * import { TurnstileWidget } from '@/components/security/TurnstileWidget';
 * 
 * function MyForm() {
 *   const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
 *   
 *   return (
 *     <form>
 *       <TurnstileWidget onSuccess={setTurnstileToken} />
 *       <button disabled={!turnstileToken}>Envoyer</button>
 *     </form>
 *   );
 * }
 * ```
 * 
 * Pour obtenir les clés:
 * 1. Aller sur https://dash.cloudflare.com/
 * 2. Turnstile > Add Site
 * 3. Copier Site Key et Secret Key
 */

interface TurnstileWidgetProps {
  /** Callback appelé quand le captcha est validé */
  onSuccess: (token: string) => void;
  /** Callback appelé en cas d'erreur */
  onError?: () => void;
  /** Callback appelé quand le token expire */
  onExpire?: () => void;
  /** Thème du widget */
  theme?: 'light' | 'dark' | 'auto';
  /** Taille du widget */
  size?: 'normal' | 'compact';
  /** Classe CSS additionnelle */
  className?: string;
}

export function TurnstileWidget({
  onSuccess,
  onError,
  onExpire,
  theme = 'auto',
  size = 'normal',
  className,
}: TurnstileWidgetProps) {
  const turnstileRef = useRef<TurnstileInstance>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const handleSuccess = useCallback(
    (token: string) => {
      onSuccess(token);
    },
    [onSuccess]
  );

  const handleError = useCallback(() => {
    onError?.();
    // Reset le widget en cas d'erreur
    turnstileRef.current?.reset();
  }, [onError]);

  const handleExpire = useCallback(() => {
    onExpire?.();
    // Reset le widget quand le token expire
    turnstileRef.current?.reset();
  }, [onExpire]);

  // Si pas de clé configurée, ne rien afficher (mode dev)
  if (!siteKey) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className={`p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700 ${className}`}>
          ⚠️ Turnstile non configuré (NEXT_PUBLIC_TURNSTILE_SITE_KEY manquant)
        </div>
      );
    }
    return null;
  }

  return (
    <div className={className}>
      <Turnstile
        ref={turnstileRef}
        siteKey={siteKey}
        onSuccess={handleSuccess}
        onError={handleError}
        onExpire={handleExpire}
        options={{
          theme,
          size,
          language: 'fr',
        }}
      />
    </div>
  );
}

/**
 * Hook pour réinitialiser le widget Turnstile
 */
export function useTurnstileReset() {
  const turnstileRef = useRef<TurnstileInstance>(null);

  const reset = useCallback(() => {
    turnstileRef.current?.reset();
  }, []);

  return { turnstileRef, reset };
}
