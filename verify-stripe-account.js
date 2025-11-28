const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

async function verifyAccount() {
  const accountId = 'acct_1SSkTd2dZ7wpKq4w';

  try {
    console.log(`🔍 Vérification du compte Stripe ${accountId}...\n`);

    const account = await stripe.accounts.retrieve(accountId);

    console.log('✅ Compte trouvé:\n');
    console.log('📋 Informations générales:');
    console.log('  ID:', account.id);
    console.log('  Type:', account.type);
    console.log('  Email:', account.email);
    console.log('  Country:', account.country);
    console.log('');

    console.log('🔧 État de configuration:');
    console.log('  Details submitted:', account.details_submitted ? '✅ Oui' : '❌ Non');
    console.log('  Charges enabled:', account.charges_enabled ? '✅ Oui' : '❌ Non');
    console.log('  Payouts enabled:', account.payouts_enabled ? '✅ Oui' : '❌ Non');
    console.log('');

    if (account.requirements) {
      console.log('📝 Exigences Stripe:');
      console.log('  Currently due:', account.requirements.currently_due?.length || 0, 'items');
      if (account.requirements.currently_due?.length) {
        account.requirements.currently_due.forEach(req => console.log('    -', req));
      }
      console.log('  Eventually due:', account.requirements.eventually_due?.length || 0, 'items');
      console.log('  Past due:', account.requirements.past_due?.length || 0, 'items');
      if (account.requirements.past_due?.length) {
        account.requirements.past_due.forEach(req => console.log('    ⚠️', req));
      }
      console.log('');
    }

    // Vérifier les capacités
    if (account.capabilities) {
      console.log('🎯 Capacités:');
      console.log('  Card payments:', account.capabilities.card_payments);
      console.log('  Transfers:', account.capabilities.transfers);
      console.log('');
    }

    // Résumé
    console.log('📊 RÉSUMÉ:');
    if (account.details_submitted && account.charges_enabled && account.payouts_enabled) {
      console.log('  ✅ Le compte est ENTIÈREMENT configuré et opérationnel');
      console.log('  ✅ Peut recevoir des paiements');
      console.log('  ✅ Peut recevoir des versements');
    } else {
      console.log('  ⚠️ Le compte nécessite des actions:');
      if (!account.details_submitted) {
        console.log('     - Compléter les informations du compte');
      }
      if (!account.charges_enabled) {
        console.log('     - Activer la réception de paiements');
      }
      if (!account.payouts_enabled) {
        console.log('     - Activer les versements');
      }
    }
    console.log('');

    // Vérifier si le coach peut créer un login link
    if (account.type === 'express') {
      console.log('🔗 Génération d\'un login link pour le dashboard...');
      try {
        const loginLink = await stripe.accounts.createLoginLink(accountId);
        console.log('  ✅ Login link créé avec succès');
        console.log('  URL:', loginLink.url);
        console.log('  ⏰ Expire dans 5 minutes');
      } catch (error) {
        console.log('  ❌ Erreur création login link:', error.message);
      }
    }

  } catch (error) {
    console.error('\n❌ Erreur lors de la récupération du compte:');
    console.error('  Message:', error.message);
    console.error('  Type:', error.type);
    if (error.code) {
      console.error('  Code:', error.code);
    }

    if (error.type === 'StripeAuthenticationError') {
      console.error('\n⚠️ Vérifiez que STRIPE_SECRET_KEY est correctement configurée');
    } else if (error.type === 'StripePermissionError') {
      console.error('\n⚠️ Le compte Stripe n\'a pas les permissions nécessaires');
    } else if (error.code === 'account_invalid') {
      console.error('\n⚠️ Le compte Stripe n\'existe pas ou a été supprimé');
    }
  }
}

verifyAccount().catch(console.error);
