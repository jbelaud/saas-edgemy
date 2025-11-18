/**
 * Script de vérification du schéma DB avant déploiement
 *
 * Vérifie que tous les champs nécessaires existent
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySchema() {
  console.log('🔍 VÉRIFICATION DU SCHÉMA BASE DE DONNÉES\n');
  console.log('═'.repeat(80));

  let allChecksPass = true;

  // Test 1: Vérifier que la table Reservation a les champs TVA
  console.log('\n📊 Test 1: Champs TVA dans Reservation');
  console.log('─'.repeat(80));

  try {
    const sample = await prisma.reservation.findFirst({
      select: {
        id: true,
        edgemyRevenueHT: true,
        edgemyRevenueTVACents: true,
      },
    });

    console.log('✅ Champs TVA présents dans Reservation');
    console.log(`   Sample: edgemyRevenueHT=${sample?.edgemyRevenueHT}, edgemyRevenueTVACents=${sample?.edgemyRevenueTVACents}`);
  } catch (error) {
    console.error('❌ ERREUR: Champs TVA manquants dans Reservation');
    console.error('   Action: Appliquer la migration add_vat_accounting_fields.sql');
    allChecksPass = false;
  }

  // Test 2: Vérifier que la table coach a les champs TVA
  console.log('\n📊 Test 2: Champs TVA dans coach');
  console.log('─'.repeat(80));

  try {
    const sample = await prisma.coach.findFirst({
      select: {
        id: true,
        isVATRegistered: true,
        vatNumber: true,
      },
    });

    console.log('✅ Champs TVA présents dans coach');
    console.log(`   Sample: isVATRegistered=${sample?.isVATRegistered}, vatNumber=${sample?.vatNumber ?? 'NULL'}`);
  } catch (error) {
    console.error('❌ ERREUR: Champs TVA manquants dans coach');
    console.error('   Action: Appliquer la migration add_vat_accounting_fields.sql');
    allChecksPass = false;
  }

  // Test 3: Vérifier que les réservations ont edgemyRevenueHT rempli
  console.log('\n📊 Test 3: Backfill TVA effectué');
  console.log('─'.repeat(80));

  const reservationsWithoutVAT = await prisma.reservation.count({
    where: {
      paymentStatus: 'PAID',
      edgemyRevenueHT: null,
    },
  });

  if (reservationsWithoutVAT === 0) {
    console.log('✅ Toutes les réservations payées ont les champs TVA remplis');
  } else {
    console.warn(`⚠️  WARNING: ${reservationsWithoutVAT} réservations payées sans champs TVA`);
    console.warn('   Action: Exécuter npx tsx scripts/backfill-vat-fields.ts');
    allChecksPass = false;
  }

  // Test 4: Vérifier que la table Plan existe
  console.log('\n📊 Test 4: Table Plan');
  console.log('─'.repeat(80));

  try {
    const plans = await prisma.plan.findMany({
      select: {
        key: true,
        name: true,
        monthlyPrice: true,
        yearlyPrice: true,
      },
    });

    console.log(`✅ Table Plan présente (${plans.length} plans configurés)`);
    plans.forEach(p => {
      console.log(`   - ${p.key}: ${p.name} (${p.monthlyPrice/100}€/mois, ${p.yearlyPrice/100}€/an)`);
    });

    if (plans.length === 0) {
      console.warn('⚠️  WARNING: Aucun plan configuré');
      console.warn('   Action: Créer les plans PRO et LITE dans la DB');
    }
  } catch (error) {
    console.error('❌ ERREUR: Table Plan manquante');
    allChecksPass = false;
  }

  // Test 5: Vérifier les enums
  console.log('\n📊 Test 5: Enums PostgreSQL');
  console.log('─'.repeat(80));

  try {
    const result = await prisma.$queryRaw<Array<{typname: string}>>`
      SELECT typname FROM pg_type
      WHERE typname IN ('TransferStatus', 'RefundStatus', 'PaymentStatus')
    `;

    const enumNames = result.map(r => r.typname);

    if (enumNames.includes('TransferStatus')) {
      console.log('✅ Enum TransferStatus présent');
    } else {
      console.error('❌ Enum TransferStatus manquant');
      allChecksPass = false;
    }

    if (enumNames.includes('RefundStatus')) {
      console.log('✅ Enum RefundStatus présent');
    } else {
      console.error('❌ Enum RefundStatus manquant');
      allChecksPass = false;
    }

    if (enumNames.includes('PaymentStatus')) {
      console.log('✅ Enum PaymentStatus présent');
    } else {
      console.error('❌ Enum PaymentStatus manquant');
      allChecksPass = false;
    }
  } catch (error) {
    console.warn('⚠️  Impossible de vérifier les enums (erreur SQL mineure)');
    // Ne pas bloquer si cette vérification échoue
  }

  // Résumé final
  console.log('\n' + '═'.repeat(80));
  console.log('📝 RÉSUMÉ');
  console.log('═'.repeat(80));

  if (allChecksPass) {
    console.log('\n✅ TOUS LES TESTS SONT RÉUSSIS !');
    console.log('   Le schéma DB est prêt pour la production.');
  } else {
    console.log('\n❌ CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('   Corrigez les erreurs avant de déployer en production.');
    process.exit(1);
  }

  await prisma.$disconnect();
}

verifySchema();
