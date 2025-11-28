import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Endpoint cron pour nettoyer les réservations PENDING expirées (>15 minutes)
 * À appeler toutes les 5-10 minutes via Vercel Cron ou autre service
 *
 * Configuration Vercel Cron dans vercel.json
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'autorisation (clé secrète ou Vercel Cron header)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    // Trouver toutes les réservations PENDING de plus de 15 minutes
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        status: 'PENDING',
        paymentStatus: 'PENDING',
        createdAt: {
          lt: fifteenMinutesAgo,
        },
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    if (expiredReservations.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucune réservation expirée à nettoyer',
        cleaned: 0,
      });
    }

    // Annuler ces réservations
    const result = await prisma.reservation.updateMany({
      where: {
        id: {
          in: expiredReservations.map(r => r.id),
        },
      },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'FAILED',
      },
    });

    console.log(`🧹 Nettoyage: ${result.count} réservations PENDING expirées annulées`);

    return NextResponse.json({
      success: true,
      message: `${result.count} réservations expirées nettoyées`,
      cleaned: result.count,
      reservations: expiredReservations.map(r => ({
        id: r.id,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('❌ Erreur nettoyage réservations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors du nettoyage',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
