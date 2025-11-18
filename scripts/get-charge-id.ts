import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

async function getChargeId(paymentIntentId: string) {
  try {
    console.log(`🔍 Récupération du Charge ID pour PaymentIntent: ${paymentIntentId}\n`);

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    console.log('📋 PaymentIntent Details:');
    console.log(`  Status: ${paymentIntent.status}`);
    console.log(`  Amount: ${paymentIntent.amount / 100}€`);
    console.log(`  Created: ${new Date(paymentIntent.created * 1000).toLocaleString('fr-FR')}`);
    console.log(`  Latest Charge: ${paymentIntent.latest_charge || 'N/A'}`);

    // Essayer d'obtenir le charge depuis latest_charge
    if (paymentIntent.latest_charge) {
      const chargeId = typeof paymentIntent.latest_charge === 'string'
        ? paymentIntent.latest_charge
        : paymentIntent.latest_charge.id;

      console.log(`\n✅ Charge ID trouvé via latest_charge: ${chargeId}`);

      // Récupérer les détails du charge
      const charge = await stripe.charges.retrieve(chargeId);
      console.log(`\n💳 Charge Details:`);
      console.log(`  ID: ${charge.id}`);
      console.log(`  Amount: ${charge.amount / 100}€`);
      console.log(`  Status: ${charge.status}`);
      console.log(`  Paid: ${charge.paid ? '✅' : '❌'}`);
      console.log(`  Captured: ${charge.captured ? '✅' : '❌'}`);
      console.log(`  Created: ${new Date(charge.created * 1000).toLocaleString('fr-FR')}`);

      return chargeId;
    }

    // Fallback: essayer avec expand
    const piWithCharges = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['charges.data'],
    }) as any;

    if (piWithCharges.charges && piWithCharges.charges.data && piWithCharges.charges.data.length > 0) {
      console.log(`\n💳 Charges associés: ${piWithCharges.charges.data.length}`);

      piWithCharges.charges.data.forEach((charge: any, index: number) => {
        console.log(`\n  Charge ${index + 1}:`);
        console.log(`    ID: ${charge.id}`);
        console.log(`    Amount: ${charge.amount / 100}€`);
        console.log(`    Status: ${charge.status}`);
        console.log(`    Paid: ${charge.paid ? '✅' : '❌'}`);
        console.log(`    Captured: ${charge.captured ? '✅' : '❌'}`);
        console.log(`    Created: ${new Date(charge.created * 1000).toLocaleString('fr-FR')}`);
      });

      const chargeId = piWithCharges.charges.data[0].id;
      console.log(`\n✅ Charge ID à utiliser pour le transfer: ${chargeId}`);
      return chargeId;
    } else {
      console.log('\n❌ Aucun charge trouvé pour ce PaymentIntent');
      console.log('   Cela peut signifier que:');
      console.log('   1. Le paiement n\'a pas été capturé');
      console.log('   2. Le PaymentIntent est dans un mauvais état');
      console.log('   3. Le PaymentIntent ID est incorrect');
      return null;
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
    return null;
  }
}

const PAYMENT_INTENT_ID = 'pi_3SUDhG2eIgLC7h2i0b3uhGgt';
getChargeId(PAYMENT_INTENT_ID);
