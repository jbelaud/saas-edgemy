import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ReservationType } from '@/lib/stripe/types';
import { prisma } from '@/lib/prisma';
import { routing } from '@/i18n/routing';
import { calculateForSession, calculateForPack } from '@/lib/stripe/pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reservationId, coachName, playerEmail, type, coachId, locale: requestedLocale } = body;

    console.log('📥 Requête create-session reçue:', { reservationId, coachName, playerEmail, type, coachId });

    // Validation basique sur les champs request
    if (!reservationId || !playerEmail || !coachId) {
      console.error('❌ Champs manquants:', {
        hasReservationId: !!reservationId,
        hasPlayerEmail: !!playerEmail,
        hasCoachId: !!coachId,
      });
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: {
            reservationId: !reservationId ? 'missing' : 'ok',
            playerEmail: !playerEmail ? 'missing' : 'ok',
            coachId: !coachId ? 'missing' : 'ok',
          }
        },
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
      console.error('❌ Incohérence coach/réservation', { reservationCoachId: reservation.coachId, providedCoachId: coachId });
      return NextResponse.json({ error: 'Reservation does not belong to this coach' }, { status: 400 });
    }

    if (!reservation.priceCents || reservation.priceCents <= 0) {
      console.error('❌ Prix invalide pour la réservation', { reservationId, priceCents: reservation.priceCents });
      return NextResponse.json({ error: 'Invalid reservation price' }, { status: 400 });
    }

    // Récupérer le compte Stripe Connect du coach
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      select: {
        stripeAccountId: true,
        id: true,
        firstName: true,
        lastName: true,
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
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/session/cancel`,
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

    console.log(` Session Stripe créée: ${session.id} pour réservation ${reservationId} (${reservationType})`);
    console.log(
      ` Prix coach: ${(pricingBreakdown.coachNetCents / 100).toFixed(2)}€ | `
      + `Commission Edgemy: ${(pricingBreakdown.edgemyFeeCents / 100).toFixed(2)}€ | `
      + `Frais Stripe estimés: ${(pricingBreakdown.stripeFeeCents / 100).toFixed(2)}€ | `
      + `Prix élève: ${(pricingBreakdown.totalCustomerCents / 100).toFixed(2)}€`,
    );
    if (reservationType === 'PACK') {
      console.log(
        `📦 Pack: ${sessionsCount} sessions prévues | Paiement par session: ${(sessionPayoutCents / 100).toFixed(2)}€`,
      );
    } else {
      console.log('🎯 Session unique: commission et frais calculés via helper pricing.ts');
    }
    console.log(`🔒 NOUVEAU SYSTÈME: Argent GELÉ dans solde Edgemy (pas de transfer immédiat)`);
    console.log(`⏳ Transfer au coach ${coach.stripeAccountId} effectué APRÈS la session`);

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    console.error('❌ Erreur création session Stripe:', err);
    return NextResponse.json(
      { error: 'Failed to create session', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
