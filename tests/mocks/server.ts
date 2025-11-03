import { beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * Serveur MSW pour mocker les APIs dans les tests
 */
export const server = setupServer(...handlers);

// Démarre le serveur avant tous les tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Réinitialise les handlers après chaque test
afterEach(() => server.resetHandlers());

// Ferme le serveur après tous les tests
afterAll(() => server.close());
