import Stripe from 'stripe';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { calculateCommission, centsToEuros } from '@/lib/stripe/commission';
import { ReservationType } from '@/lib/stripe/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  if (!sig) {
    console.error('Webhook error: Missing stripe-signature header');
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Webhook error: STRIPE_WEBHOOK_SECRET not configured');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification error:', message);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  // Traiter les événements Stripe
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const coachId = session.metadata?.coachId;
        const reservationId = session.metadata?.reservationId;

        console.log(`📋 Checkout session - mode: ${session.mode}, coachId: ${coachId}, reservationId: ${reservationId}`);

        // Cas 1: C'est un abonnement coach
        if (coachId && session.mode === 'subscription') {
          console.log(`✅ Checkout session complétée pour abonnement coach ${coachId}`);
          // L'abonnement sera géré par customer.subscription.created/updated
          break;
        }

        // Cas 2: C'est une réservation
        if (reservationId) {
          const reservationType = (session.metadata?.type || 'SINGLE') as ReservationType;

          console.log(`✅ Checkout session complétée pour la réservation ${reservationId} (${reservationType})`);

          // Récupérer la réservation pour obtenir le montant
          const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
          });

          if (!reservation) {
            console.error(`❌ Réservation ${reservationId} introuvable`);
            return new Response('Reservation not found', { status: 404 });
          }

          // Calculer les commissions selon Phase 1
          const playerAmountEuros = centsToEuros(reservation.priceCents);
          const commission = calculateCommission(playerAmountEuros, reservationType);

          console.log(`💰 Calcul commission:
            - Joueur paie: ${playerAmountEuros}€
            - Commission Edgemy: ${centsToEuros(commission.commission)}€
            - Coach reçoit: ${centsToEuros(commission.coachEarnings)}€
          `);

          // Mettre à jour la réservation avec paiement et commissions
          await prisma.reservation.update({
            where: { id: reservationId },
            data: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
              stripePaymentId: session.payment_intent as string,
              commissionCents: commission.commission,
              coachEarningsCents: commission.coachEarnings,
            },
          });

          console.log(`✅ Réservation ${reservationId} marquée comme PAID et CONFIRMED avec commissions calculées`);

          // TODO: Envoyer notification Discord au coach et au joueur
          // TODO: Créer le canal Discord privé si pas encore créé
        } else {
          console.log(`ℹ️ Checkout session complétée sans reservationId ni coachId`);
        }

        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`✅ Payment intent réussi: ${paymentIntent.id}`);

        // Récupérer la session associée pour obtenir la reservationId
        if (paymentIntent.metadata?.reservationId) {
          const reservationId = paymentIntent.metadata.reservationId;

          await prisma.reservation.update({
            where: { id: reservationId },
            data: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
              stripePaymentId: paymentIntent.id,
            },
          });

          console.log(`✅ Réservation ${reservationId} confirmée via payment_intent.succeeded`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`✅ Facture payée: ${invoice.id}`);

        // Gérer les paiements de factures (utile pour les abonnements futurs)
        // Pour l'instant, on log juste l'événement
        if (invoice.metadata?.reservationId) {
          const reservationId = invoice.metadata.reservationId;

          await prisma.reservation.update({
            where: { id: reservationId },
            data: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
            },
          });

          console.log(`✅ Réservation ${reservationId} payée via facture`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(`❌ Paiement échoué: ${paymentIntent.id}`);
        console.error(`Raison: ${paymentIntent.last_payment_error?.message || 'Inconnue'}`);

        // Marquer la réservation comme échouée
        if (paymentIntent.metadata?.reservationId) {
          const reservationId = paymentIntent.metadata.reservationId;

          await prisma.reservation.update({
            where: { id: reservationId },
            data: {
              paymentStatus: 'FAILED',
              status: 'CANCELLED',
            },
          });

          console.log(`❌ Réservation ${reservationId} annulée suite à l'échec du paiement`);
        }
        break;
      }

      // ========================================
      // ÉVÉNEMENTS D'ABONNEMENT COACH
      // ========================================

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const coachId = subscription.metadata?.coachId;

        if (!coachId) {
          console.log(`ℹ️ Abonnement sans metadata coachId: ${subscription.id}`);
          break;
        }

        const planType = subscription.metadata?.plan as 'MONTHLY' | 'YEARLY' || 'MONTHLY';
        const status = subscription.status;

        // Mapper les statuts Stripe vers nos statuts
        let subscriptionStatus: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | 'TRIALING';
        switch (status) {
          case 'active':
            subscriptionStatus = 'ACTIVE';
            break;
          case 'past_due':
            subscriptionStatus = 'PAST_DUE';
            break;
          case 'canceled':
          case 'unpaid':
            subscriptionStatus = 'CANCELED';
            break;
          case 'incomplete':
          case 'incomplete_expired':
            subscriptionStatus = 'INCOMPLETE';
            break;
          case 'trialing':
            subscriptionStatus = 'TRIALING';
            break;
          default:
            subscriptionStatus = 'ACTIVE';
        }

        const periodEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end;

        await prisma.coach.update({
          where: { id: coachId },
          data: {
            subscriptionId: subscription.id,
            subscriptionStatus,
            subscriptionPlan: planType,
            currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
          },
        });

        console.log(`✅ Abonnement coach mis à jour: ${coachId} - ${subscriptionStatus} (${planType})`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const coachId = subscription.metadata?.coachId;

        if (!coachId) {
          console.log(`ℹ️ Abonnement supprimé sans metadata coachId: ${subscription.id}`);
          break;
        }

        const periodEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end;

        await prisma.coach.update({
          where: { id: coachId },
          data: {
            subscriptionStatus: 'CANCELED',
            currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
          },
        });

        console.log(`✅ Abonnement coach annulé: ${coachId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as Stripe.Invoice & { subscription?: string }).subscription;

        if (subscriptionId && invoice.customer_email) {
          console.error(`❌ Échec paiement facture abonnement: ${subscriptionId}`);
          // TODO: Envoyer email au coach pour mettre à jour son moyen de paiement
        }
        break;
      }

      default:
        console.log(`ℹ️ Événement non géré: ${event.type}`);
    }

    return new Response('ok', { status: 200 });
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    return new Response(
      `Webhook handler error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
}
