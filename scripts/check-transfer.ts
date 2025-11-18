import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTransfer() {
  try {
    // Chercher tous les utilisateurs Belaud
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: 'Belaud', mode: 'insensitive' } },
          { email: { contains: 'belaud', mode: 'insensitive' } }
        ]
      },
      select: { id: true, name: true, email: true }
    });

    console.log('👥 Utilisateurs trouvés:', users.length);
    users.forEach(u => console.log(`  - ${u.name} (${u.email})`));

    if (users.length === 0) {
      console.log('\n❌ Aucun utilisateur Belaud trouvé dans la base de données');
      return;
    }

    const userIds = users.map(u => u.id);

    // Chercher les réservations des 7 derniers jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const reservations = await prisma.reservation.findMany({
      where: {
        OR: [
          { playerId: { in: userIds } },
          { coachId: { in: userIds } }
        ],
        startDate: { gte: sevenDaysAgo }
      },
      include: {
        player: { select: { name: true, email: true } },
        coach: {
          select: {
            firstName: true,
            lastName: true,
            user: { select: { name: true, email: true } }
          }
        },
        announcement: { select: { title: true } }
      },
      orderBy: { startDate: 'desc' }
    });

    console.log('\n📅 Réservations des 7 derniers jours:', reservations.length);

    if (reservations.length === 0) {
      console.log('❌ Aucune réservation trouvée pour les utilisateurs Belaud');
      return;
    }

    reservations.forEach((reservation, index) => {
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      console.log(`\n=== Réservation ${index + 1} ===`);
      console.log(`ID: ${reservation.id}`);
      console.log(`Joueur: ${reservation.player.name} (${reservation.player.email})`);
      console.log(`Coach: ${reservation.coach.user.name} (${reservation.coach.user.email})`);
      console.log(`Annonce: ${reservation.announcement?.title || 'N/A'}`);
      console.log(`Date début: ${startDate.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`);
      console.log(`Date fin: ${endDate.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`);
      console.log(`Statut réservation: ${reservation.status}`);
      console.log(`Statut paiement: ${reservation.paymentStatus}`);
      console.log(`Prix: ${reservation.priceCents / 100}€`);
      console.log(`Gains coach: ${reservation.coachEarningsCents / 100}€`);
      console.log(`Net coach: ${reservation.coachNetCents / 100}€`);

      // Informations sur le transfert
      console.log(`\n💰 Transfert Stripe:`);
      console.log(`  Statut transfert: ${reservation.transferStatus}`);
      console.log(`  ID transfert Stripe: ${reservation.stripeTransferId || 'N/A'}`);
      console.log(`  Date transfert: ${reservation.transferredAt ? new Date(reservation.transferredAt).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }) : 'Pas encore transféré'}`);

      if (reservation.transferStatus === 'PENDING') {
        console.log('⚠️  ATTENTION: Le transfert est en attente (PENDING) - L\'argent n\'a pas encore été transféré au coach !');
      } else if (reservation.transferStatus === 'TRANSFERRED') {
        console.log('✅ TRANSFERT COMPLÉTÉ - L\'argent a été transféré au coach');
      } else if (reservation.transferStatus === 'FAILED') {
        console.log('❌ TRANSFERT ÉCHOUÉ - Le transfert a échoué !');
      }

      // Informations sur le paiement
      if (reservation.stripePaymentId) {
        console.log(`\n💳 Paiement Stripe:`);
        console.log(`  ID paiement: ${reservation.stripePaymentId}`);
        console.log(`  ID session: ${reservation.stripeSessionId || 'N/A'}`);
      }
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTransfer();
