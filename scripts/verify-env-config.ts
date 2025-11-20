/**
 * Script de vérification des variables d'environnement
 *
 * Vérifie que toutes les variables Stripe nécessaires sont configurées
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement depuis .env.local en priorité, puis .env
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

console.log('🔍 VÉRIFICATION VARIABLES D\'ENVIRONNEMENT\n');
console.log('═'.repeat(80));

let allChecksPass = true;

// Variables requises
const requiredVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_COACH_MONTHLY_PRICE_ID',
  'STRIPE_COACH_YEARLY_PRICE_ID',
  'STRIPE_COACH_LITE_MONTHLY_PRICE_ID',
  'STRIPE_COACH_LITE_YEARLY_PRICE_ID',
];

// Variables optionnelles (avec valeurs par défaut)
const optionalVars = [
  'STRIPE_PERCENT_FEE',
  'STRIPE_FIXED_FEE_CENTS',
  'EDGEMY_SESSION_PERCENT',
  'EDGEMY_PACK_FIXED_CENTS',
  'EDGEMY_PACK_PERCENT',
];

console.log('\n📊 Variables REQUISES');
console.log('─'.repeat(80));

requiredVars.forEach(varName => {
  const value = process.env[varName];

  if (!value) {
    console.error(`❌ ${varName}: MANQUANT`);
    allChecksPass = false;
  } else if (value.includes('your_') || value.includes('xxx')) {
    console.error(`❌ ${varName}: Valeur placeholder non remplacée`);
    console.error(`   Valeur actuelle: ${value.substring(0, 20)}...`);
    allChecksPass = false;
  } else {
    // Masquer les secrets
    const masked = value.length > 10
      ? value.substring(0, 10) + '...' + value.substring(value.length - 4)
      : '***';
    console.log(`✅ ${varName}: ${masked}`);
  }
});

console.log('\n📊 Variables OPTIONNELLES (valeurs par défaut si absentes)');
console.log('─'.repeat(80));

optionalVars.forEach(varName => {
  const value = process.env[varName];

  if (!value) {
    console.warn(`⚠️  ${varName}: Non défini (valeur par défaut sera utilisée)`);
  } else {
    console.log(`✅ ${varName}: ${value}`);
  }
});

// Vérifications spécifiques
console.log('\n📊 Vérifications SPÉCIFIQUES');
console.log('─'.repeat(80));

// 1. Vérifier que STRIPE_SECRET_KEY est bien une clé live ou test
const secretKey = process.env.STRIPE_SECRET_KEY || '';
if (secretKey.startsWith('sk_live_')) {
  console.log('✅ STRIPE_SECRET_KEY: Mode LIVE (production)');
} else if (secretKey.startsWith('sk_test_')) {
  console.warn('⚠️  STRIPE_SECRET_KEY: Mode TEST (pas pour production)');
} else {
  console.error('❌ STRIPE_SECRET_KEY: Format invalide');
  allChecksPass = false;
}

// 2. Vérifier que les Price IDs ont le bon format
const priceIds = [
  process.env.STRIPE_COACH_MONTHLY_PRICE_ID,
  process.env.STRIPE_COACH_YEARLY_PRICE_ID,
  process.env.STRIPE_COACH_LITE_MONTHLY_PRICE_ID,
  process.env.STRIPE_COACH_LITE_YEARLY_PRICE_ID,
];

priceIds.forEach((priceId, index) => {
  if (priceId && !priceId.startsWith('price_')) {
    console.error(`❌ Price ID #${index + 1}: Format invalide (doit commencer par "price_")`);
    allChecksPass = false;
  }
});

// 3. Vérifier STRIPE_PERCENT_FEE
const percentFee = parseFloat(process.env.STRIPE_PERCENT_FEE || '0.015');
if (percentFee < 0.01 || percentFee > 0.05) {
  console.warn(`⚠️  STRIPE_PERCENT_FEE: ${percentFee} semble anormal (attendu: 0.015 pour 1.5%)`);
} else {
  console.log(`✅ STRIPE_PERCENT_FEE: ${percentFee} (${percentFee * 100}%)`);
}

// 4. Vérifier STRIPE_FIXED_FEE_CENTS
const fixedFee = parseInt(process.env.STRIPE_FIXED_FEE_CENTS || '25', 10);
if (fixedFee < 10 || fixedFee > 50) {
  console.warn(`⚠️  STRIPE_FIXED_FEE_CENTS: ${fixedFee} semble anormal (attendu: 25 pour 0.25€)`);
} else {
  console.log(`✅ STRIPE_FIXED_FEE_CENTS: ${fixedFee} (${fixedFee / 100}€)`);
}

// Résumé
console.log('\n' + '═'.repeat(80));
console.log('📝 RÉSUMÉ');
console.log('═'.repeat(80));

if (allChecksPass) {
  console.log('\n✅ TOUTES LES VARIABLES SONT CONFIGURÉES !');
  console.log('   L\'environnement est prêt.');
} else {
  console.log('\n❌ CERTAINES VARIABLES SONT MANQUANTES OU INVALIDES');
  console.log('   Corrigez les erreurs dans votre fichier .env');
  process.exit(1);
}
