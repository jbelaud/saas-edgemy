import { ReservationType } from './types';

type RoundingMode = 'nearest' | 'up' | 'down';

type PricingConfig = {
  stripePercentFee: number;
  stripeFixedFeeCents: number;
  edgemyServiceFeePercent: number; // Taux uniforme pour sessions ET packs
  currency: string;
  roundingMode: RoundingMode;
};

const DEFAULT_CONFIG: PricingConfig = {
  stripePercentFee: 0.015,  // 1.5% en décimal (pas en pourcentage)
  stripeFixedFeeCents: 25,  // 0.25€ = 25 centimes
  edgemyServiceFeePercent: 6.5, // 6.5% uniforme pour tout
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
    // stripePercentFee doit être en décimal (0.015 pour 1.5%), pas en pourcentage
    stripePercentFee: parseNumberEnv('STRIPE_PERCENT_FEE', DEFAULT_CONFIG.stripePercentFee),
    stripeFixedFeeCents: parseNumberEnv('STRIPE_FIXED_FEE_CENTS', DEFAULT_CONFIG.stripeFixedFeeCents),
    // edgemyServiceFeePercent est en pourcentage (6.5 pour 6.5%), pas en décimal
    edgemyServiceFeePercent: parseNumberEnv('EDGEMY_SERVICE_FEE_PERCENT', DEFAULT_CONFIG.edgemyServiceFeePercent),
    currency: process.env.DEFAULT_CURRENCY?.toLowerCase() || DEFAULT_CONFIG.currency,
    roundingMode: parseRoundingModeEnv('ROUNDING_MODE', DEFAULT_CONFIG.roundingMode),
  };
}

function computeStripeFee(priceCents: number, config: PricingConfig): number {
  // stripePercentFee est déjà en décimal (0.015 pour 1.5%)
  const percentFee = priceCents * config.stripePercentFee;
  const fixedFee = config.stripeFixedFeeCents;
  const totalFee = percentFee + fixedFee;
  return applyRounding(totalFee, config.roundingMode);
}

function computeEdgemyServiceFee(priceCents: number, config: PricingConfig): number {
  // edgemyServiceFeePercent est en pourcentage (6.5 pour 6.5%)
  const percentDecimal = config.edgemyServiceFeePercent / 100;
  const fee = priceCents * percentDecimal;
  return applyRounding(fee, config.roundingMode);
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
  // Champs comptables TVA
  edgemyRevenueHT: number;      // Revenu Edgemy HT (= edgemyFeeCents)
  edgemyRevenueTVACents: number; // TVA sur revenu Edgemy (20% en France)
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

  // Commission TOUT COMPRIS (Stripe + Edgemy) : 6.5% uniforme
  const serviceFeeCents = computeEdgemyServiceFee(priceCents, config);
  const totalCustomerCents = coachNetCents + serviceFeeCents;

  // IMPORTANT: Stripe prélève ses frais sur le MONTANT TOTAL (pas juste le prix coach)
  const actualStripeFee = computeStripeFee(totalCustomerCents, config);
  const edgemyFeeCents = Math.max(0, serviceFeeCents - actualStripeFee);

  // Calcul TVA Edgemy (20% en France)
  // edgemyFeeCents est TTC (toutes taxes comprises)
  // Il faut extraire le HT et la TVA selon la formule: HT = TTC / 1.20
  const VAT_RATE_FRANCE = 0.20;
  const edgemyRevenueHT = Math.round(edgemyFeeCents / (1 + VAT_RATE_FRANCE));
  const edgemyRevenueTVACents = edgemyFeeCents - edgemyRevenueHT;

  return {
    type: 'SINGLE',
    coachNetCents,
    stripeFeeCents: actualStripeFee,
    edgemyFeeCents,
    serviceFeeCents,
    totalCustomerCents,
    currency: config.currency,
    roundingMode: config.roundingMode,
    edgemyRevenueHT,
    edgemyRevenueTVACents,
  };
}

export function calculateForPack(priceCents: number, sessionsCount: number): PackPricingBreakdown {
  assertPrice(priceCents);
  const validSessionsCount = clampSessionsCount(sessionsCount);

  const config = getConfig();
  const coachNetCents = priceCents;

  // Commission TOUT COMPRIS (Stripe + Edgemy) : 6.5% uniforme
  const serviceFeeCents = computeEdgemyServiceFee(priceCents, config);
  const totalCustomerCents = coachNetCents + serviceFeeCents;

  // IMPORTANT: Stripe prélève ses frais sur le MONTANT TOTAL (pas juste le prix coach)
  const actualStripeFee = computeStripeFee(totalCustomerCents, config);
  const edgemyFeeCents = Math.max(0, serviceFeeCents - actualStripeFee);

  // Calcul TVA Edgemy (20% en France)
  // edgemyFeeCents est TTC (toutes taxes comprises)
  // Il faut extraire le HT et la TVA selon la formule: HT = TTC / 1.20
  const VAT_RATE_FRANCE = 0.20;
  const edgemyRevenueHT = Math.round(edgemyFeeCents / (1 + VAT_RATE_FRANCE));
  const edgemyRevenueTVACents = edgemyFeeCents - edgemyRevenueHT;

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
    edgemyRevenueHT,
    edgemyRevenueTVACents,
  };
}

export const pricing = {
  calculateForSession,
  calculateForPack,
};
