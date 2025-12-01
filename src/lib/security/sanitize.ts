/**
 * Utilitaires de sanitization pour les entrées utilisateur
 * 
 * Ce module fournit des fonctions pour nettoyer et valider
 * les données entrantes afin de prévenir les attaques XSS,
 * les injections SQL (bien que Prisma protège déjà), et
 * autres vecteurs d'attaque.
 * 
 * Usage:
 * ```ts
 * import { sanitizeHtml, sanitizeString, sanitizeObject } from '@/lib/security/sanitize';
 * 
 * const cleanInput = sanitizeString(userInput);
 * const cleanHtml = sanitizeHtml(userHtmlContent);
 * const cleanObject = sanitizeObject(requestBody);
 * ```
 */

/**
 * Caractères HTML dangereux à échapper
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Échappe les caractères HTML dangereux
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Supprime les balises HTML d'une chaîne
 */
export function stripHtml(str: string): string {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Nettoie une chaîne de caractères
 * - Supprime les caractères de contrôle
 * - Normalise les espaces
 * - Limite la longueur
 */
export function sanitizeString(
  str: string,
  options: {
    maxLength?: number;
    allowNewlines?: boolean;
    escapeHtml?: boolean;
  } = {}
): string {
  const { maxLength = 10000, allowNewlines = true, escapeHtml: shouldEscape = true } = options;

  let result = str
    // Supprimer les caractères de contrôle (sauf newlines si autorisés)
    .replace(allowNewlines ? /[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g : /[\x00-\x1F\x7F]/g, '')
    // Normaliser les espaces multiples
    .replace(/\s+/g, ' ')
    // Supprimer les espaces en début/fin
    .trim();

  // Échapper HTML si demandé
  if (shouldEscape) {
    result = escapeHtml(result);
  }

  // Limiter la longueur
  if (result.length > maxLength) {
    result = result.substring(0, maxLength);
  }

  return result;
}

/**
 * Nettoie un email
 */
export function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .trim()
    .replace(/[<>'"]/g, ''); // Supprimer les caractères dangereux
}

/**
 * Nettoie un nom (prénom, nom de famille)
 */
export function sanitizeName(name: string): string {
  return sanitizeString(name, {
    maxLength: 100,
    allowNewlines: false,
    escapeHtml: true,
  });
}

/**
 * Nettoie une URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    
    // N'autoriser que http et https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    // Bloquer les URLs javascript:
    if (url.toLowerCase().includes('javascript:')) {
      return null;
    }
    
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Nettoie un objet récursivement
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: {
    maxDepth?: number;
    currentDepth?: number;
    maxStringLength?: number;
  } = {}
): T {
  const { maxDepth = 10, currentDepth = 0, maxStringLength = 10000 } = options;

  if (currentDepth >= maxDepth) {
    return {} as T;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Nettoyer la clé
    const cleanKey = sanitizeString(key, { maxLength: 100, escapeHtml: false });

    if (typeof value === 'string') {
      result[cleanKey] = sanitizeString(value, { maxLength: maxStringLength });
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      result[cleanKey] = value;
    } else if (value === null || value === undefined) {
      result[cleanKey] = value;
    } else if (Array.isArray(value)) {
      result[cleanKey] = value.map((item) => {
        if (typeof item === 'string') {
          return sanitizeString(item, { maxLength: maxStringLength });
        }
        if (typeof item === 'object' && item !== null) {
          return sanitizeObject(item as Record<string, unknown>, {
            maxDepth,
            currentDepth: currentDepth + 1,
            maxStringLength,
          });
        }
        return item;
      });
    } else if (typeof value === 'object') {
      result[cleanKey] = sanitizeObject(value as Record<string, unknown>, {
        maxDepth,
        currentDepth: currentDepth + 1,
        maxStringLength,
      });
    }
  }

  return result as T;
}

/**
 * Vérifie si une chaîne contient des patterns suspects
 */
export function containsSuspiciousPatterns(str: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onerror=, etc.
    /data:/i,
    /vbscript:/i,
    /expression\s*\(/i,
    /url\s*\(/i,
    /@import/i,
    /<!--/,
    /-->/,
    /\x00/, // Null byte
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(str));
}

/**
 * Valide et nettoie un ID (CUID, UUID, etc.)
 */
export function sanitizeId(id: string): string | null {
  // Pattern pour CUID (utilisé par Prisma)
  const cuidPattern = /^c[a-z0-9]{24}$/;
  // Pattern pour UUID
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const trimmed = id.trim();

  if (cuidPattern.test(trimmed) || uuidPattern.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Nettoie les paramètres de recherche
 */
export function sanitizeSearchParams(
  params: URLSearchParams
): Record<string, string> {
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    const cleanKey = sanitizeString(key, { maxLength: 50, escapeHtml: false });
    const cleanValue = sanitizeString(value, { maxLength: 500 });
    result[cleanKey] = cleanValue;
  });

  return result;
}
