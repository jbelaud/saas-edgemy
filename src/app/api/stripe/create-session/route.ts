import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ReservationType } from '@/lib/stripe/types';
import { prisma } from '@/lib/prisma';
import { routing } from '@/i18n/routing';
import { calculateForSession, calculateForPack } from '@/lib/stripe/pricing';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { applyRateLimit } from '@/lib/rate-limit';
import { stripeLogger as logger } from '@/lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(req: Request) {
  try {
    // Rate limiting: 20 req/min par utilisateur
    const rateLimitResponse = await applyRateLimit(req, 'sensitive');
    if (rateLimitResponse) return rateLimitResponse;

    // Vérifier l'authentification
    const authSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!authSession?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    const { reservationId, coachName, playerEmail, type, coachId, locale: requestedLocale } = body;

    logger.debug('Requête create-session reçue:', { reservationId, type, coachId });

    // Validation basique sur les champs request
    if (!reservationId || !playerEmail || !coachId) {
      logger.warn('Champs manquants dans create-session');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const reservationType: ReservationType = type || 'SINGLE';
    const locale = routing.locales.includes(requestedLocale) ? requestedLocale : routing.defaultLocale;

    // Récupérer la réservation pour fiabiliser les montants et le lien joueur/coach
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: {
        id: true,
        type: true,
        priceCents: true,
        coachId: true,
        playerId: true,
        packId: true,
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (reservation.coachId !== coachId) {
      logger.warn('Incohérence coach/réservation');
      return NextResponse.json({ error: 'Reservation does not belong to this coach' }, { status: 400 });
    }

    // Vérifier que l'utilisateur connecté est bien le joueur de la réservation
    if (reservation.playerId !== authSession.user.id) {
      logger.warn('Tentative d\'accès non autorisé à une réservation');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Vérification du prix - Les réservations gratuites ne devraient pas arriver ici
    if (!reservation.priceCents || reservation.priceCents <= 0) {
      logger.warn('Tentative de checkout pour réservation gratuite');
      return NextResponse.json({ error: 'Free reservations should not go through Stripe checkout' }, { status: 400 });
    }

    // Récupérer le compte Stripe Connect du coach
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      select: {
        stripeAccountId: true,
        id: true,
        firstName: true,
        lastName: true,
        slug: true,
      },
    });

    if (!coach) {
      return NextResponse.json(
        { error: 'Coach not found' },
        { status: 404 }
      );
    }

    // Vérifier que le coach a un compte Stripe Connect valide (pas un compte mock)
    if (!coach.stripeAccountId || coach.stripeAccountId.startsWith('acct_mock_')) {
      return NextResponse.json(
        { error: 'Coach Stripe Connect account not configured' },
        { status: 400 }
      );
    }

    // Utiliser coachName du paramètre ou construire à partir des données du coach
    const finalCoachName = coachName || `${coach.firstName} ${coach.lastName}`;

    // Déterminer le nom du produit selon le type
    const productName = reservationType === 'PACK'
      ? `Pack de coaching avec ${finalCoachName}`
      : `Session de coaching avec ${finalCoachName}`;

    // Calcul pricing centralisé
    const isPackage = reservation.type === 'PACK';
    let sessionsCount: number | null = null;
    let sessionPayoutCents = 0;
    const coachPriceCents = reservation.priceCents;

    const pricingBreakdown = await (async () => {
      if (!isPackage) {
        const breakdown = calculateForSession(coachPriceCents);
        sessionPayoutCents = breakdown.coachNetCents;
        return breakdown;
      }

      if (!reservation.packId) {
        throw new Error('Pack reservation missing packId');
      }

      const announcementPack = await prisma.announcementPack.findUnique({
        where: { id: reservation.packId },
        select: { hours: true },
      });

      if (!announcementPack || !announcementPack.hours || announcementPack.hours <= 0) {
        throw new Error('Invalid pack configuration (missing hours)');
      }

      sessionsCount = announcementPack.hours;
      const breakdown = calculateForPack(coachPriceCents, sessionsCount);
      sessionPayoutCents = breakdown.sessionPayoutCents;
      return breakdown;
    })();

    const sessionsCountValue = sessionsCount ?? 0;
    const metadataBase = {
      reservationId,
      coachId: coach.id,
      userId: reservation.playerId,
      type: reservation.type,
      coachStripeAccountId: coach.stripeAccountId,
      coachNetCents: pricingBreakdown.coachNetCents.toString(),
      stripeFeeCents: pricingBreakdown.stripeFeeCents.toString(),
      edgemyFeeCents: pricingBreakdown.edgemyFeeCents.toString(),
      serviceFeeCents: pricingBreakdown.serviceFeeCents.toString(),
      totalCustomerCents: pricingBreakdown.totalCustomerCents.toString(),
      isPackage: String(isPackage),
      sessionsCount: sessionsCountValue.toString(),
      sessionPayoutCents: sessionPayoutCents.toString(),
      currency: pricingBreakdown.currency,
      locale,
      packId: reservation.packId ?? '',
    } satisfies Record<string, string>;

    // Créer la session Stripe Checkout SANS transfer immédiat (argent gelé)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'], // Ajout de Stripe Link
      mode: 'payment',
      customer_email: playerEmail,
      line_items: [
        {
          price_data: {
            currency: pricingBreakdown.currency,
            product_data: {
              name: productName,
              description: reservationType === 'PACK'
                ? 'Pack d\'heures de coaching personnalisé'
                : 'Session individuelle de coaching',
            },
            unit_amount: pricingBreakdown.totalCustomerCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        transfer_group: `reservation_${reservationId}`,
        // ❌ Ne PAS utiliser application_fee_amount ici
        // La commission sera retenue lors du transfer manuel (POST /reservations/[id]/complete)
        metadata: {
          ...metadataBase,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/session/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/session/cancel?reservationId=${reservationId}${coach.slug ? `&coachSlug=${coach.slug}` : ''}`,
      metadata: {
        ...metadataBase,
      },
    });

    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        coachEarningsCents: pricingBreakdown.coachNetCents,
        coachNetCents: pricingBreakdown.coachNetCents,
        stripeFeeCents: pricingBreakdown.stripeFeeCents,
        edgemyFeeCents: pricingBreakdown.edgemyFeeCents,
        serviceFeeCents: pricingBreakdown.serviceFeeCents,
        commissionCents: pricingBreakdown.edgemyFeeCents,
        isPackage,
        sessionsCount: isPackage ? sessionsCountValue : null,
      } as Prisma.ReservationUncheckedUpdateInput,
    });

    logger.debug(`Session Stripe créée: ${session.id} pour réservation ${reservationId}`);

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    logger.error('Erreur création session Stripe:', err);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
