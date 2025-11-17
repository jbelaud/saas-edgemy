import { ReservationType } from './types';

type RoundingMode = 'nearest' | 'up' | 'down';

type PricingConfig = {
  stripePercentFee: number;
  stripeFixedFeeCents: number;
  edgemySessionPercent: number;
  edgemyPackFixedCents: number;
  edgemyPackPercent: number;
  currency: string;
  roundingMode: RoundingMode;
};

const DEFAULT_CONFIG: PricingConfig = {
  stripePercentFee: 1.5,
  stripeFixedFeeCents: 25,
  edgemySessionPercent: 5,
  edgemyPackFixedCents: 300,
  edgemyPackPercent: 2,
  currency: 'eur',
  roundingMode: 'nearest',
};

const ROUNDING_MODES: RoundingMode[] = ['nearest', 'up', 'down'];

function applyRounding(value: number, mode: RoundingMode): number {
  if (mode === 'up') {
    return Math.ceil(value);
  }
  if (mode === 'down') {
    return Math.floor(value);
  }
  return Math.round(value);
}

function parseNumberEnv(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw === '') {
    return fallback;
  }

  const parsed = Number(raw);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  console.warn(`⚠️  Variable d'environnement ${key} invalide (${raw}), utilisation de la valeur par défaut ${fallback}.`);
  return fallback;
}

function parseRoundingModeEnv(key: string, fallback: RoundingMode): RoundingMode {
  const raw = process.env[key];
  if (!raw) {
    return fallback;
  }

  const normalized = raw.toLowerCase() as RoundingMode;
  if (ROUNDING_MODES.includes(normalized)) {
    return normalized;
  }

  console.warn(`⚠️  Rounding mode ${raw} invalide pour ${key}. Valeur par défaut conservée (${fallback}).`);
  return fallback;
}

function getConfig(): PricingConfig {
  return {
    stripePercentFee: parseNumberEnv('STRIPE_PERCENT_FEE', DEFAULT_CONFIG.stripePercentFee),
    stripeFixedFeeCents: parseNumberEnv('STRIPE_FIXED_FEE_CENTS', DEFAULT_CONFIG.stripeFixedFeeCents),
    edgemySessionPercent: parseNumberEnv('EDGEMY_SESSION_PERCENT', DEFAULT_CONFIG.edgemySessionPercent),
    edgemyPackFixedCents: parseNumberEnv('EDGEMY_PACK_FIXED_CENTS', DEFAULT_CONFIG.edgemyPackFixedCents),
    edgemyPackPercent: parseNumberEnv('EDGEMY_PACK_PERCENT', DEFAULT_CONFIG.edgemyPackPercent),
    currency: process.env.DEFAULT_CURRENCY?.toLowerCase() || DEFAULT_CONFIG.currency,
    roundingMode: parseRoundingModeEnv('ROUNDING_MODE', DEFAULT_CONFIG.roundingMode),
  };
}

function computeStripeFee(priceCents: number, config: PricingConfig): number {
  const percentDecimal = config.stripePercentFee / 100;
  const fee = priceCents * percentDecimal + config.stripeFixedFeeCents;
  return applyRounding(fee, config.roundingMode);
}

function computeSessionEdgemyFee(priceCents: number, config: PricingConfig): number {
  const percentDecimal = config.edgemySessionPercent / 100;
  const fee = priceCents * percentDecimal;
  return applyRounding(fee, config.roundingMode);
}

function computePackEdgemyFee(priceCents: number, config: PricingConfig): number {
  const percentDecimal = config.edgemyPackPercent / 100;
  const percentFee = applyRounding(priceCents * percentDecimal, config.roundingMode);
  return config.edgemyPackFixedCents + percentFee;
}

function clampSessionsCount(sessionsCount: number): number {
  if (!Number.isFinite(sessionsCount) || sessionsCount <= 0) {
    throw new Error('sessionsCount doit être un entier strictement positif.');
  }
  if (!Number.isInteger(sessionsCount)) {
    throw new Error('sessionsCount doit être un entier.');
  }
  return sessionsCount;
}

export interface PricingBreakdownBase {
  type: ReservationType;
  coachNetCents: number;
  stripeFeeCents: number;
  edgemyFeeCents: number;
  serviceFeeCents: number;
  totalCustomerCents: number;
  currency: string;
  roundingMode: RoundingMode;
}

export interface SessionPricingBreakdown extends PricingBreakdownBase {
  type: 'SINGLE';
}

export interface PackPricingBreakdown extends PricingBreakdownBase {
  type: 'PACK';
  sessionsCount: number;
  sessionPayoutCents: number;
  sessionPayoutRemainderCents: number;
}

export type PricingBreakdown = SessionPricingBreakdown | PackPricingBreakdown;

function assertPrice(priceCents: number): void {
  if (!Number.isFinite(priceCents) || priceCents <= 0) {
    throw new Error('priceCents doit être un entier strictement positif.');
  }
  if (!Number.isInteger(priceCents)) {
    throw new Error('priceCents doit être un entier (centimes).');
  }
}

export function calculateForSession(priceCents: number): SessionPricingBreakdown {
  assertPrice(priceCents);

  const config = getConfig();
  const coachNetCents = priceCents;

  // Commission TOUT COMPRIS (Stripe + Edgemy) : 5%
  const serviceFeeCents = computeSessionEdgemyFee(priceCents, config);
  const totalCustomerCents = coachNetCents + serviceFeeCents;

  // IMPORTANT: Stripe prélève ses frais sur le MONTANT TOTAL (pas juste le prix coach)
  const actualStripeFee = computeStripeFee(totalCustomerCents, config);
  const edgemyFeeCents = Math.max(0, serviceFeeCents - actualStripeFee);

  return {
    type: 'SINGLE',
    coachNetCents,
    stripeFeeCents: actualStripeFee,
    edgemyFeeCents,
    serviceFeeCents,
    totalCustomerCents,
    currency: config.currency,
    roundingMode: config.roundingMode,
  };
}

export function calculateForPack(priceCents: number, sessionsCount: number): PackPricingBreakdown {
  assertPrice(priceCents);
  const validSessionsCount = clampSessionsCount(sessionsCount);

  const config = getConfig();
  const coachNetCents = priceCents;

  // Commission TOUT COMPRIS (Stripe + Edgemy) : 3€ fixe + 2%
  const serviceFeeCents = computePackEdgemyFee(priceCents, config);
  const totalCustomerCents = coachNetCents + serviceFeeCents;

  // IMPORTANT: Stripe prélève ses frais sur le MONTANT TOTAL (pas juste le prix coach)
  const actualStripeFee = computeStripeFee(totalCustomerCents, config);
  const edgemyFeeCents = Math.max(0, serviceFeeCents - actualStripeFee);

  const sessionPayoutCents = Math.floor(coachNetCents / validSessionsCount);
  const sessionPayoutRemainderCents = coachNetCents - sessionPayoutCents * validSessionsCount;

  return {
    type: 'PACK',
    coachNetCents,
    stripeFeeCents: actualStripeFee,
    edgemyFeeCents,
    serviceFeeCents,
    totalCustomerCents,
    sessionsCount: validSessionsCount,
    sessionPayoutCents,
    sessionPayoutRemainderCents,
    currency: config.currency,
    roundingMode: config.roundingMode,
  };
}

export const pricing = {
  calculateForSession,
  calculateForPack,
};
