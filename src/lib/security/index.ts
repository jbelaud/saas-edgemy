/**
 * Module de Sécurité Edgemy
 * 
 * Ce module centralise toutes les fonctionnalités de sécurité :
 * - Protection CSRF
 * - Audit Trail
 * - Sanitization des entrées
 * - Protection des données personnelles (PII)
 * 
 * Usage:
 * ```ts
 * import { 
 *   validateCsrfToken,
 *   auditLog, 
 *   AuditAction,
 *   sanitizeString,
 *   maskEmail,
 *   redactSensitiveData,
 * } from '@/lib/security';
 * ```
 */

// CSRF Protection
export {
  generateCsrfToken,
  setCsrfCookie,
  validateCsrfToken,
  requiresCsrfProtection,
  CSRF_PROTECTED_ROUTES,
} from './csrf';

// Audit Trail
export {
  auditLog,
  AuditAction,
  AuditSeverity,
  authAudit,
  paymentAudit,
  securityAudit,
} from './audit';

// Sanitization
export {
  escapeHtml,
  stripHtml,
  sanitizeString,
  sanitizeEmail,
  sanitizeName,
  sanitizeUrl,
  sanitizeObject,
  sanitizeId,
  sanitizeSearchParams,
  containsSuspiciousPatterns,
} from './sanitize';

// PII Protection
export {
  maskEmail,
  maskPhone,
  maskName,
  maskIban,
  maskCardNumber,
  maskIpAddress,
  redactSensitiveData,
  anonymizeUserId,
  autoMaskPII,
  looksLikeEmail,
  looksLikePhone,
} from './pii';
