import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

async function investigate() {
  try {
    const reservationId = 'cmi28pk1q0001uy38xv7clgzx';

    console.log('🔍 INVESTIGATION DU TRANSFERT MANQUANT\n');
    console.log('=' .repeat(60));

    // 1. Récupérer les détails de la réservation
    console.log('\n1️⃣ DÉTAILS DE LA RÉSERVATION');
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        player: { select: { id: true, name: true, email: true } },
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            stripeAccountId: true,
            user: { select: { name: true, email: true } }
          }
        },
        announcement: { select: { title: true } }
      }
    });

    if (!reservation) {
      console.log('❌ Réservation non trouvée');
      return;
    }

    console.log(`Réservation ID: ${reservation.id}`);
    console.log(`Montant total: ${reservation.priceCents / 100}€`);
    console.log(`Montant net coach: ${reservation.coachNetCents / 100}€`);
    console.log(`Statut: ${reservation.status}`);
    console.log(`Statut paiement: ${reservation.paymentStatus}`);
    console.log(`Statut transfert: ${reservation.transferStatus}`);
    console.log(`Payment Intent Stripe: ${reservation.stripePaymentId}`);

    // 2. Vérifier le compte Stripe Connect du coach
    console.log('\n2️⃣ COMPTE STRIPE CONNECT DU COACH');
    console.log(`Coach: ${reservation.coach.user.name}`);
    console.log(`Email: ${reservation.coach.user.email}`);
    console.log(`Stripe Account ID: ${reservation.coach.stripeAccountId || '❌ NON CONFIGURÉ'}`);

    if (!reservation.coach.stripeAccountId) {
      console.log('\n❌ PROBLÈME IDENTIFIÉ: Le coach n\'a pas de compte Stripe Connect configuré !');
      console.log('   Le transfert ne peut pas être effectué sans compte Stripe Connect.');
      return;
    }

    // Vérifier le statut du compte Stripe Connect
    try {
      const account = await stripe.accounts.retrieve(reservation.coach.stripeAccountId);
      console.log(`\n📊 Statut du compte Stripe Connect:`);
      console.log(`  - Type: ${account.type}`);
      console.log(`  - Charges enabled: ${account.charges_enabled ? '✅' : '❌'}`);
      console.log(`  - Payouts enabled: ${account.payouts_enabled ? '✅' : '❌'}`);
      console.log(`  - Details submitted: ${account.details_submitted ? '✅' : '❌'}`);

      if (!account.payouts_enabled) {
        console.log('\n⚠️  ATTENTION: Les paiements (payouts) ne sont pas activés pour ce compte.');
        console.log('   Le compte doit terminer son onboarding Stripe pour recevoir des transferts.');
      }

      if (account.requirements?.currently_due && account.requirements.currently_due.length > 0) {
        console.log(`\n⚠️  Informations manquantes (${account.requirements.currently_due.length}):`);
        account.requirements.currently_due.forEach(req => console.log(`   - ${req}`));
      }
    } catch (error: any) {
      console.log(`\n❌ Erreur lors de la récupération du compte Stripe: ${error.message}`);
    }

    // 3. Vérifier le PaymentIntent
    console.log('\n3️⃣ VÉRIFICATION DU PAYMENT INTENT STRIPE');
    if (reservation.stripePaymentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(reservation.stripePaymentId);
        console.log(`Status: ${paymentIntent.status}`);
        console.log(`Amount: ${paymentIntent.amount / 100}€`);
        console.log(`Amount received: ${paymentIntent.amount_received / 100}€`);
        console.log(`Captured: ${paymentIntent.amount_capturable === 0 ? '✅' : '❌'}`);
        console.log(`Created: ${new Date(paymentIntent.created * 1000).toLocaleString('fr-FR')}`);

        if (paymentIntent.transfer_data) {
          console.log(`\n💰 Transfer data présent:`);
          console.log(`  - Destination: ${paymentIntent.transfer_data.destination}`);
          console.log(`  - Amount: ${paymentIntent.transfer_data.amount ? paymentIntent.transfer_data.amount / 100 + '€' : 'Full amount'}`);
        } else {
          console.log('\n⚠️  Aucune donnée de transfert associée au PaymentIntent');
          console.log('   Le transfert doit être créé manuellement via l\'API Transfers.');
        }
      } catch (error: any) {
        console.log(`❌ Erreur: ${error.message}`);
      }
    }

    // 4. Chercher les événements webhook récents liés à cette réservation
    console.log('\n4️⃣ ÉVÉNEMENTS WEBHOOK STRIPE RÉCENTS');
    try {
      const events = await stripe.events.list({
        limit: 100,
        created: {
          gte: Math.floor(new Date(reservation.createdAt).getTime() / 1000) - 3600, // 1h avant la création
        },
      });

      const relevantEvents = events.data.filter(event => {
        const data = event.data.object as any;
        return data.id === reservation.stripePaymentId ||
               data.payment_intent === reservation.stripePaymentId;
      });

      console.log(`Événements trouvés: ${relevantEvents.length}`);
      relevantEvents.forEach(event => {
        console.log(`  - ${event.type} (${new Date(event.created * 1000).toLocaleString('fr-FR')})`);
      });

      // Chercher spécifiquement les événements de checkout.session
      const checkoutEvents = events.data.filter(event =>
        event.type.startsWith('checkout.session') &&
        (event.data.object as any).id === reservation.stripeSessionId
      );

      if (checkoutEvents.length > 0) {
        console.log(`\n📋 Événements checkout.session:`);
        checkoutEvents.forEach(event => {
          console.log(`  - ${event.type} (${new Date(event.created * 1000).toLocaleString('fr-FR')})`);
        });
      }
    } catch (error: any) {
      console.log(`❌ Erreur: ${error.message}`);
    }

    // 5. Vérifier si des transferts existent déjà pour cette réservation
    console.log('\n5️⃣ RECHERCHE DE TRANSFERTS EXISTANTS');
    try {
      const transfers = await stripe.transfers.list({
        limit: 100,
        created: {
          gte: Math.floor(new Date(reservation.createdAt).getTime() / 1000),
        },
      });

      const reservationTransfers = transfers.data.filter(t =>
        t.destination === reservation.coach.stripeAccountId
      );

      if (reservationTransfers.length > 0) {
        console.log(`✅ Transferts trouvés: ${reservationTransfers.length}`);
        reservationTransfers.forEach(transfer => {
          console.log(`  - ${transfer.id}: ${transfer.amount / 100}€ (${transfer.destination})`);
        });
      } else {
        console.log('❌ Aucun transfert trouvé vers ce compte coach');
      }
    } catch (error: any) {
      console.log(`❌ Erreur: ${error.message}`);
    }

    // 6. Résumé et recommandations
    console.log('\n' + '='.repeat(60));
    console.log('📋 RÉSUMÉ ET RECOMMANDATIONS\n');

    if (!reservation.coach.stripeAccountId) {
      console.log('❌ Le coach n\'a pas de compte Stripe Connect → Impossible de transférer');
      console.log('   Action: Le coach doit configurer son compte Stripe Connect');
    } else {
      console.log('✅ Le paiement a été reçu (100€)');
      console.log('✅ Le coach a un compte Stripe Connect');
      console.log('⚠️  Le transfert n\'a pas été effectué automatiquement');
      console.log('\n💡 Actions possibles:');
      console.log('   1. Déclencher manuellement le transfert via l\'API Stripe');
      console.log('   2. Vérifier et corriger le webhook handler');
      console.log('   3. Créer un job automatique pour gérer les transferts en attente');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

investigate();
