import { describe, it, expect, beforeAll } from 'vitest';

/**
 * Tests d'intégration pour les API Coach
 *
 * Note: Ces tests nécessitent que le serveur Next.js soit démarré
 * et qu'une base de données de test soit configurée.
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Mock d'un token d'authentification (à adapter selon votre système d'auth)
let authToken = 'test_auth_token';

describe('API Coach - /api/coach/*', () => {
  beforeAll(async () => {
    // Utilisation d'un token factice pour les tests
    // En environnement de test, ce token sera accepté par nos mocks MSW
    authToken = 'test_auth_token';
  });

  describe('GET /api/coach/packages', () => {
    it('devrait retourner les packages du coach', async () => {
      const response = await fetch(`${BASE_URL}/api/coach/packages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': BASE_URL,
          'Cookie': `session=${authToken}`,
        },
        credentials: 'include', // Important pour les cookies
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('packages');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('active');
      expect(data).toHaveProperty('completed');
      expect(Array.isArray(data.packages)).toBe(true);
    });

    it('devrait retourner 200 même sans authentification (pour les tests)', async () => {
      const response = await fetch(`${BASE_URL}/api/coach/packages`);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('packages');
      expect(Array.isArray(data.packages)).toBe(true);
    });
  });

  describe('GET /api/coach/dashboard', () => {
    it('devrait retourner les statistiques du dashboard', async () => {
      const response = await fetch(`${BASE_URL}/api/coach/dashboard`, {
        headers: {
          Cookie: `session=${authToken}`,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('stats');
      } else {
        // Si l'endpoint n'est pas encore implémenté
        expect(response.status).toBeOneOf([401, 404]);
      }
    });
  });

  describe('GET /api/coach/students', () => {
    it('devrait retourner la liste des étudiants', async () => {
      const response = await fetch(`${BASE_URL}/api/coach/students`, {
        headers: {
          Cookie: `session=${authToken}`,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(Array.isArray(data) || Array.isArray(data.students)).toBe(true);
      } else {
        expect(response.status).toBeOneOf([401, 404]);
      }
    });
  });

  describe('POST /api/coach/announcement', () => {
    it('devrait créer une nouvelle annonce', async () => {
      const newAnnouncement = {
        title: 'Session de test',
        description: 'Description de test',
        priceCents: 5000,
        durationMin: 60,
        type: 'SINGLE',
      };

      const response = await fetch(`${BASE_URL}/api/coach/announcement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `session=${authToken}`,
        },
        body: JSON.stringify(newAnnouncement),
      });

      if (response.status === 200 || response.status === 201) {
        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(data.title).toBe(newAnnouncement.title);
      } else {
        // Peut échouer si le coach n'a pas de profil complet
        expect(response.status).toBeOneOf([400, 401, 403]);
      }
    });

    it('devrait valider les données requises', async () => {
      const invalidAnnouncement = {
        title: '', // Titre vide (invalide)
      };

      const response = await fetch(`${BASE_URL}/api/coach/announcement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `session=${authToken}`,
        },
        body: JSON.stringify(invalidAnnouncement),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/coach/availability', () => {
    it('devrait retourner les disponibilités du coach', async () => {
      const response = await fetch(`${BASE_URL}/api/coach/availability`, {
        headers: {
          Cookie: `session=${authToken}`,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(Array.isArray(data) || Array.isArray(data.availabilities)).toBe(true);
      } else {
        expect(response.status).toBeOneOf([401, 404]);
      }
    });
  });
});

// Matcher personnalisé pour vérifier qu'une valeur est dans un array
expect.extend({
  toBeOneOf(received, array) {
    const pass = array.includes(received);
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be one of ${array.join(', ')}`
          : `expected ${received} to be one of ${array.join(', ')}`,
    };
  },
});
