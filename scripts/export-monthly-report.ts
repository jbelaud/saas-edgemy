/**
 * Script d'export du rapport mensuel en CSV
 *
 * Usage: npx tsx scripts/export-monthly-report.ts 2025-01
 */

import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';

const prisma = new PrismaClient();

async function exportMonthlyReport(monthParam: string) {
  if (!/^\d{4}-\d{2}$/.test(monthParam)) {
    console.error('❌ Format de mois invalide. Utilisez YYYY-MM');
    process.exit(1);
  }

  const [year, month] = monthParam.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  console.log(`📊 Export rapport ${monthParam}`);
  console.log(`   Du ${startDate.toISOString()} au ${endDate.toISOString()}`);

  // Récupérer toutes les réservations du mois
  const reservations = await prisma.reservation.findMany({
    where: {
      paymentStatus: 'PAID',
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      coach: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          planKey: true,
        },
      },
      player: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  console.log(`✅ Trouvé ${reservations.length} réservations`);

  // Générer CSV
  const csvHeader = [
    'Date',
    'Type',
    'Coach ID',
    'Coach Name',
    'Player ID',
    'Player Email',
    'Prix Coach (€)',
    'Frais Joueur (€)',
    'Total Joueur (€)',
    'Frais Stripe (€)',
    'Revenu Edgemy HT (€)',
    'TVA Edgemy (€)',
    'Revenu Edgemy TTC (€)',
    'Status Transfer',
    'Plan Coach',
  ].join(',');

  const csvRows = reservations.map((r) => [
    new Date(r.createdAt).toISOString().split('T')[0],
    r.type,
    r.coach.id,
    `"${r.coach.firstName} ${r.coach.lastName}"`,
    r.player.id,
    r.player.email || 'N/A',
    (r.priceCents / 100).toFixed(2),
    (r.serviceFeeCents / 100).toFixed(2),
    ((r.priceCents + r.serviceFeeCents) / 100).toFixed(2),
    (r.stripeFeeCents / 100).toFixed(2),
    ((r.edgemyRevenueHT ?? 0) / 100).toFixed(2),
    ((r.edgemyRevenueTVACents ?? 0) / 100).toFixed(2),
    (((r.edgemyRevenueHT ?? 0) + (r.edgemyRevenueTVACents ?? 0)) / 100).toFixed(2),
    r.transferStatus,
    r.coach.planKey,
  ].join(','));

  const csv = [csvHeader, ...csvRows].join('\n');

  // Sauvegarder le fichier
  const filename = `rapport_${monthParam}.csv`;
  writeFileSync(filename, csv);

  console.log(`✅ Rapport exporté: ${filename}`);

  // Afficher résumé
  const totalRevenuHT = reservations.reduce((sum, r) => sum + (r.edgemyRevenueHT ?? 0), 0) / 100;
  const totalTVA = reservations.reduce((sum, r) => sum + (r.edgemyRevenueTVACents ?? 0), 0) / 100;
  const totalRevenuTTC = totalRevenuHT + totalTVA;

  console.log('\n📈 RÉSUMÉ:');
  console.log(`   Transactions: ${reservations.length}`);
  console.log(`   Revenu Edgemy HT: ${totalRevenuHT.toFixed(2)}€`);
  console.log(`   TVA Edgemy: ${totalTVA.toFixed(2)}€`);
  console.log(`   Revenu Edgemy TTC: ${totalRevenuTTC.toFixed(2)}€`);

  await prisma.$disconnect();
}

// Exécuter
const monthArg = process.argv[2];

if (!monthArg) {
  console.error('Usage: npx tsx scripts/export-monthly-report.ts YYYY-MM');
  process.exit(1);
}

exportMonthlyReport(monthArg);
