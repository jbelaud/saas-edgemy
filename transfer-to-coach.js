const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');
require('dotenv').config();

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

async function transferToCoach() {
  const reservationId = 'cmihvetbw0001uygsjz8rctu5';

  try {
    console.log('💰 Transfert des fonds au coach...\n');

    // Récupérer la réservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            stripeAccountId: true,
          }
        },
        player: {
          select: {
            name: true,
            email: true,
          }
        },
        announcement: {
          select: {
            title: true,
          }
        },
      },
    });

    if (!reservation) {
      console.error('❌ Réservation non trouvée');
      return;
    }

    console.log('📋 Détails de la réservation:');
    console.log('  ID:', reservation.id);
    console.log('  Status:', reservation.status);
    console.log('  Payment Status:', reservation.paymentStatus);
    console.log('  Session:', reservation.announcement.title);
    console.log('  Coach:', `${reservation.coach.firstName} ${reservation.coach.lastName}`);
    console.log('  Joueur:', reservation.player.name);
    console.log('');

    console.log('💵 Montants:');
    console.log('  Prix:', (reservation.priceCents / 100).toFixed(2), '€');
    console.log('  Coach Net:', (reservation.coachNetCents / 100).toFixed(2), '€');
    console.log('  Edgemy Fee:', (reservation.edgemyFeeCents / 100).toFixed(2), '€');
    console.log('  Stripe Fee:', (reservation.stripeFeeCents / 100).toFixed(2), '€');
    console.log('');

    console.log('🔧 État technique:');
    console.log('  Stripe Payment ID:', reservation.stripePaymentId);
    console.log('  Coach Stripe Account:', reservation.coach.stripeAccountId);
    console.log('  Transfer Status:', reservation.transferStatus);
    console.log('');

    // Vérifications
    if (reservation.transferStatus === 'COMPLETED') {
      console.log('✅ Le transfert a déjà été effectué');
      console.log('  Transfer ID:', reservation.stripeTransferId);
      console.log('  Transféré le:', reservation.transferredAt?.toISOString());
      return;
    }

    if (reservation.paymentStatus !== 'PAID') {
      console.error('❌ La réservation n\'est pas payée (status:', reservation.paymentStatus + ')');
      return;
    }

    if (!reservation.stripePaymentId) {
      console.error('❌ Pas de PaymentIntent associé à cette réservation');
      return;
    }

    if (!reservation.coach.stripeAccountId) {
      console.error('❌ Le coach n\'a pas de compte Stripe Connect configuré');
      return;
    }

    if (reservation.coach.stripeAccountId.startsWith('acct_mock_')) {
      console.error('❌ Le coach a un compte mock. Exécutez d\'abord fix-coach-stripe-account.js');
      return;
    }

    // Vérifier le PaymentIntent et récupérer le Charge
    console.log('🔍 Vérification du PaymentIntent...');
    const paymentIntent = await stripe.paymentIntents.retrieve(reservation.stripePaymentId, {
      expand: ['latest_charge']
    });
    console.log('  Status:', paymentIntent.status);
    console.log('  Amount:', (paymentIntent.amount / 100).toFixed(2), '€');
    console.log('');

    if (paymentIntent.status !== 'succeeded') {
      console.error('❌ Le paiement n\'a pas réussi (status:', paymentIntent.status + ')');
      return;
    }

    // Récupérer l'ID du charge
    let chargeId = null;
    if (typeof paymentIntent.latest_charge === 'string') {
      chargeId = paymentIntent.latest_charge;
    } else if (paymentIntent.latest_charge && typeof paymentIntent.latest_charge === 'object') {
      chargeId = paymentIntent.latest_charge.id;
    }

    if (!chargeId) {
      console.error('❌ Impossible de trouver le Charge associé au PaymentIntent');
      console.log('   PaymentIntent charges:', paymentIntent.charges?.data?.map(c => c.id));
      return;
    }

    console.log('✅ Charge ID trouvé:', chargeId);
    console.log('');

    // Vérifier le compte du coach
    console.log('🔍 Vérification du compte Stripe du coach...');
    const account = await stripe.accounts.retrieve(reservation.coach.stripeAccountId);
    console.log('  Charges enabled:', account.charges_enabled ? '✅' : '❌');
    console.log('  Payouts enabled:', account.payouts_enabled ? '✅' : '❌');
    console.log('');

    if (!account.charges_enabled || !account.payouts_enabled) {
      console.error('⚠️ Le compte du coach n\'est pas complètement configuré');
      console.error('   Le transfert peut échouer ou être bloqué');
      console.error('   Voulez-vous continuer quand même ? (Modifiez le script si oui)');
      return;
    }

    // Créer le transfert
    console.log(`💸 Création du transfert de ${(reservation.coachNetCents / 100).toFixed(2)}€...`);

    const transfer = await stripe.transfers.create({
      amount: reservation.coachNetCents,
      currency: 'eur',
      destination: reservation.coach.stripeAccountId,
      source_transaction: chargeId, // Utiliser le Charge ID, pas le PaymentIntent
      description: `Paiement session ${reservation.announcement.title} - ${reservation.id}`,
      metadata: {
        reservationId: reservation.id,
        coachId: reservation.coach.id,
        sessionTitle: reservation.announcement.title,
        paymentIntentId: reservation.stripePaymentId,
        chargeId: chargeId,
      },
    });

    console.log('✅ Transfert créé avec succès !');
    console.log('  Transfer ID:', transfer.id);
    console.log('  Amount:', (transfer.amount / 100).toFixed(2), '€');
    console.log('  Destination:', transfer.destination);
    console.log('  Created:', new Date(transfer.created * 1000).toISOString());
    console.log('');

    // Mettre à jour la réservation
    console.log('🔄 Mise à jour de la réservation...');
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        stripeTransferId: transfer.id,
        transferStatus: 'TRANSFERRED',
        transferredAt: new Date(),
      },
    });

    console.log('✅ Réservation mise à jour !');
    console.log('');
    console.log('🎉 TRANSFERT TERMINÉ AVEC SUCCÈS !');
    console.log('');
    console.log('📊 Résumé:');
    console.log('  Réservation:', reservation.id);
    console.log('  Montant transféré:', (transfer.amount / 100).toFixed(2), '€');
    console.log('  Coach:', `${reservation.coach.firstName} ${reservation.coach.lastName}`);
    console.log('  Stripe Transfer ID:', transfer.id);
    console.log('');
    console.log('🎯 Le coach peut maintenant voir ces fonds dans son dashboard Stripe');

  } catch (error) {
    console.error('\n❌ Erreur lors du transfert:');
    console.error('  Message:', error.message);

    if (error.type === 'StripeInvalidRequestError') {
      console.error('\n⚠️ Erreur Stripe - Détails:');
      console.error('  ', error.message);
      if (error.raw?.param) {
        console.error('  Paramètre:', error.raw.param);
      }
    } else if (error.type === 'StripePermissionError') {
      console.error('\n⚠️ Permissions insuffisantes pour effectuer le transfert');
    }

    console.error('\n🔧 Vérifications suggérées:');
    console.error('  1. Le compte Stripe du coach est-il complet ?');
    console.error('  2. Le PaymentIntent existe-t-il ?');
    console.error('  3. Les clés API Stripe sont-elles correctes ?');
  } finally {
    await prisma.$disconnect();
  }
}

transferToCoach().catch(console.error);
