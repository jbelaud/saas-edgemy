import { describe, expect, it, beforeEach, afterEach } from 'vitest';

// Important: importer après configuration des env pour chaque test
import { calculateForSession, calculateForPack } from '@/lib/stripe/pricing';

declare const process: NodeJS.Process;

type EnvKey =
  | 'STRIPE_PERCENT_FEE'
  | 'STRIPE_FIXED_FEE_CENTS'
  | 'EDGEMY_SESSION_PERCENT'
  | 'EDGEMY_PACK_FIXED_CENTS'
  | 'EDGEMY_PACK_PERCENT'
  | 'DEFAULT_CURRENCY'
  | 'ROUNDING_MODE';

type EnvSnapshot = Partial<Record<EnvKey, string | undefined>>;

function snapshotEnv(keys: EnvKey[]): EnvSnapshot {
  return keys.reduce<EnvSnapshot>((acc, key) => {
    acc[key] = process.env[key];
    return acc;
  }, {});
}

function restoreEnv(snapshot: EnvSnapshot) {
  Object.entries(snapshot).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key as EnvKey];
    } else {
      process.env[key as EnvKey] = value;
    }
  });
}

describe('pricing helper', () => {
  const envKeys: EnvKey[] = [
    'STRIPE_PERCENT_FEE',
    'STRIPE_FIXED_FEE_CENTS',
    'EDGEMY_SESSION_PERCENT',
    'EDGEMY_PACK_FIXED_CENTS',
    'EDGEMY_PACK_PERCENT',
    'DEFAULT_CURRENCY',
    'ROUNDING_MODE',
  ];
  let envSnapshot: EnvSnapshot;

  beforeEach(() => {
    envSnapshot = snapshotEnv(envKeys);
    delete process.env.ROUNDING_MODE;
    process.env.STRIPE_PERCENT_FEE = '1.5';
    process.env.STRIPE_FIXED_FEE_CENTS = '25';
    process.env.EDGEMY_SESSION_PERCENT = '5';
    process.env.EDGEMY_PACK_FIXED_CENTS = '300';
    process.env.EDGEMY_PACK_PERCENT = '2';
    process.env.DEFAULT_CURRENCY = 'EUR';
  });

  afterEach(() => {
    restoreEnv(envSnapshot);
  });

  describe('calculateForSession', () => {
    it('calcule la ventilation pour une session de 100€', () => {
      const priceCents = 10000;
      const breakdown = calculateForSession(priceCents);

      expect(breakdown).toEqual({
        type: 'SINGLE',
        coachNetCents: 10000,
        stripeFeeCents: 175,
        edgemyFeeCents: 500,
        serviceFeeCents: 675,
        totalCustomerCents: 10675,
        currency: 'eur',
        roundingMode: 'nearest',
      });
    });

    it('honore le mode d\'arrondi', () => {
      process.env.ROUNDING_MODE = 'up';
      process.env.STRIPE_PERCENT_FEE = '1.9';
      process.env.STRIPE_FIXED_FEE_CENTS = '31';
      const priceCents = 12345;

      const breakdown = calculateForSession(priceCents);

      // Stripe fee = 12345 * 0.019 = 234.555 -> ceil = 235 + 31 = 266 -> ceil => 266
      // Edgemy fee = 12345 * 0.05 = 617.25 -> ceil => 618
      expect(breakdown.stripeFeeCents).toBe(266);
      expect(breakdown.edgemyFeeCents).toBe(618);
      expect(breakdown.serviceFeeCents).toBe(884);
      expect(breakdown.totalCustomerCents).toBe(13229);
      expect(breakdown.roundingMode).toBe('up');
    });

    it('lève une erreur si le prix est invalide', () => {
      expect(() => calculateForSession(0)).toThrowError('priceCents doit être un entier strictement positif.');
      expect(() => calculateForSession(100.5)).toThrowError('priceCents doit être un entier (centimes).');
    });
  });

  describe('calculateForPack', () => {
    it('calcule la ventilation pour un pack 500€ / 5 sessions', () => {
      const breakdown = calculateForPack(50000, 5);
      expect(breakdown.type).toBe('PACK');
      expect(breakdown.coachNetCents).toBe(50000);
      // Stripe fee = 50000 * 1.5% = 750 + 25 = 775
      expect(breakdown.stripeFeeCents).toBe(775);
      // Edgemy = 300 + (50000 * 0.02 = 1000) = 1300
      expect(breakdown.edgemyFeeCents).toBe(1300);
      expect(breakdown.serviceFeeCents).toBe(2075);
      expect(breakdown.totalCustomerCents).toBe(52075);
      expect(breakdown.sessionsCount).toBe(5);
      expect(breakdown.sessionPayoutCents).toBe(10000);
      expect(breakdown.sessionPayoutRemainderCents).toBe(0);
    });

    it('distribue les arrondis lorsque le montant n\'est pas divisible', () => {
      const breakdown = calculateForPack(10001, 3);
      expect(breakdown.sessionPayoutCents).toBe(3333);
      expect(breakdown.sessionPayoutRemainderCents).toBe(10001 - 3333 * 3);
    });

    it('rejette un nombre de sessions invalide', () => {
      expect(() => calculateForPack(10000, 0)).toThrowError('sessionsCount doit être un entier strictement positif.');
      expect(() => calculateForPack(10000, 2.5)).toThrowError('sessionsCount doit être un entier.');
    });
  });
});
