/**
 * Script de reset de la base de données
 * 
 * ATTENTION : Ce script supprime TOUTES les données SAUF la table subscribers
 * 
 * Usage : npx tsx scripts/reset-database.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚨 ATTENTION : Ce script va supprimer TOUTES les données sauf subscribers');
  console.log('');
  
  // Vérifier le nombre de subscribers avant
  const subscribersCount = await prisma.subscriber.count();
  console.log(`📊 Subscribers à préserver : ${subscribersCount}`);
  
  console.log('');
  console.log('🗑️  Suppression des données en cours...');
  console.log('');

  // Ordre de suppression (respecter les contraintes FK)
  
  // 1. Logs
  const transferLogs = await prisma.transferLog.deleteMany();
  console.log(`   ✓ TransferLog : ${transferLogs.count} supprimés`);
  
  const refundLogs = await prisma.refundLog.deleteMany();
  console.log(`   ✓ RefundLog : ${refundLogs.count} supprimés`);
  
  const adminLogs = await prisma.adminLog.deleteMany();
  console.log(`   ✓ AdminLog : ${adminLogs.count} supprimés`);

  // 2. Sessions de packs
  const packageSessions = await prisma.packageSession.deleteMany();
  console.log(`   ✓ PackageSession : ${packageSessions.count} supprimés`);

  // 3. Reviews
  const reviews = await prisma.review.deleteMany();
  console.log(`   ✓ Review : ${reviews.count} supprimés`);

  // 4. Réservations
  const reservations = await prisma.reservation.deleteMany();
  console.log(`   ✓ Reservation : ${reservations.count} supprimés`);

  // 5. Packs de coaching
  const coachingPackages = await prisma.coachingPackage.deleteMany();
  console.log(`   ✓ CoachingPackage : ${coachingPackages.count} supprimés`);

  // 6. Notes et notifications coach
  const coachNotes = await prisma.coachNote.deleteMany();
  console.log(`   ✓ CoachNote : ${coachNotes.count} supprimés`);
  
  const coachNotifications = await prisma.coachNotification.deleteMany();
  console.log(`   ✓ CoachNotification : ${coachNotifications.count} supprimés`);
  
  const coachPlayerChannels = await prisma.coachPlayerChannel.deleteMany();
  console.log(`   ✓ CoachPlayerChannel : ${coachPlayerChannels.count} supprimés`);

  // 7. Packs d'annonces et annonces
  const announcementPacks = await prisma.announcementPack.deleteMany();
  console.log(`   ✓ AnnouncementPack : ${announcementPacks.count} supprimés`);
  
  const announcements = await prisma.announcement.deleteMany();
  console.log(`   ✓ Announcement : ${announcements.count} supprimés`);

  // 8. Disponibilités
  const availabilities = await prisma.availability.deleteMany();
  console.log(`   ✓ Availability : ${availabilities.count} supprimés`);

  // 9. Brouillons coach
  const coachDrafts = await prisma.coachDraft.deleteMany();
  console.log(`   ✓ CoachDraft : ${coachDrafts.count} supprimés`);

  // 10. Coachs
  const coaches = await prisma.coach.deleteMany();
  console.log(`   ✓ Coach : ${coaches.count} supprimés`);

  // 11. Joueurs
  const players = await prisma.player.deleteMany();
  console.log(`   ✓ Player : ${players.count} supprimés`);

  // 12. Sessions d'authentification
  const sessions = await prisma.session.deleteMany();
  console.log(`   ✓ Session : ${sessions.count} supprimés`);

  // 13. Comptes OAuth
  const accounts = await prisma.account.deleteMany();
  console.log(`   ✓ Account : ${accounts.count} supprimés`);

  // 14. Vérifications
  const verifications = await prisma.verification.deleteMany();
  console.log(`   ✓ Verification : ${verifications.count} supprimés`);

  // 15. Utilisateurs
  const users = await prisma.user.deleteMany();
  console.log(`   ✓ User : ${users.count} supprimés`);

  console.log('');
  console.log('✅ Base de données nettoyée !');
  console.log('');
  
  // Vérification finale
  const finalSubscribersCount = await prisma.subscriber.count();
  console.log(`📊 Subscribers préservés : ${finalSubscribersCount}`);
  
  console.log('');
  console.log('🎯 Prochaines étapes :');
  console.log('   1. Reset les données test dans Stripe Dashboard');
  console.log('   2. Recréer un compte coach de test');
  console.log('   3. Configurer Stripe Connect');
}

main()
  .catch((e) => {
    console.error('❌ Erreur :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
