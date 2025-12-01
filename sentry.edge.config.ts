import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Taux d'échantillonnage pour les traces
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Désactiver en développement si pas de DSN
  enabled: !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
});
