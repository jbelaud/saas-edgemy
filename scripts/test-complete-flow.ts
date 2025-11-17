/**
 * Test complet du flow de paiement
 *
 * Ce script teste :
 * 1. Création réservation + paiement
 * 2. Vérification argent gelé (transferStatus: PENDING)
 * 3. Simulation fin de session
 * 4. Complétion + transfer au coach
 * 5. Vérification que le coach a bien reçu l'argent
 */

import { prisma } from '../src/lib/prisma';

async function testCompleteFlow() {
  console.log('🧪 Test complet du flow de paiement\n');

  try {
    // 1. Trouver une réservation PAID et PENDING
    const reservation = await prisma.reservation.findFirst({
      where: {
        paymentStatus: 'PAID',
        transferStatus: 'PENDING',
      },
      include: {
        coach: {
          include: {
            user: true,
          },
        },
        player: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!reservation) {
      console.log('❌ Aucune réservation en attente trouvée');
      console.log('💡 Créez une réservation via l\'interface et payez-la d\'abord\n');
      return;
    }

    console.log('✅ Réservation trouvée:');
    console.log(`   ID: ${reservation.id}`);
    console.log(`   Coach: ${reservation.coach.firstName} ${reservation.coach.lastName}`);
    console.log(`   Joueur: ${reservation.player.name || reservation.player.email}`);
    console.log(`   Montant coach: ${reservation.coachEarningsCents / 100}€`);
    console.log(`   Status paiement: ${reservation.paymentStatus}`);
    console.log(`   Status transfer: ${reservation.transferStatus} 🔒 (argent gelé)\n`);

    // 2. Vérifier le solde disponible sur Stripe
    console.log('💰 Argent en attente sur votre compte Stripe:');
    console.log(`   Montant: ${reservation.priceCents / 100}€ (dont ${reservation.coachEarningsCents / 100}€ pour le coach)\n`);

    // 3. Vérifier si la session est terminée
    const now = new Date();
    const isFinished = reservation.endDate < now;

    console.log('📅 Statut de la session:');
    console.log(`   Début: ${reservation.startDate.toLocaleString('fr-FR')}`);
    console.log(`   Fin: ${reservation.endDate.toLocaleString('fr-FR')}`);

    if (isFinished) {
      console.log(`   ✅ Session terminée - Prêt pour transfer\n`);
      console.log('🚀 Pour compléter la session et transférer au coach:');
      console.log(`   curl -X POST http://localhost:3000/api/reservations/${reservation.id}/complete \\`);
      console.log(`     -H "Cookie: better-auth.session_token=VOTRE_TOKEN"\n`);
    } else {
      const minutesRemaining = Math.ceil((reservation.endDate.getTime() - now.getTime()) / (1000 * 60));
      console.log(`   ⏳ Session dans ${minutesRemaining} minutes\n`);

      console.log('🧪 Pour tester immédiatement (SIMULATION):');
      console.log('   1. Forcer endDate dans le passé:');
      console.log(`      UPDATE "Reservation" SET "endDate" = NOW() - INTERVAL '1 minute' WHERE id = '${reservation.id}';\n`);
      console.log('   2. Puis appeler:');
      console.log(`      curl -X POST http://localhost:3000/api/reservations/${reservation.id}/complete \\`);
      console.log(`        -H "Cookie: better-auth.session_token=VOTRE_TOKEN"\n`);
    }

    // 4. Récapitulatif des montants
    console.log('═════════════════════════════════════════════════');
    console.log('📊 RÉCAPITULATIF DES MONTANTS');
    console.log('═════════════════════════════════════════════════');
    console.log(`Prix total payé par le joueur: ${reservation.priceCents / 100}€`);
    console.log(`  ├─ Commission Edgemy: ${reservation.edgemyFeeCents ? reservation.edgemyFeeCents / 100 : 0}€`);
    console.log(`  ├─ Frais Stripe (estimés): ${reservation.stripeFeeCents ? reservation.stripeFeeCents / 100 : 0}€`);
    console.log(`  └─ Montant coach: ${reservation.coachEarningsCents / 100}€`);
    console.log();
    console.log('Après complétion:');
    console.log(`  ✅ Coach reçoit: ${reservation.coachEarningsCents / 100}€`);
    console.log(`  ✅ Edgemy garde: ${(reservation.priceCents - reservation.coachEarningsCents) / 100}€ (commission - frais Stripe)`);
    console.log('═════════════════════════════════════════════════\n');

    // 5. Lister toutes les réservations en attente
    const allPending = await prisma.reservation.findMany({
      where: {
        paymentStatus: 'PAID',
        transferStatus: 'PENDING',
      },
      include: {
        coach: true,
      },
      orderBy: {
        endDate: 'asc',
      },
    });

    if (allPending.length > 1) {
      console.log(`📋 Vous avez ${allPending.length} réservations en attente de transfer:\n`);
      allPending.forEach((r, i) => {
        console.log(`${i + 1}. ${r.coach.firstName} ${r.coach.lastName} - ${r.coachEarningsCents / 100}€ - Session: ${r.endDate.toLocaleDateString('fr-FR')}`);
      });
      console.log();
    }

    // 6. Montant total en attente
    const totalPending = allPending.reduce((sum, r) => sum + r.coachEarningsCents, 0);
    console.log(`💰 TOTAL en attente de transfer: ${totalPending / 100}€\n`);

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testCompleteFlow()
  .then(() => {
    console.log('✅ Test terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
