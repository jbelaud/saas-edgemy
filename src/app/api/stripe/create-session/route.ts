import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { ReservationType } from '@/lib/stripe/types';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(req: Request) {
  try {
    const { reservationId, coachName, playerEmail, price, type, coachId } = await req.json();

    // Validation
    if (!reservationId || !playerEmail || !price || !coachId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const reservationType: ReservationType = type || 'SINGLE';

    // Récupérer le compte Stripe Connect du coach
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      select: { stripeAccountId: true, id: true },
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

    // Déterminer le nom du produit selon le type
    const productName = reservationType === 'PACK'
      ? `Pack de coaching avec ${coachName}`
      : `Session de coaching avec ${coachName}`;

    // Calculer les frais de plateforme selon le type
    // Le prix reçu est le prix du COACH (ce qu'il doit toucher)
    // On calcule le prix ÉLÈVE en ajoutant la commission Edgemy

    let playerPrice: number; // Prix payé par l'élève
    let platformFee: number; // Commission Edgemy

    if (reservationType === 'PACK') {
      // Pour les packs : 3€ + 2% du prix coach (configurable via env)
      const fixedFee = parseFloat(process.env.STRIPE_PACK_FIXED_FEE || '3.00');
      const percentFee = price * parseFloat(process.env.STRIPE_PACK_PERCENT_FEE || '0.02');
      platformFee = fixedFee + percentFee;
      playerPrice = price + platformFee;
    } else {
      // Pour les sessions uniques : 5% du prix coach (configurable via env)
      const singleSessionFeePercent = parseFloat(process.env.STRIPE_SINGLE_SESSION_FEE_PERCENT || '0.05');
      platformFee = price * singleSessionFeePercent;
      playerPrice = price + platformFee;
    }

    // Convertir en centimes pour Stripe
    const coachAmount = Math.round(price * 100); // Ce que touche le coach
    const totalAmount = Math.round(playerPrice * 100); // Ce que paie l'élève
    const applicationFeeAmount = Math.round(platformFee * 100); // Commission Edgemy

    // Créer la session Stripe Checkout avec transfer vers le compte Connect du coach
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: playerEmail,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: productName,
              description: reservationType === 'PACK'
                ? 'Pack d\'heures de coaching personnalisé'
                : 'Session individuelle de coaching',
            },
            unit_amount: totalAmount, // Prix total en centimes
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount, // Commission plateforme
        transfer_data: {
          destination: coach.stripeAccountId, // Le reste va au coach
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/session/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/session/cancel`,
      metadata: {
        reservationId,
        type: reservationType,
        coachId: coach.id,
      },
    });

    console.log(`✅ Session Stripe créée: ${session.id} pour réservation ${reservationId} (${reservationType})`);
    console.log(`💰 Prix coach: ${price.toFixed(2)}€ | Commission Edgemy: ${platformFee.toFixed(2)}€ | Prix élève: ${playerPrice.toFixed(2)}€`);
    if (reservationType === 'PACK') {
      console.log(`📦 Commission pack: 3€ fixe + 2% (${(price * 0.02).toFixed(2)}€) = ${platformFee.toFixed(2)}€`);
    } else {
      console.log(`🎯 Commission session unique: 5% du prix coach`);
    }
    console.log(`🔗 Paiement routé vers compte Stripe Connect: ${coach.stripeAccountId}`);

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
