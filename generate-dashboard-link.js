const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

async function generateDashboardLink() {
  const accountId = 'acct_1SSkTd2dZ7wpKq4w';

  try {
    console.log('🔗 Génération du lien dashboard Stripe...\n');

    const loginLink = await stripe.accounts.createLoginLink(accountId);

    console.log('✅ Lien créé avec succès !\n');
    console.log('📊 DASHBOARD STRIPE EXPRESS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🔗 URL:', loginLink.url);
    console.log('');
    console.log('⏰ Expire dans: 5 minutes');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('💡 INSTRUCTIONS:');
    console.log('   1. Copiez le lien ci-dessus');
    console.log('   2. Collez-le dans votre navigateur');
    console.log('   3. Vous accéderez directement au dashboard Express');
    console.log('   4. Vérifiez que les 90€ apparaissent dans la balance');
    console.log('');
    console.log('📊 Dans le dashboard, vous verrez:');
    console.log('   - Balance disponible');
    console.log('   - Historique des paiements');
    console.log('   - Transfert de 90€ (tr_3SYBaE2eIgLC7h2i1Zzqn1qd)');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur:', error.message);

    if (error.type === 'StripePermissionError') {
      console.log('\n⚠️ Le compte nécessite de compléter l\'onboarding d\'abord');
      console.log('   Utilisez plutôt la solution 2 ci-dessous');
    }
  }
}

generateDashboardLink().catch(console.error);
