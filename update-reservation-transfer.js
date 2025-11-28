const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateReservation() {
  const reservationId = 'cmihvetbw0001uygsjz8rctu5';
  const transferId = 'tr_3SYBaE2eIgLC7h2i1Zzqn1qd';

  try {
    console.log('🔄 Mise à jour de la réservation en base de données...\n');

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        stripeTransferId: transferId,
        transferStatus: 'TRANSFERRED',
        transferredAt: new Date(),
      },
    });

    console.log('✅ Réservation mise à jour avec succès !');
    console.log('');
    console.log('📋 Détails:');
    console.log('  Reservation ID:', updated.id);
    console.log('  Transfer ID:', updated.stripeTransferId);
    console.log('  Transfer Status:', updated.transferStatus);
    console.log('  Transferred At:', updated.transferredAt?.toISOString());
    console.log('');
    console.log('🎉 TERMINÉ ! Le transfert est maintenant enregistré en BDD.');
    console.log('');
    console.log('✅ Le coach peut voir ses 90€ dans son dashboard Stripe !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateReservation().catch(console.error);
