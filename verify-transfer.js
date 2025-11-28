const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

async function verifyTransfer() {
  const transferId = 'tr_3SYBaE2eIgLC7h2i1Zzqn1qd';
  const accountId = 'acct_1SSkTd2dZ7wpKq4w';

  try {
    console.log('🔍 Vérification du transfert Stripe...\n');

    // Récupérer le transfert
    const transfer = await stripe.transfers.retrieve(transferId);

    console.log('✅ TRANSFERT TROUVÉ\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('💰 Montant:', (transfer.amount / 100).toFixed(2), '€');
    console.log('🎯 Destination:', transfer.destination);
    console.log('📅 Date:', new Date(transfer.created * 1000).toLocaleString('fr-FR'));
    console.log('📝 Description:', transfer.description);
    console.log('✅ Statut:', transfer.status || 'succeeded');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // Vérifier la balance du compte
    console.log('📊 Récupération de la balance du coach...\n');

    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId,
    });

    console.log('💵 BALANCE DU COMPTE COACH\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // Balance disponible
    const availableEur = balance.available.find(b => b.currency === 'eur');
    if (availableEur) {
      console.log('✅ Disponible:', (availableEur.amount / 100).toFixed(2), '€');
    }

    // Balance en attente
    const pendingEur = balance.pending.find(b => b.currency === 'eur');
    if (pendingEur) {
      console.log('⏳ En attente:', (pendingEur.amount / 100).toFixed(2), '€');
    }

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    if (availableEur && availableEur.amount >= 9000) {
      console.log('🎉 SUCCÈS ! Les 90€ sont bien présents dans la balance du coach !');
    } else if (pendingEur && pendingEur.amount >= 9000) {
      console.log('⏳ Les 90€ sont en attente de versement');
      console.log('   Ils seront disponibles selon le calendrier de payout Stripe');
    } else {
      console.log('⚠️ Les fonds ne sont pas encore visibles dans la balance');
      console.log('   Cela peut prendre quelques minutes pour apparaître');
    }

    console.log('');

    // Lister les derniers transfers
    console.log('📋 Derniers transfers du compte:\n');

    const transfers = await stripe.transfers.list({
      destination: accountId,
      limit: 5,
    });

    transfers.data.forEach((t, i) => {
      console.log(`${i + 1}. ${(t.amount / 100).toFixed(2)}€ - ${new Date(t.created * 1000).toLocaleDateString('fr-FR')} - ${t.id}`);
    });

    console.log('');

  } catch (error) {
    console.error('❌ Erreur:', error.message);

    if (error.type === 'StripePermissionError') {
      console.log('\n⚠️ Erreur de permissions');
      console.log('   Vérifiez les clés API Stripe');
    }
  }
}

verifyTransfer().catch(console.error);
