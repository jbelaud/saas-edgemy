import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { ReservationType } from '@/lib/stripe/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(req: Request) {
  try {
    const { reservationId, coachName, playerEmail, price, type } = await req.json();

    // Validation
    if (!reservationId || !playerEmail || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const reservationType: ReservationType = type || 'SINGLE';

    // Déterminer le nom du produit selon le type
    const productName = reservationType === 'PACK'
      ? `Pack de coaching avec ${coachName}`
      : `Session de coaching avec ${coachName}`;

    // Créer la session Stripe Checkout
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
            unit_amount: Math.round(price * 100), // Conversion en centimes
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/session/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/session/cancel`,
      metadata: {
        reservationId,
        type: reservationType,
      },
    });

    console.log(`✅ Session Stripe créée: ${session.id} pour réservation ${reservationId} (${reservationType})`);

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
