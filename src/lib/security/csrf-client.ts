/**
 * Utilitaires CSRF côté client
 * 
 * Usage:
 * ```ts
 * import { getCsrfToken, fetchWithCsrf } from '@/lib/security/csrf-client';
 * 
 * // Option 1: Récupérer le token manuellement
 * const response = await fetch('/api/sensitive', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'X-CSRF-Token': getCsrfToken(),
 *   },
 *   body: JSON.stringify(data),
 * });
 * 
 * // Option 2: Utiliser le helper fetchWithCsrf
 * const response = await fetchWithCsrf('/api/sensitive', {
 *   method: 'POST',
 *   body: JSON.stringify(data),
 * });
 * ```
 */

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Récupère le token CSRF depuis le cookie
 */
export function getCsrfToken(): string {
  if (typeof document === 'undefined') {
    return '';
  }

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }

  return '';
}

/**
 * Vérifie si un token CSRF est disponible
 */
export function hasCsrfToken(): boolean {
  return getCsrfToken() !== '';
}

/**
 * Wrapper fetch qui ajoute automatiquement le token CSRF
 */
export async function fetchWithCsrf(
  url: string | URL,
  options: RequestInit = {}
): Promise<Response> {
  const csrfToken = getCsrfToken();

  const headers = new Headers(options.headers);
  
  if (csrfToken) {
    headers.set(CSRF_HEADER_NAME, csrfToken);
  }

  // S'assurer que Content-Type est défini pour les requêtes avec body
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Important pour envoyer les cookies
  });
}

/**
 * Hook React pour utiliser fetchWithCsrf
 * 
 * Usage:
 * ```tsx
 * import { useCsrfFetch } from '@/lib/security/csrf-client';
 * 
 * function MyComponent() {
 *   const csrfFetch = useCsrfFetch();
 *   
 *   const handleSubmit = async () => {
 *     const response = await csrfFetch('/api/data', {
 *       method: 'POST',
 *       body: JSON.stringify({ data }),
 *     });
 *   };
 * }
 * ```
 */
export function useCsrfFetch() {
  return fetchWithCsrf;
}
