/**
 * Script de backfill des champs TVA pour les réservations existantes
 *
 * Calcule et remplit edgemyRevenueHT et edgemyRevenueTVACents pour toutes les réservations
 * où ces champs sont NULL.
 *
 * Formule:
 * - edgemyRevenueHT = edgemyFeeCents (marge nette après frais Stripe)
 * - edgemyRevenueTVACents = edgemyRevenueHT * 0.20 (TVA 20% en France)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const VAT_RATE_FRANCE = 0.20; // 20%

async function backfillVATFields() {
  try {
    console.log('🔍 Recherche des réservations sans champs TVA...');

    // Trouver toutes les réservations où edgemyRevenueHT est NULL
    const reservationsToUpdate = await prisma.reservation.findMany({
      where: {
        OR: [
          { edgemyRevenueHT: null },
          { edgemyRevenueTVACents: null }
        ]
      },
      select: {
        id: true,
        edgemyFeeCents: true,
        edgemyRevenueHT: true,
        edgemyRevenueTVACents: true,
        paymentStatus: true,
        createdAt: true
      }
    });

    console.log(`📊 Trouvé ${reservationsToUpdate.length} réservations à mettre à jour`);

    if (reservationsToUpdate.length === 0) {
      console.log('✅ Toutes les réservations ont déjà les champs TVA remplis');
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const reservation of reservationsToUpdate) {
      // Calculer les champs TVA
      const edgemyRevenueHT = reservation.edgemyFeeCents; // Marge nette = revenu HT
      const edgemyRevenueTVACents = Math.round(edgemyRevenueHT * VAT_RATE_FRANCE);

      try {
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: {
            edgemyRevenueHT,
            edgemyRevenueTVACents
          }
        });

        updatedCount++;

        if (updatedCount % 10 === 0) {
          console.log(`⏳ Traité ${updatedCount}/${reservationsToUpdate.length} réservations...`);
        }
      } catch (error) {
        console.error(`❌ Erreur mise à jour réservation ${reservation.id}:`, error);
        skippedCount++;
      }
    }

    console.log('\n✅ Backfill terminé !');
    console.log(`   - Réservations mises à jour: ${updatedCount}`);
    console.log(`   - Réservations ignorées: ${skippedCount}`);

    // Afficher quelques statistiques
    const stats = await prisma.reservation.aggregate({
      _sum: {
        edgemyRevenueHT: true,
        edgemyRevenueTVACents: true
      },
      _count: {
        id: true
      },
      where: {
        edgemyRevenueHT: { not: null }
      }
    });

    console.log('\n📊 Statistiques globales:');
    console.log(`   - Total réservations avec TVA: ${stats._count.id}`);
    console.log(`   - Revenu Edgemy HT total: ${(stats._sum.edgemyRevenueHT ?? 0) / 100}€`);
    console.log(`   - TVA Edgemy totale: ${(stats._sum.edgemyRevenueTVACents ?? 0) / 100}€`);
    console.log(`   - CA Edgemy TTC total: ${((stats._sum.edgemyRevenueHT ?? 0) + (stats._sum.edgemyRevenueTVACents ?? 0)) / 100}€`);

  } catch (error) {
    console.error('❌ Erreur lors du backfill:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
backfillVATFields();
