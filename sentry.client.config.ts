import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Ajuster le taux d'échantillonnage en production
  // 1.0 = 100% des erreurs, 0.1 = 10%
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Capturer les replays en cas d'erreur
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0,

  // Désactiver en développement si pas de DSN
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Ignorer certaines erreurs communes non critiques
  ignoreErrors: [
    // Erreurs réseau
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    // Erreurs de navigation
    'ResizeObserver loop',
    'ResizeObserver loop completed with undelivered notifications',
    // Erreurs d'extension navigateur
    'Extension context invalidated',
  ],

  // Filtrer les URLs de breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    // Ne pas capturer les requêtes vers des services tiers
    if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
      const url = breadcrumb.data?.url;
      if (url && (
        url.includes('stripe.com') ||
        url.includes('sentry.io') ||
        url.includes('analytics')
      )) {
        return null;
      }
    }
    return breadcrumb;
  },

  // Nettoyer les données sensibles avant envoi
  beforeSend(event) {
    // Supprimer les données sensibles des headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-csrf-token'];
    }

    // Masquer les emails dans les messages d'erreur
    if (event.message) {
      event.message = event.message.replace(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        '[EMAIL]'
      );
    }

    return event;
  },
});
