import { http, HttpResponse } from 'msw';
import type { DefaultBodyType, PathParams } from 'msw';

// Types pour les corps de requête
interface AnnouncementBody {
  title?: string;
  description?: string;
  [key: string]: unknown;
}

interface ReservationBody {
  startDate?: string;
  endDate?: string;
  [key: string]: unknown;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Handlers MSW pour mocker les APIs externes et internes
 */
export const handlers = [
  // Mock Stripe Checkout
  http.post('https://api.stripe.com/v1/checkout/sessions', () => {
    return HttpResponse.json({
      id: 'cs_test_123',
      url: `${BASE_URL}/mock-stripe-checkout`,
      payment_status: 'unpaid',
    });
  }),

  // Mock Stripe Customer
  http.post('https://api.stripe.com/v1/customers', () => {
    return HttpResponse.json({
      id: 'cus_test_123',
      email: 'test@example.com',
    });
  }),

  // Mock Discord OAuth
  http.post('https://discord.com/api/oauth2/token', () => {
    return HttpResponse.json({
      access_token: 'mock_access_token',
      token_type: 'Bearer',
      expires_in: 604800,
      refresh_token: 'mock_refresh_token',
      scope: 'identify email guilds',
    });
  }),

  // Mock Discord User
  http.get('https://discord.com/api/users/@me', () => {
    return HttpResponse.json({
      id: '123456789',
      username: 'testuser',
      discriminator: '0001',
      avatar: 'avatar_hash',
      email: 'test@example.com',
    });
  }),

  // Mock API Coach - Packages
  http.get(`${BASE_URL}/api/coach/packages`, async () => {
    // Accepter toutes les requêtes sans vérification d'authentification pour les tests
    console.log('Mock /api/coach/packages called');
    
    // Données de test pour les packages
    return HttpResponse.json({
      packages: [
        {
          id: 'pkg_123',
          name: 'Pack Découverte',
          description: '3 heures de coaching',
          duration: 180,
          price: 15000, // en centimes
          status: 'active',
          sessions: 3,
          sessionsCompleted: 0,
          sessionsRemaining: 3,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ],
      total: 1,
      active: 1,
      completed: 0,
    });
  }),

  // Mock API Coach - Dashboard
  http.get(`${BASE_URL}/api/coach/dashboard`, ({ request }) => {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }
    
    return HttpResponse.json({
      stats: {
        totalSessions: 0,
        upcomingSessions: 0,
        completedSessions: 0,
        totalRevenue: 0,
      },
      recentSessions: [],
    });
  }),

  // Mock API Coach - Create Announcement
  http.post(`${BASE_URL}/api/coach/announcement`, async ({ request }) => {
    console.log('Mock /api/coach/announcement called');
    
    // Accepter toutes les requêtes sans vérification d'authentification pour les tests
    
    try {
      const body = (await request.json()) as Partial<AnnouncementBody>;
      
      // Validation basique - vérifier si le corps de la requête est vide
      if (!body || Object.keys(body).length === 0) {
        return new HttpResponse(
          JSON.stringify({ error: 'Request body is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Validation des champs requis
      if (!body.title || !body.description) {
        return new HttpResponse(
          JSON.stringify({ 
            error: 'Validation failed',
            details: [
              !body.title ? { field: 'title', message: 'Title is required' } : null,
              !body.description ? { field: 'description', message: 'Description is required' } : null
            ].filter(Boolean)
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Simuler une réponse réussie
      return HttpResponse.json({
        id: 'ann_123',
        title: body.title,
        description: body.description,
        status: 'draft',
        coachId: 'coach_123',
        price: body.price || null,
        duration: body.duration || 60,
        location: body.location || 'en_ligne',
        ...(body as Record<string, unknown>),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { status: 201 });
      
    } catch (error) {
      return new HttpResponse(
        JSON.stringify({ 
          error: 'Invalid request',
          message: 'The request could not be processed'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }),

  // Mock API Coach - Availability
  http.get(`${BASE_URL}/api/coach/availability`, ({ request }) => {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }
    
    return HttpResponse.json({
      availability: [],
      timeZone: 'Europe/Paris',
    });
  }),

  // Mock API Reservations - Create
  http.post(`${BASE_URL}/api/reservations`, async ({ request }) => {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return new HttpResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    try {
      const body = (await request.json()) as Partial<ReservationBody>;
      
      // Validation basique
      if (!body.startDate || !body.endDate) {
        return new HttpResponse(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Vérification que la date de début est dans le futur
      const startDate = new Date(String(body.startDate));
      if (isNaN(startDate.getTime()) || startDate < new Date()) {
        return new HttpResponse(
          JSON.stringify({ error: 'Start date must be in the future' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Vérification que endDate est après startDate
      const endDate = new Date(String(body.endDate));
      if (isNaN(endDate.getTime()) || endDate <= startDate) {
        return new HttpResponse(
          JSON.stringify({ error: 'End date must be after start date' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      const responseData = {
        id: 'res_123',
        startDate: body.startDate,
        endDate: body.endDate,
        ...(body as Record<string, unknown>),
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return HttpResponse.json(responseData);
    } catch (error) {
      return new HttpResponse(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }),

  // Mock API User - Get Profile
  http.get(`${BASE_URL}/api/user/profile`, ({ request }) => {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return new HttpResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return HttpResponse.json({
      id: 'user_123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'player',
      discordId: 'discord_123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  // Mock API Player - Get Reservations
  http.get(`${BASE_URL}/api/player/reservations`, ({ request }) => {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return new HttpResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return HttpResponse.json({
      reservations: [],
      total: 0,
    });
  }),

  // Mock Discord Guild Member
  http.get('https://discord.com/api/users/@me/guilds/:guildId/member', () => {
    return HttpResponse.json({
      user: {
        id: '123456789',
        username: 'testuser',
      },
      roles: [],
      joined_at: new Date().toISOString(),
    });
  }),

  // Mock création de salon Discord
  http.post('https://discord.com/api/guilds/:guildId/channels', () => {
    return HttpResponse.json({
      id: 'channel_test_123',
      name: 'test-channel',
      type: 0,
    });
  }),

  // Mock APIs internes
  http.get(`${BASE_URL}/api/coach/packages`, () => {
    return HttpResponse.json({
      packages: [],
      total: 0,
      active: 0,
      completed: 0,
    });
  }),

  http.get(`${BASE_URL}/api/coach/students`, () => {
    return HttpResponse.json({
      students: [],
    });
  }),

  http.get(`${BASE_URL}/api/player/reservations`, () => {
    return HttpResponse.json({
      reservations: [],
    });
  }),

  // Mock vérification membre Discord
  http.get(`${BASE_URL}/api/discord/check-member`, () => {
    return HttpResponse.json({
      isMember: true,
    });
  }),
];
