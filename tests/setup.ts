import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

// Configuration de MSW pour les tests
const server = setupServer(...handlers);

// Démarrer le serveur MSW avant tous les tests
beforeAll(() => server.listen({ 
  onUnhandledRequest: (req) => {
    const url = new URL(req.url);
    
    // Ignorer les requêtes vers des fichiers statiques ou des ressources externes
    if (
      url.pathname.startsWith('/_next/') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.svg') ||
      url.hostname === 'vercel.live' ||
      url.hostname.endsWith('.vercel.app')
    ) {
      return;
    }
    
    // Pour les autres requêtes non gérées, afficher un avertissement
    console.warn('Unhandled request:', req.method, req.url);
  }
}));

// Réinitialiser les handlers entre chaque test
beforeEach(() => {
  server.resetHandlers();
});

// Nettoyer après les tests
afterAll(() => server.close());

// Cleanup après chaque test
afterEach(() => {
  cleanup();
  // Réinitialiser les mocks entre les tests
  vi.clearAllMocks();
});

// Mock de Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock de next-intl
vi.mock('next-intl', () => ({
  useLocale: () => 'fr',
  useTranslations: () => (key: string) => key,
}));
