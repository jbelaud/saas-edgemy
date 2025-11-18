import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed des plans d'abonnement coach
 * PRO : 39€/mois ou 399€/an - Avec Stripe pour paiements joueurs
 * LITE : 15€/mois ou 149€/an - Sans Stripe, paiements externes
 */
async function main() {
  console.log('🎯 Seed des plans d\'abonnement coach...\n');

  // Plan PRO (existant, renommé)
  const planPro = await prisma.plan.upsert({
    where: { key: 'PRO' },
    update: {
      name: 'Edgemy Pro',
      monthlyPrice: 3900,  // 39€ TTC
      yearlyPrice: 39900,  // 399€ TTC
      requiresStripe: true,
      isActive: true,
      features: {
        stripePayments: true,
        discordIntegration: true,
        unlimitedSessions: true,
        analytics: true,
        prioritySupport: true,
        customBranding: true,
        replayHosting: true,
        invoicing: true,
      },
    },
    create: {
      key: 'PRO',
      name: 'Edgemy Pro',
      monthlyPrice: 3900,  // 39€ TTC
      yearlyPrice: 39900,  // 399€ TTC
      requiresStripe: true,
      isActive: true,
      features: {
        stripePayments: true,
        discordIntegration: true,
        unlimitedSessions: true,
        analytics: true,
        prioritySupport: true,
        customBranding: true,
        replayHosting: true,
        invoicing: true,
      },
    },
  });

  console.log('✅ Plan PRO créé/mis à jour');
  console.log(`   - Mensuel : ${planPro.monthlyPrice / 100}€`);
  console.log(`   - Annuel  : ${planPro.yearlyPrice / 100}€`);
  console.log(`   - Stripe  : ${planPro.requiresStripe ? 'Oui' : 'Non'}\n`);

  // Plan LITE (nouveau)
  const planLite = await prisma.plan.upsert({
    where: { key: 'LITE' },
    update: {
      name: 'Edgemy Lite',
      monthlyPrice: 1500,  // 15€ TTC
      yearlyPrice: 14900,  // 149€ TTC
      requiresStripe: false, // Pas de Stripe pour paiements joueurs
      isActive: true,
      features: {
        stripePayments: false,         // Pas de paiement Stripe automatique
        externalPayments: true,        // Paiements externes (USDT, Wise, Revolut, etc.)
        discordIntegration: true,      // Salon Discord privé
        unlimitedSessions: true,       // Sessions illimitées
        analytics: false,              // Pas de stats avancées
        prioritySupport: false,        // Support standard
        customBranding: false,         // Pas de branding personnalisé
        replayHosting: false,          // Pas d'hébergement replays
        invoicing: false,              // Pas de facturation intégrée
      },
    },
    create: {
      key: 'LITE',
      name: 'Edgemy Lite',
      monthlyPrice: 1500,  // 15€ TTC
      yearlyPrice: 14900,  // 149€ TTC
      requiresStripe: false, // Pas de Stripe pour paiements joueurs
      isActive: true,
      features: {
        stripePayments: false,
        externalPayments: true,
        discordIntegration: true,
        unlimitedSessions: true,
        analytics: false,
        prioritySupport: false,
        customBranding: false,
        replayHosting: false,
        invoicing: false,
      },
    },
  });

  console.log('✅ Plan LITE créé/mis à jour');
  console.log(`   - Mensuel : ${planLite.monthlyPrice / 100}€`);
  console.log(`   - Annuel  : ${planLite.yearlyPrice / 100}€`);
  console.log(`   - Stripe  : ${planLite.requiresStripe ? 'Oui' : 'Non'}\n`);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n📊 COMPARATIF DES PLANS\n');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│ 🚀 PRO                           🎯 LITE                │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ 39€/mois ou 399€/an              15€/mois ou 149€/an    │');
  console.log('│ ✅ Paiement Stripe auto          ❌ Paiement externe    │');
  console.log('│ ✅ Discord privé                 ✅ Discord privé       │');
  console.log('│ ✅ Sessions illimitées           ✅ Sessions illimitées │');
  console.log('│ ✅ Analytics avancées            ❌ Pas de stats        │');
  console.log('│ ✅ Support prioritaire           ❌ Support standard    │');
  console.log('│ ✅ Branding personnalisé         ❌ Pas de branding     │');
  console.log('│ ✅ Hébergement replays           ❌ Pas d\'hébergement   │');
  console.log('│ ✅ Facturation intégrée          ❌ Pas de facturation  │');
  console.log('└─────────────────────────────────────────────────────────┘\n');

  console.log('✅ Seed des plans terminé avec succès!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed des plans:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
