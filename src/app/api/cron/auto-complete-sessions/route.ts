import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  transferForCompletedSession,
  transferPackInstallment,
} from '@/lib/stripe/transfer';
import { isSessionCompleted } from '@/lib/stripe/business-rules';

/**
 * Endpoint cron pour transférer automatiquement les fonds aux coachs
 * après la fin de leurs sessions.
 *
 * Logique:
 * 1. Trouve toutes les sessions terminées (endDate passée)
 * 2. Avec transferStatus = PENDING
 * 3. Avec paymentStatus = PAID
 * 4. Crée automatiquement le transfert Stripe vers le coach
 *
 * Configuration Vercel Cron dans vercel.json:
 * - Exécution toutes les heures
 * - Détecte et transfère automatiquement
 *
 * Sécurité:
 * - Vérifie le CRON_SECRET
 * - Valide que la session est bien terminée
 * - Ne transfère que si PENDING (pas de double transfert)
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'autorisation cron (clé secrète obligatoire)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // SÉCURITÉ: Toujours exiger le CRON_SECRET en production
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error('🚫 Accès cron non autorisé - CRON_SECRET manquant ou invalide');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🤖 [CRON] Début de l\'auto-complétion des sessions...');

    const now = new Date();

    // Trouver toutes les sessions:
    // - Terminées (endDate passée)
    // - Payées (paymentStatus = PAID)
    // - En attente de transfert (transferStatus = PENDING)
    // - Coach a un vrai compte Stripe (pas acct_mock_)
    const completedSessions = await prisma.reservation.findMany({
      where: {
        paymentStatus: 'PAID',
        transferStatus: 'PENDING',
        endDate: {
          lt: now, // Session terminée
        },
        coach: {
          stripeAccountId: {
            not: {
              startsWith: 'acct_mock_',
            },
          },
        },
      },
      select: {
        id: true,
        type: true,
        startDate: true,
        endDate: true,
        coachNetCents: true,
        packId: true,
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            stripeAccountId: true,
          },
        },
        player: {
          select: {
            id: true,
            name: true,
          },
        },
        announcement: {
          select: {
            title: true,
          },
        },
        packageSession: {
          select: {
            id: true,
            packageId: true,
          },
        },
      },
    });

    if (completedSessions.length === 0) {
      console.log('✅ [CRON] Aucune session à compléter automatiquement');
      return NextResponse.json({
        success: true,
        message: 'Aucune session à compléter',
        processed: 0,
      });
    }

    console.log(`📋 [CRON] ${completedSessions.length} session(s) trouvée(s) à compléter`);

    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    // Traiter chaque session
    for (const session of completedSessions) {
      try {
        console.log(`\n🔄 [CRON] Traitement réservation ${session.id}`);
        console.log(`   Coach: ${session.coach.firstName} ${session.coach.lastName}`);
        console.log(`   Joueur: ${session.player.name}`);
        console.log(`   Session: ${session.announcement?.title || 'N/A'}`);
        console.log(`   Type: ${session.type}`);
        console.log(`   Montant: ${(session.coachNetCents / 100).toFixed(2)}€`);

        // Vérification de sécurité: session vraiment terminée
        if (!isSessionCompleted(session.endDate)) {
          const error = 'Session pas encore terminée (vérification sécurité)';
          console.error(`   ❌ ${error}`);
          results.failed.push({ id: session.id, error });
          continue;
        }

        // Vérifier que le coach a un compte Stripe valide
        if (
          !session.coach.stripeAccountId ||
          session.coach.stripeAccountId.startsWith('acct_mock_')
        ) {
          const error = 'Coach sans compte Stripe Connect valide';
          console.error(`   ❌ ${error}`);
          results.failed.push({ id: session.id, error });
          continue;
        }

        // Créer le transfert selon le type de session
        let transferResult;

        if (session.type === 'PACK') {
          if (!session.packId || !session.packageSession) {
            const error = 'Pack ou session de pack introuvable';
            console.error(`   ❌ ${error}`);
            results.failed.push({ id: session.id, error });
            continue;
          }

          console.log(`   📦 Transfert pack - Session ${session.packageSession.id}`);
          transferResult = await transferPackInstallment({
            reservationId: session.id,
            packageId: session.packageSession.packageId,
            packageSessionId: session.packageSession.id,
          });
        } else {
          console.log(`   💰 Transfert session unique`);
          transferResult = await transferForCompletedSession(session.id);
        }

        if (!transferResult.success) {
          console.error(`   ❌ Échec transfert: ${transferResult.error}`);
          results.failed.push({
            id: session.id,
            error: transferResult.error || 'Erreur inconnue',
          });
          continue;
        }

        console.log(`   ✅ Transfert réussi: ${transferResult.transferId}`);
        console.log(`   💸 Montant transféré: ${((transferResult.amount || session.coachNetCents) / 100).toFixed(2)}€`);

        results.success.push(session.id);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error(`   ❌ Erreur lors du traitement de ${session.id}:`, errorMessage);
        results.failed.push({
          id: session.id,
          error: errorMessage,
        });
      }
    }

    console.log(`\n✅ [CRON] Auto-complétion terminée`);
    console.log(`   Succès: ${results.success.length}/${completedSessions.length}`);
    console.log(`   Échecs: ${results.failed.length}/${completedSessions.length}`);

    return NextResponse.json({
      success: true,
      message: `${results.success.length} session(s) complétée(s) automatiquement`,
      processed: completedSessions.length,
      successful: results.success.length,
      failed: results.failed.length,
      details: {
        success: results.success,
        failed: results.failed,
      },
    });
  } catch (error) {
    console.error('❌ [CRON] Erreur critique dans auto-complete-sessions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
