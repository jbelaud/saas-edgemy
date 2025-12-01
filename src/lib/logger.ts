/**
 * Logger conditionnel pour l'application
 * 
 * En production, seules les erreurs sont loggées.
 * En développement, tous les niveaux sont disponibles.
 * 
 * Usage:
 * ```ts
 * import { logger } from '@/lib/logger';
 * 
 * logger.debug('Message de debug'); // Uniquement en dev
 * logger.info('Information');       // Uniquement en dev
 * logger.warn('Attention');         // Toujours loggé
 * logger.error('Erreur', error);    // Toujours loggé
 * ```
 */

const isProduction = process.env.NODE_ENV === 'production';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  /** Préfixe pour identifier la source du log */
  prefix?: string;
  /** Forcer le logging même en production */
  forceLog?: boolean;
}

function formatMessage(level: LogLevel, prefix: string | undefined, args: unknown[]): string {
  const timestamp = new Date().toISOString();
  const prefixStr = prefix ? `[${prefix}]` : '';
  const levelStr = `[${level.toUpperCase()}]`;
  
  return `${timestamp} ${levelStr}${prefixStr}`;
}

function shouldLog(level: LogLevel, forceLog?: boolean): boolean {
  if (forceLog) return true;
  
  // En production, uniquement warn et error
  if (isProduction) {
    return level === 'warn' || level === 'error';
  }
  
  // En développement, tout est loggé
  return true;
}

/**
 * Créer un logger avec un préfixe personnalisé
 */
export function createLogger(options: LoggerOptions = {}) {
  const { prefix, forceLog } = options;

  return {
    debug: (...args: unknown[]) => {
      if (shouldLog('debug', forceLog)) {
        console.log(formatMessage('debug', prefix, args), ...args);
      }
    },

    info: (...args: unknown[]) => {
      if (shouldLog('info', forceLog)) {
        console.info(formatMessage('info', prefix, args), ...args);
      }
    },

    warn: (...args: unknown[]) => {
      if (shouldLog('warn', forceLog)) {
        console.warn(formatMessage('warn', prefix, args), ...args);
      }
    },

    error: (...args: unknown[]) => {
      if (shouldLog('error', forceLog)) {
        console.error(formatMessage('error', prefix, args), ...args);
      }
    },

    /**
     * Log un objet de manière formatée (utile pour le debug)
     */
    table: (data: unknown) => {
      if (shouldLog('debug', forceLog)) {
        console.table(data);
      }
    },

    /**
     * Mesurer le temps d'exécution
     */
    time: (label: string) => {
      if (shouldLog('debug', forceLog)) {
        console.time(label);
      }
    },

    timeEnd: (label: string) => {
      if (shouldLog('debug', forceLog)) {
        console.timeEnd(label);
      }
    },
  };
}

/**
 * Logger par défaut de l'application
 */
export const logger = createLogger();

/**
 * Logger pour les APIs avec préfixe
 */
export const apiLogger = createLogger({ prefix: 'API' });

/**
 * Logger pour les webhooks
 */
export const webhookLogger = createLogger({ prefix: 'WEBHOOK' });

/**
 * Logger pour les tâches cron
 */
export const cronLogger = createLogger({ prefix: 'CRON' });

/**
 * Logger pour Stripe
 */
export const stripeLogger = createLogger({ prefix: 'STRIPE' });

/**
 * Logger pour l'authentification
 */
export const authLogger = createLogger({ prefix: 'AUTH' });
