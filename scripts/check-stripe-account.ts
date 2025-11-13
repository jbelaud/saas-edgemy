import Stripe from 'stripe';
import { prisma } from '../src/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

async function checkStripeAccount() {
  try {
    // Rechercher le coach Olivier Belaud
    const coach = await prisma.coach.findFirst({
      where: {
        OR: [
          { firstName: { contains: 'Olivier', mode: 'insensitive' } },
          { lastName: { contains: 'Belaud', mode: 'insensitive' } },
        ],
      },
      include: { user: true },
    });

    if (!coach) {
      console.log('❌ Coach Olivier Belaud non trouvé');
      return;
    }

    console.log('\n📊 Informations coach:');
    console.log('  - ID:', coach.id);
    console.log('  - Nom:', coach.firstName, coach.lastName);
    console.log('  - Email:', coach.user.email);
    console.log('  - Stripe Account ID:', coach.stripeAccountId);
    console.log('  - isOnboarded:', coach.isOnboarded);

    if (!coach.stripeAccountId) {
      console.log('\n⚠️ Aucun compte Stripe associé');
      return;
    }

    // Vérifier le compte Stripe
    console.log('\n🔍 Vérification du compte Stripe...');

    try {
      const account = await stripe.accounts.retrieve(coach.stripeAccountId);

      console.log('\n✅ Compte Stripe trouvé:');
      console.log('  - Type:', account.type);
      console.log('  - Email:', account.email);
      console.log('  - Country:', account.country);
      console.log('  - details_submitted:', account.details_submitted);
      console.log('  - charges_enabled:', account.charges_enabled);
      console.log('  - payouts_enabled:', account.payouts_enabled);
      console.log('  - created:', account.created ? new Date(account.created * 1000).toLocaleString('fr-FR') : 'N/A');

      if (account.requirements) {
        console.log('\n📋 Requirements:');
        console.log('  - currently_due:', account.requirements.currently_due?.length || 0);
        console.log('  - eventually_due:', account.requirements.eventually_due?.length || 0);
        console.log('  - past_due:', account.requirements.past_due?.length || 0);

        if (account.requirements.currently_due?.length) {
          console.log('  - Champs requis:', account.requirements.currently_due.join(', '));
        }
      }

      // Vérifier si la BDD est à jour
      const shouldBeOnboarded = account.details_submitted && account.payouts_enabled && account.charges_enabled;

      if (shouldBeOnboarded !== coach.isOnboarded) {
        console.log(`\n⚠️ Incohérence détectée:`);
        console.log(`  - BDD isOnboarded: ${coach.isOnboarded}`);
        console.log(`  - Stripe réel: ${shouldBeOnboarded}`);
        console.log(`\n💡 Correction recommandée:`);

        if (shouldBeOnboarded) {
          console.log(`  Mettre à jour le coach avec isOnboarded=true`);
        } else {
          console.log(`  Le compte n'est pas complètement configuré.`);
          console.log(`  Le coach doit compléter l'onboarding Stripe.`);
        }
      } else {
        console.log(`\n✅ État cohérent entre BDD et Stripe`);
      }

    } catch (error) {
      console.error('❌ Erreur lors de la récupération du compte Stripe:', error);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStripeAccount();
