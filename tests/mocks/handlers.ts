import { http, HttpResponse } from 'msw';

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
