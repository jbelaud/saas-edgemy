import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Taux d'échantillonnage pour les traces
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Désactiver en développement si pas de DSN
  enabled: !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),

  // Ignorer certaines erreurs
  ignoreErrors: [
    'NEXT_NOT_FOUND',
    'NEXT_REDIRECT',
  ],

  // Nettoyer les données sensibles
  beforeSend(event) {
    // Supprimer les données sensibles
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-csrf-token'];
    }

    // Supprimer les données sensibles des extras
    if (event.extra) {
      const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'stripeKey'];
      for (const key of Object.keys(event.extra)) {
        if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
          event.extra[key] = '[REDACTED]';
        }
      }
    }

    return event;
  },

  // Configurer les integrations
  integrations: [
    Sentry.prismaIntegration(),
  ],
});
