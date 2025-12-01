import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * Système d'Audit Trail pour tracer les actions sensibles
 * 
 * Ce module permet de :
 * - Tracer toutes les actions importantes (paiements, modifications de profil, etc.)
 * - Détecter les comportements suspects
 * - Faciliter les investigations en cas d'incident
 * - Répondre aux exigences de conformité (RGPD, etc.)
 * 
 * Usage:
 * ```ts
 * import { auditLog, AuditAction } from '@/lib/security/audit';
 * 
 * await auditLog({
 *   action: AuditAction.PAYMENT_COMPLETED,
 *   userId: session.user.id,
 *   resourceType: 'reservation',
 *   resourceId: reservationId,
 *   metadata: { amount: 5000, currency: 'EUR' },
 *   request,
 * });
 * ```
 */

export enum AuditAction {
  // Authentification
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  
  // Profil
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  PROFILE_DELETED = 'PROFILE_DELETED',
  EMAIL_CHANGED = 'EMAIL_CHANGED',
  
  // Paiements
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REFUND_REQUESTED = 'REFUND_REQUESTED',
  REFUND_COMPLETED = 'REFUND_COMPLETED',
  TRANSFER_TO_COACH = 'TRANSFER_TO_COACH',
  
  // Réservations
  RESERVATION_CREATED = 'RESERVATION_CREATED',
  RESERVATION_CANCELLED = 'RESERVATION_CANCELLED',
  RESERVATION_COMPLETED = 'RESERVATION_COMPLETED',
  
  // Coach
  COACH_PROFILE_CREATED = 'COACH_PROFILE_CREATED',
  COACH_SUBSCRIPTION_CHANGED = 'COACH_SUBSCRIPTION_CHANGED',
  COACH_STRIPE_CONNECTED = 'COACH_STRIPE_CONNECTED',
  ANNOUNCEMENT_CREATED = 'ANNOUNCEMENT_CREATED',
  ANNOUNCEMENT_UPDATED = 'ANNOUNCEMENT_UPDATED',
  ANNOUNCEMENT_DELETED = 'ANNOUNCEMENT_DELETED',
  
  // Admin
  ADMIN_ACTION = 'ADMIN_ACTION',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  USER_BANNED = 'USER_BANNED',
  REVIEW_MODERATED = 'REVIEW_MODERATED',
  
  // Sécurité
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CSRF_VIOLATION = 'CSRF_VIOLATION',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'UNAUTHORIZED_ACCESS_ATTEMPT',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

interface AuditLogParams {
  action: AuditAction;
  userId?: string | null;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  request?: Request;
  severity?: AuditSeverity;
}

interface AuditEntry {
  action: AuditAction;
  userId: string | null;
  resourceType: string | null;
  resourceId: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  severity: AuditSeverity;
  timestamp: Date;
}

/**
 * Extraire les informations de la requête
 */
function extractRequestInfo(request?: Request): {
  ipAddress: string | null;
  userAgent: string | null;
} {
  if (!request) {
    return { ipAddress: null, userAgent: null };
  }

  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ipAddress = forwarded?.split(',')[0].trim() || realIp || null;
  const userAgent = request.headers.get('user-agent');

  return { ipAddress, userAgent };
}

/**
 * Déterminer la sévérité automatiquement si non spécifiée
 */
function determineSeverity(action: AuditAction): AuditSeverity {
  const criticalActions = [
    AuditAction.PAYMENT_FAILED,
    AuditAction.SUSPICIOUS_ACTIVITY,
    AuditAction.CSRF_VIOLATION,
    AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT,
    AuditAction.USER_BANNED,
    AuditAction.PROFILE_DELETED,
  ];

  const warningActions = [
    AuditAction.LOGIN_FAILED,
    AuditAction.RATE_LIMIT_EXCEEDED,
    AuditAction.REFUND_REQUESTED,
    AuditAction.RESERVATION_CANCELLED,
    AuditAction.PASSWORD_RESET_REQUESTED,
  ];

  if (criticalActions.includes(action)) {
    return AuditSeverity.CRITICAL;
  }

  if (warningActions.includes(action)) {
    return AuditSeverity.WARNING;
  }

  return AuditSeverity.INFO;
}

/**
 * Enregistrer un événement d'audit
 */
export async function auditLog(params: AuditLogParams): Promise<void> {
  const {
    action,
    userId = null,
    resourceType = null,
    resourceId = null,
    metadata = {},
    request,
    severity,
  } = params;

  const { ipAddress, userAgent } = extractRequestInfo(request);
  const finalSeverity = severity || determineSeverity(action);

  const entry: AuditEntry = {
    action,
    userId,
    resourceType,
    resourceId,
    metadata,
    ipAddress,
    userAgent,
    severity: finalSeverity,
    timestamp: new Date(),
  };

  // Log en console pour le monitoring
  const logMethod = finalSeverity === AuditSeverity.CRITICAL 
    ? logger.error 
    : finalSeverity === AuditSeverity.WARNING 
      ? logger.warn 
      : logger.info;

  logMethod(`[AUDIT] ${action}`, {
    userId,
    resourceType,
    resourceId,
    ipAddress,
    severity: finalSeverity,
  });

  // Stocker en base de données (si la table existe)
  try {
    // Note: Vous devrez créer cette table dans votre schéma Prisma
    // Pour l'instant, on log uniquement en console
    // await prisma.auditLog.create({ data: entry });
    
    // Alternative: Envoyer vers un service externe (Datadog, Sentry, etc.)
    if (finalSeverity === AuditSeverity.CRITICAL) {
      // TODO: Envoyer une alerte (email, Slack, etc.)
      console.error('[CRITICAL AUDIT]', JSON.stringify(entry, null, 2));
    }
  } catch (error) {
    logger.error('Failed to save audit log:', error);
  }
}

/**
 * Helper pour les actions d'authentification
 */
export const authAudit = {
  loginSuccess: (userId: string, request?: Request) =>
    auditLog({ action: AuditAction.LOGIN_SUCCESS, userId, request }),
  
  loginFailed: (email: string, request?: Request) =>
    auditLog({
      action: AuditAction.LOGIN_FAILED,
      metadata: { email },
      request,
      severity: AuditSeverity.WARNING,
    }),
  
  logout: (userId: string, request?: Request) =>
    auditLog({ action: AuditAction.LOGOUT, userId, request }),
};

/**
 * Helper pour les actions de paiement
 */
export const paymentAudit = {
  initiated: (userId: string, reservationId: string, amount: number, request?: Request) =>
    auditLog({
      action: AuditAction.PAYMENT_INITIATED,
      userId,
      resourceType: 'reservation',
      resourceId: reservationId,
      metadata: { amount },
      request,
    }),
  
  completed: (userId: string, reservationId: string, amount: number, request?: Request) =>
    auditLog({
      action: AuditAction.PAYMENT_COMPLETED,
      userId,
      resourceType: 'reservation',
      resourceId: reservationId,
      metadata: { amount },
      request,
    }),
  
  failed: (userId: string, reservationId: string, error: string, request?: Request) =>
    auditLog({
      action: AuditAction.PAYMENT_FAILED,
      userId,
      resourceType: 'reservation',
      resourceId: reservationId,
      metadata: { error },
      request,
      severity: AuditSeverity.CRITICAL,
    }),
  
  transferToCoach: (coachId: string, reservationId: string, amount: number, request?: Request) =>
    auditLog({
      action: AuditAction.TRANSFER_TO_COACH,
      userId: coachId,
      resourceType: 'reservation',
      resourceId: reservationId,
      metadata: { amount },
      request,
    }),
};

/**
 * Helper pour les actions de sécurité
 */
export const securityAudit = {
  suspiciousActivity: (userId: string | null, reason: string, request?: Request) =>
    auditLog({
      action: AuditAction.SUSPICIOUS_ACTIVITY,
      userId,
      metadata: { reason },
      request,
      severity: AuditSeverity.CRITICAL,
    }),
  
  rateLimitExceeded: (identifier: string, endpoint: string, request?: Request) =>
    auditLog({
      action: AuditAction.RATE_LIMIT_EXCEEDED,
      metadata: { identifier, endpoint },
      request,
      severity: AuditSeverity.WARNING,
    }),
  
  csrfViolation: (request?: Request) =>
    auditLog({
      action: AuditAction.CSRF_VIOLATION,
      request,
      severity: AuditSeverity.CRITICAL,
    }),
  
  unauthorizedAccess: (userId: string | null, resource: string, request?: Request) =>
    auditLog({
      action: AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT,
      userId,
      metadata: { resource },
      request,
      severity: AuditSeverity.CRITICAL,
    }),
};
