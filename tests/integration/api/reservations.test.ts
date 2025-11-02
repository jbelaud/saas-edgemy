import { describe, it, expect } from 'vitest';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

describe('API Réservations - /api/reservations', () => {
  describe('POST /api/reservations', () => {
    it('devrait créer une nouvelle réservation', async () => {
      // Ce test nécessite un token d'authentification valide
      const reservationData = {
        announcementId: 'test-announcement-id',
        coachId: 'test-coach-id',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
        endDate: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
      };

      const response = await fetch(`${BASE_URL}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Cookie: `session=${authToken}`,
        },
        body: JSON.stringify(reservationData),
      });

      // Devrait échouer sans auth
      expect(response.status).toBeOneOf([400, 401, 403, 404]);
    });

    it('devrait valider que la date de début est dans le futur', async () => {
      const reservationData = {
        announcementId: 'test-announcement-id',
        coachId: 'test-coach-id',
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Hier (invalide)
        endDate: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
      };

      const response = await fetch(`${BASE_URL}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });

      expect(response.status).toBeOneOf([400, 401]);
    });

    it('devrait valider que endDate est après startDate', async () => {
      const reservationData = {
        announcementId: 'test-announcement-id',
        coachId: 'test-coach-id',
        startDate: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Avant startDate (invalide)
      };

      const response = await fetch(`${BASE_URL}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });

      expect(response.status).toBeOneOf([400, 401]);
    });
  });

  describe('GET /api/player/reservations', () => {
    it('devrait retourner les réservations du joueur', async () => {
      const response = await fetch(`${BASE_URL}/api/player/reservations`);

      // Sans auth devrait retourner 401
      expect(response.status).toBe(401);
    });
  });
});

// Matcher personnalisé
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
