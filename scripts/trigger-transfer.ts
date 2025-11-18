/**
 * Script pour déclencher manuellement le transfert d'une réservation
 * Utilise la même logique que /api/reservations/[id]/complete
 */

import { PrismaClient } from '@prisma/client';
import { transferForCompletedSession } from '@/lib/stripe/transfer';
import { isSessionCompleted } from '@/lib/stripe/business-rules';

const prisma = new PrismaClient();

async function triggerTransfer(reservationId: string) {
  try {
    console.log('🔄 DÉCLENCHEMENT MANUEL DU TRANSFERT\n');
    console.log('=' .repeat(60));

    // Récupérer la réservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        player: { select: { name: true, email: true } },
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

    console.log('\n📋 DÉTAILS DE LA RÉSERVATION:');
    console.log(`ID: ${reservation.id}`);
    console.log(`Joueur: ${reservation.player.name} (${reservation.player.email})`);
    console.log(`Coach: ${reservation.coach.user.name} (${reservation.coach.user.email})`);
    console.log(`Annonce: ${reservation.announcement?.title || 'N/A'}`);
    console.log(`Date début: ${reservation.startDate.toLocaleString('fr-FR')}`);
    console.log(`Date fin: ${reservation.endDate.toLocaleString('fr-FR')}`);
    console.log(`Prix: ${reservation.priceCents / 100}€`);
    console.log(`Net coach: ${reservation.coachNetCents / 100}€`);
    console.log(`Statut: ${reservation.status}`);
    console.log(`Statut paiement: ${reservation.paymentStatus}`);
    console.log(`Statut transfert: ${reservation.transferStatus}`);

    // Vérifications
    console.log('\n🔍 VÉRIFICATIONS:');

    // 1. Session terminée ?
    const isCompleted = isSessionCompleted(reservation.endDate);
    console.log(`✓ Session terminée: ${isCompleted ? '✅ OUI' : '❌ NON'}`);

    if (!isCompleted) {
      const minutesRemaining = Math.ceil(
        (reservation.endDate.getTime() - new Date().getTime()) / (1000 * 60)
      );
      console.log(`  Il reste ${minutesRemaining} minutes avant la fin`);
      console.log('\n⚠️  TRANSFERT IMPOSSIBLE: La session n\'est pas encore terminée');
      return;
    }

    // 2. Paiement confirmé ?
    const isPaid = reservation.paymentStatus === 'PAID';
    console.log(`✓ Paiement confirmé: ${isPaid ? '✅ OUI' : '❌ NON'}`);

    if (!isPaid) {
      console.log('\n❌ TRANSFERT IMPOSSIBLE: Le paiement n\'a pas été effectué');
      return;
    }

    // 3. Transfert en attente ?
    const isPending = reservation.transferStatus === 'PENDING';
    console.log(`✓ Transfert en attente: ${isPending ? '✅ OUI' : '❌ NON (${reservation.transferStatus})'}`);

    if (!isPending) {
      console.log(`\n⚠️  Le transfert a déjà le statut: ${reservation.transferStatus}`);
      if (reservation.transferredAt) {
        console.log(`   Transféré le: ${reservation.transferredAt.toLocaleString('fr-FR')}`);
      }
      if (reservation.stripeTransferId) {
        console.log(`   ID transfert Stripe: ${reservation.stripeTransferId}`);
      }
      console.log('\n❌ TRANSFERT IMPOSSIBLE: Le transfert n\'est pas en attente');
      return;
    }

    // 4. Compte Stripe Connect du coach ?
    const hasStripeAccount = !!reservation.coach.stripeAccountId &&
                            !reservation.coach.stripeAccountId.startsWith('acct_mock_');
    console.log(`✓ Compte Stripe Connect: ${hasStripeAccount ? '✅ OUI' : '❌ NON'}`);

    if (!hasStripeAccount) {
      console.log('\n❌ TRANSFERT IMPOSSIBLE: Le coach n\'a pas de compte Stripe Connect configuré');
      return;
    }

    console.log(`  Account ID: ${reservation.coach.stripeAccountId}`);

    // Toutes les vérifications passées, on peut transférer !
    console.log('\n✅ TOUTES LES VÉRIFICATIONS SONT PASSÉES');
    console.log('\n💰 DÉCLENCHEMENT DU TRANSFERT...');
    console.log(`   Montant à transférer: ${reservation.coachNetCents / 100}€`);

    // Appeler la fonction de transfert
    const result = await transferForCompletedSession(reservationId);

    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSULTAT:\n');

    if (result.success) {
      console.log('✅ TRANSFERT RÉUSSI !');
      console.log(`   ID transfert Stripe: ${result.transferId}`);
      console.log(`   Montant transféré: ${(result.amount || reservation.coachNetCents) / 100}€`);
      console.log(`   Date: ${new Date().toLocaleString('fr-FR')}`);

      // Vérifier que la réservation a bien été mise à jour
      const updatedReservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        select: {
          transferStatus: true,
          transferredAt: true,
          stripeTransferId: true,
          status: true
        }
      });

      console.log('\n📋 Statut de la réservation après transfert:');
      console.log(`   Status: ${updatedReservation?.status}`);
      console.log(`   Transfer Status: ${updatedReservation?.transferStatus}`);
      console.log(`   Transferred At: ${updatedReservation?.transferredAt?.toLocaleString('fr-FR')}`);
      console.log(`   Stripe Transfer ID: ${updatedReservation?.stripeTransferId}`);

    } else {
      console.log('❌ ÉCHEC DU TRANSFERT');
      console.log(`   Erreur: ${result.error}`);
      console.log('\n💡 Que faire ?');
      console.log('   1. Vérifier les logs Stripe pour plus de détails');
      console.log('   2. Vérifier que le compte Stripe Connect du coach est bien configuré');
      console.log('   3. Contacter le support Stripe si le problème persiste');
    }

  } catch (error) {
    console.error('\n❌ ERREUR LORS DU TRANSFERT:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Utiliser la réservation trouvée précédemment
const RESERVATION_ID = 'cmi28pk1q0001uy38xv7clgzx';

console.log('🚀 Script de transfert manuel\n');
console.log(`Réservation cible: ${RESERVATION_ID}`);
console.log('');

triggerTransfer(RESERVATION_ID);
