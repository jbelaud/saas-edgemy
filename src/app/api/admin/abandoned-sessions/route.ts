import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/abandoned-sessions
 * 
 * Récupère les sessions abandonnées, non payées ou incomplètes
 * pour le dashboard admin.
 * 
 * Types de sessions retournées :
 * - PENDING avec paymentStatus PENDING (jamais payées)
 * - CONFIRMED avec paymentStatus PENDING (confirmées mais pas payées - bug)
 * - CONFIRMED avec paymentStatus FAILED (paiement échoué)
 * - Sessions passées avec paymentStatus PENDING (abandonnées)
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const now = new Date();

    // Récupérer les sessions abandonnées/non payées
    const abandonedSessions = await prisma.reservation.findMany({
      where: {
        OR: [
          // Sessions jamais payées (PENDING)
          {
            status: 'PENDING',
            paymentStatus: 'PENDING',
          },
          // Sessions confirmées mais pas payées (bug potentiel)
          {
            status: 'CONFIRMED',
            paymentStatus: 'PENDING',
          },
          // Sessions avec paiement échoué
          {
            paymentStatus: 'FAILED',
          },
          // Sessions passées non payées (abandonnées)
          {
            endDate: { lt: now },
            paymentStatus: 'PENDING',
            status: { not: 'CANCELLED' },
          },
        ],
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        type: true,
        priceCents: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        stripeSessionId: true,
        stripePaymentId: true,
        player: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        announcement: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limiter à 100 résultats
    });

    // Catégoriser les sessions
    const categorized = {
      pending: abandonedSessions.filter(s => s.status === 'PENDING' && s.paymentStatus === 'PENDING'),
      failed: abandonedSessions.filter(s => s.paymentStatus === 'FAILED'),
      abandoned: abandonedSessions.filter(s => 
        s.endDate < now && 
        s.paymentStatus === 'PENDING' && 
        s.status !== 'PENDING' && 
        s.status !== 'CANCELLED'
      ),
      buggy: abandonedSessions.filter(s => 
        s.status === 'CONFIRMED' && 
        s.paymentStatus === 'PENDING' &&
        !s.stripePaymentId
      ),
    };

    // Calculer les stats
    const stats = {
      total: abandonedSessions.length,
      pending: categorized.pending.length,
      failed: categorized.failed.length,
      abandoned: categorized.abandoned.length,
      buggy: categorized.buggy.length,
      totalLostRevenue: abandonedSessions.reduce((sum, s) => sum + (s.priceCents || 0), 0) / 100,
    };

    return NextResponse.json({
      sessions: abandonedSessions,
      categorized,
      stats,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions abandonnées:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
