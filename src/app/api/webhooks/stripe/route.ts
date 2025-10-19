import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * Webhook Stripe pour gérer les événements d'abonnement et de paiement
 * 
 * TODO: Configuration Stripe requise
 * 
 * 1. Installer Stripe: pnpm add stripe
 * 2. Ajouter les variables d'environnement:
 *    - STRIPE_SECRET_KEY=sk_test_xxx
 *    - STRIPE_WEBHOOK_SECRET=whsec_xxx
 * 3. Configurer les webhooks dans Stripe Dashboard:
 *    - URL: https://app.edgemy.fr/api/webhooks/stripe
 *    - Events: checkout.session.completed, invoice.payment_failed, 
 *              customer.subscription.deleted, account.updated
 */

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Signature manquante' },
        { status: 400 }
      );
    }

    // TODO: Vérifier la signature Stripe
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const event = stripe.webhooks.constructEvent(
    //   body,
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET!
    // )

    // Pour le MVP, on parse directement le JSON
    const event = JSON.parse(body);

    console.log('Stripe webhook reçu:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        // Abonnement activé
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription;

        if (userId && subscriptionId) {
          await prisma.coach.update({
            where: { userId },
            data: {
              subscriptionId,
              status: 'ACTIVE',
            },
          });
          console.log(`Abonnement activé pour coach ${userId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        // Paiement échoué
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          await prisma.coach.updateMany({
            where: { subscriptionId },
            data: { status: 'INACTIVE' },
          });
          console.log(`Coach désactivé suite à échec paiement: ${subscriptionId}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        // Abonnement annulé
        const subscription = event.data.object;
        const subscriptionId = subscription.id;

        await prisma.coach.updateMany({
          where: { subscriptionId },
          data: {
            status: 'INACTIVE',
            subscriptionId: null,
          },
        });
        console.log(`Abonnement annulé: ${subscriptionId}`);
        break;
      }

      case 'account.updated': {
        // Compte Stripe Connect mis à jour
        const account = event.data.object;
        const stripeAccountId = account.id;

        // Vérifier si le compte est complètement configuré
        const isComplete = account.charges_enabled && account.payouts_enabled;

        if (isComplete) {
          // Le compte Stripe Connect est configuré, pas besoin de modifier le statut
          console.log(`Compte Stripe Connect configuré: ${stripeAccountId}`);
        }
        break;
      }

      default:
        console.log(`Event non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erreur webhook Stripe:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
