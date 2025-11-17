import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { ReservationType } from '@/lib/stripe/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const ERROR_MESSAGES = {
  missingSessionId: 'Paramètre "session_id" manquant dans la requête.',
  missingStripeKey: 'Configuration Stripe incomplète.',
  sessionNotFound: 'Session Stripe introuvable.',
};

const INTERNAL_ERROR_MESSAGE = 'Impossible de récupérer le récapitulatif du paiement.';

type StripeMetadata = Record<string, string | undefined>;

type SuccessSummaryResponse = {
  reservationId: string;
  coachNetCents: number;
  stripeFeeCents: number;
  edgemyFeeCents: number;
  serviceFeeCents: number;
  totalCustomerCents: number;
  isPackage: boolean;
  sessionsCount: number | null;
  sessionPayoutCents: number | null;
  coachFirstName: string;
  coachLastName: string;
  announcementTitle: string;
  durationMinutes: number | null;
};

function parseMetadataInt(metadata: StripeMetadata, key: string): number | null {
  const raw = metadata[key];
  if (raw === undefined || raw === null || raw === '') {
    return null;
  }

  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : null;
}

function parseBooleanFromMetadata(metadata: StripeMetadata, key: string): boolean | null {
  const raw = metadata[key];
  if (raw === undefined || raw === null || raw === '') {
    return null;
  }

  if (raw === 'true') {
    return true;
  }
  if (raw === 'false') {
    return false;
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: ERROR_MESSAGES.missingStripeKey }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id') ?? searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: ERROR_MESSAGES.missingSessionId }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    const metadata: StripeMetadata = checkoutSession.metadata ?? {};
    const reservationIdFromMetadata = metadata.reservationId;

    if (!reservationIdFromMetadata) {
      return NextResponse.json({ error: ERROR_MESSAGES.sessionNotFound }, { status: 404 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationIdFromMetadata },
      select: {
        id: true,
        type: true,
        coachNetCents: true,
        stripeFeeCents: true,
        edgemyFeeCents: true,
        serviceFeeCents: true,
        sessionsCount: true,
        coach: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        announcement: {
          select: {
            title: true,
            durationMin: true,
          },
        },
      },
    });

    const coachNetCents = parseMetadataInt(metadata, 'coachNetCents') ?? reservation?.coachNetCents ?? 0;
    const stripeFeeCents = parseMetadataInt(metadata, 'stripeFeeCents') ?? reservation?.stripeFeeCents ?? 0;
    const edgemyFeeCents = parseMetadataInt(metadata, 'edgemyFeeCents') ?? reservation?.edgemyFeeCents ?? 0;
    const serviceFeeCents = parseMetadataInt(metadata, 'serviceFeeCents')
      ?? reservation?.serviceFeeCents
      ?? stripeFeeCents + edgemyFeeCents;
    const totalCustomerCents = parseMetadataInt(metadata, 'totalCustomerCents')
      ?? coachNetCents + serviceFeeCents;

    const isPackageMetadata = parseBooleanFromMetadata(metadata, 'isPackage');
    const isPackage = isPackageMetadata ?? reservation?.type === 'PACK';
    const sessionsCount = isPackage
      ? parseMetadataInt(metadata, 'sessionsCount') ?? reservation?.sessionsCount ?? null
      : null;
    const sessionPayoutCents = isPackage
      ? parseMetadataInt(metadata, 'sessionPayoutCents')
      : null;

    const coachFirstName = reservation?.coach?.firstName ?? metadata.coachFirstName ?? '';
    const coachLastName = reservation?.coach?.lastName ?? metadata.coachLastName ?? '';
    const announcementTitle = reservation?.announcement?.title ?? metadata.announcementTitle ?? '';
    const durationMinutes = reservation?.announcement?.durationMin
      ?? parseMetadataInt(metadata, 'durationMinutes');

    const responsePayload: SuccessSummaryResponse = {
      reservationId: reservation?.id ?? reservationIdFromMetadata,
      coachNetCents,
      stripeFeeCents,
      edgemyFeeCents,
      serviceFeeCents,
      totalCustomerCents,
      isPackage: Boolean(isPackage),
      sessionsCount,
      sessionPayoutCents: isPackage ? sessionPayoutCents : null,
      coachFirstName,
      coachLastName,
      announcementTitle,
      durationMinutes: durationMinutes ?? null,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('❌ Erreur session-summary:', error);
    return NextResponse.json({ error: INTERNAL_ERROR_MESSAGE }, { status: 500 });
  }
}
