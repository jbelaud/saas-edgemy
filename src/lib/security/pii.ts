/**
 * Protection des Données Personnelles (PII - Personally Identifiable Information)
 * 
 * Ce module fournit des utilitaires pour :
 * - Masquer les données sensibles dans les logs
 * - Anonymiser les données pour les exports
 * - Respecter les exigences RGPD
 * 
 * Usage:
 * ```ts
 * import { maskEmail, maskPhone, maskPII, redactSensitiveData } from '@/lib/security/pii';
 * 
 * // Masquer un email pour les logs
 * console.log(maskEmail('john.doe@example.com')); // j***@e***.com
 * 
 * // Masquer automatiquement les PII dans un objet
 * const safeLog = redactSensitiveData({ email: 'test@test.com', password: 'secret' });
 * ```
 */

/**
 * Masque un email en gardant le premier caractère et le domaine partiel
 * john.doe@example.com -> j***@e***.com
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return '***@***.***';
  }

  const [local, domain] = email.split('@');
  const [domainName, ...tld] = domain.split('.');

  const maskedLocal = local.charAt(0) + '***';
  const maskedDomain = domainName.charAt(0) + '***';
  const maskedTld = tld.join('.');

  return `${maskedLocal}@${maskedDomain}.${maskedTld}`;
}

/**
 * Masque un numéro de téléphone
 * +33612345678 -> +33******78
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) {
    return '***';
  }

  const cleaned = phone.replace(/\s/g, '');
  const prefix = cleaned.slice(0, 3);
  const suffix = cleaned.slice(-2);

  return `${prefix}******${suffix}`;
}

/**
 * Masque un nom
 * Jean Dupont -> J*** D***
 */
export function maskName(name: string): string {
  if (!name) {
    return '***';
  }

  return name
    .split(' ')
    .map((part) => (part.length > 0 ? part.charAt(0) + '***' : '***'))
    .join(' ');
}

/**
 * Masque un IBAN
 * FR7630001007941234567890185 -> FR76**********************85
 */
export function maskIban(iban: string): string {
  if (!iban || iban.length < 6) {
    return '****';
  }

  const cleaned = iban.replace(/\s/g, '');
  const prefix = cleaned.slice(0, 4);
  const suffix = cleaned.slice(-2);
  const middle = '*'.repeat(cleaned.length - 6);

  return `${prefix}${middle}${suffix}`;
}

/**
 * Masque un numéro de carte bancaire
 * 4111111111111111 -> ****-****-****-1111
 */
export function maskCardNumber(cardNumber: string): string {
  if (!cardNumber || cardNumber.length < 4) {
    return '****-****-****-****';
  }

  const cleaned = cardNumber.replace(/\s|-/g, '');
  const lastFour = cleaned.slice(-4);

  return `****-****-****-${lastFour}`;
}

/**
 * Masque une adresse IP
 * 192.168.1.100 -> 192.168.***.***
 */
export function maskIpAddress(ip: string): string {
  if (!ip) {
    return '***.***.***.***';
  }

  const parts = ip.split('.');
  if (parts.length !== 4) {
    // IPv6 ou format invalide
    return ip.slice(0, 8) + '***';
  }

  return `${parts[0]}.${parts[1]}.***.***`;
}

/**
 * Liste des champs sensibles à masquer automatiquement
 */
const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'secretKey',
  'privateKey',
  'creditCard',
  'cardNumber',
  'cvv',
  'cvc',
  'ssn',
  'socialSecurityNumber',
  'iban',
  'bankAccount',
  'stripeSecretKey',
  'webhookSecret',
];

/**
 * Liste des champs PII à masquer
 */
const PII_FIELDS = [
  'email',
  'phone',
  'phoneNumber',
  'mobile',
  'address',
  'streetAddress',
  'postalCode',
  'zipCode',
  'dateOfBirth',
  'birthDate',
  'ipAddress',
  'ip',
];

/**
 * Masque automatiquement les données sensibles dans un objet
 * Utile pour les logs
 */
export function redactSensitiveData<T extends Record<string, unknown>>(
  obj: T,
  options: {
    maskPII?: boolean;
    maxDepth?: number;
    currentDepth?: number;
  } = {}
): T {
  const { maskPII = true, maxDepth = 10, currentDepth = 0 } = options;

  if (currentDepth >= maxDepth) {
    return '[MAX_DEPTH]' as unknown as T;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    // Masquer complètement les champs sensibles
    if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()))) {
      result[key] = '[REDACTED]';
      continue;
    }

    // Masquer partiellement les PII
    if (maskPII && PII_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()))) {
      if (typeof value === 'string') {
        if (lowerKey.includes('email')) {
          result[key] = maskEmail(value);
        } else if (lowerKey.includes('phone') || lowerKey.includes('mobile')) {
          result[key] = maskPhone(value);
        } else if (lowerKey.includes('ip')) {
          result[key] = maskIpAddress(value);
        } else if (lowerKey.includes('iban')) {
          result[key] = maskIban(value);
        } else {
          result[key] = '***';
        }
      } else {
        result[key] = '[REDACTED]';
      }
      continue;
    }

    // Traiter récursivement les objets imbriqués
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = redactSensitiveData(value as Record<string, unknown>, {
        maskPII,
        maxDepth,
        currentDepth: currentDepth + 1,
      });
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (typeof item === 'object' && item !== null) {
          return redactSensitiveData(item as Record<string, unknown>, {
            maskPII,
            maxDepth,
            currentDepth: currentDepth + 1,
          });
        }
        return item;
      });
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

/**
 * Génère un identifiant anonyme à partir d'un ID utilisateur
 * Utile pour les analytics sans exposer les vrais IDs
 */
export function anonymizeUserId(userId: string, salt: string = ''): string {
  // Simple hash pour l'anonymisation (non cryptographique)
  const str = userId + salt;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `anon_${Math.abs(hash).toString(36)}`;
}

/**
 * Vérifie si une chaîne ressemble à un email
 */
export function looksLikeEmail(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

/**
 * Vérifie si une chaîne ressemble à un numéro de téléphone
 */
export function looksLikePhone(str: string): boolean {
  const cleaned = str.replace(/[\s\-\.\(\)]/g, '');
  return /^\+?[0-9]{8,15}$/.test(cleaned);
}

/**
 * Détecte et masque automatiquement les PII dans une chaîne
 */
export function autoMaskPII(text: string): string {
  let result = text;

  // Masquer les emails
  result = result.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    (match) => maskEmail(match)
  );

  // Masquer les numéros de téléphone (format international)
  result = result.replace(
    /\+?[0-9]{1,4}[\s\-]?[0-9]{2,4}[\s\-]?[0-9]{2,4}[\s\-]?[0-9]{2,4}/g,
    (match) => {
      if (match.replace(/[\s\-]/g, '').length >= 8) {
        return maskPhone(match);
      }
      return match;
    }
  );

  return result;
}
