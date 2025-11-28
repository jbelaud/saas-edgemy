/**
 * Script de test pour le cron auto-complete-sessions
 *
 * Ce script simule l'appel du cron job pour tester
 * le transfert automatique des fonds aux coachs.
 *
 * Usage:
 *   node test-auto-complete-cron.js
 */

require('dotenv').config();

async function testAutoCron() {
  try {
    console.log('🧪 TEST DU CRON AUTO-COMPLETE-SESSIONS\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const cronSecret = process.env.CRON_SECRET;

    console.log('📋 Configuration:');
    console.log(`   URL: ${baseUrl}`);
    console.log(`   CRON_SECRET: ${cronSecret ? '✅ Configuré' : '❌ Manquant'}`);
    console.log('');

    if (!cronSecret) {
      console.log('⚠️  AVERTISSEMENT: CRON_SECRET non configuré');
      console.log('   Le cron fonctionnera quand même en dev, mais vous devriez en configurer un');
      console.log('   Générez-en un avec: openssl rand -base64 32');
      console.log('');
    }

    console.log('🔄 Appel du endpoint cron...\n');

    const response = await fetch(`${baseUrl}/api/cron/auto-complete-sessions`, {
      method: 'GET',
      headers: {
        'Authorization': cronSecret ? `Bearer ${cronSecret}` : '',
      },
    });

    console.log(`📊 Réponse HTTP: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur HTTP:');
      console.error(errorText);
      return;
    }

    const result = await response.json();

    console.log('✅ RÉSULTAT DU CRON:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`📋 Message: ${result.message}`);
    console.log(`📊 Sessions traitées: ${result.processed || 0}`);
    console.log(`✅ Succès: ${result.successful || 0}`);
    console.log(`❌ Échecs: ${result.failed || 0}`);
    console.log('');

    if (result.details?.success?.length > 0) {
      console.log('✅ SESSIONS COMPLÉTÉES AVEC SUCCÈS:');
      result.details.success.forEach((id, index) => {
        console.log(`   ${index + 1}. ${id}`);
      });
      console.log('');
    }

    if (result.details?.failed?.length > 0) {
      console.log('❌ SESSIONS EN ÉCHEC:');
      result.details.failed.forEach((failure, index) => {
        console.log(`   ${index + 1}. ${failure.id}`);
        console.log(`      Erreur: ${failure.error}`);
      });
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    if (result.processed === 0) {
      console.log('ℹ️  Aucune session à compléter pour le moment');
      console.log('');
      console.log('💡 Pour tester avec une vraie session:');
      console.log('   1. Créez une réservation test');
      console.log('   2. Payez avec une carte test Stripe');
      console.log('   3. Modifiez manuellement endDate dans la BDD pour qu\'elle soit dans le passé');
      console.log('   4. Re-exécutez ce script');
      console.log('');
      console.log('   Exemple SQL pour modifier endDate:');
      console.log('   UPDATE "Reservation" SET "endDate" = NOW() - INTERVAL \'1 hour\'');
      console.log('   WHERE id = \'votre-reservation-id\';');
    } else if (result.successful > 0) {
      console.log('🎉 TRANSFERT(S) AUTOMATIQUE(S) RÉUSSI(S) !');
      console.log('');
      console.log('✅ Vérifiez dans:');
      console.log('   1. Base de données → transferStatus = TRANSFERRED');
      console.log('   2. Stripe Dashboard → Transfers');
      console.log('   3. Coach Stripe Express Dashboard → Balance mise à jour');
    }

    console.log('');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('');
      console.error('⚠️  Le serveur Next.js n\'est pas démarré');
      console.error('   Lancez-le avec: npm run dev');
      console.error('   Puis réessayez ce script');
    }
  }
}

testAutoCron().catch(console.error);
