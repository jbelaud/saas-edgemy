import Stripe from 'stripe';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { ReservationType } from '@/lib/stripe/types';
import { Prisma, type CoachingPackage } from '@prisma/client';
import { createOrReuseDiscordChannel, DiscordChannelError } from '@/lib/discord/channel';
import type { DiscordChannelReservation } from '@/lib/discord/channel';
import { sendSessionReminderDM } from '@/lib/discord/messages';
import { ensureMemberRole } from '@/lib/discord/roles';
import { checkLowMargin } from '@/lib/stripe/alerts';
import { sendEmail } from '@/lib/email/brevo';
import { generateSessionConfirmationEmail, generateCoachSessionNotificationEmail } from '@/lib/email/templates';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const reservationSelect = Prisma.validator<Prisma.ReservationSelect>()({
  id: true,
  type: true,
  priceCents: true,
  coachId: true,
  playerId: true,
  packId: true,
  commissionCents: true,
  coachNetCents: true,
  stripeFeeCents: true,
  edgemyFeeCents: true,
  serviceFeeCents: true,
  sessionsCount: true,
  startDate: true,
  endDate: true,
  discordChannelId: true,
  announcementId: true,
  stripePaymentId: true,
  status: true,
  paymentStatus: true,
  coach: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      timezone: true,
      user: {
        select: {
          id: true,
          email: true,
          discordId: true,
        },
      },
    },
  },
  player: {
    select: {
      id: true,
      name: true,
      email: true,
      discordId: true,
    },
  },
  announcement: {
    select: {
      title: true,
      durationMin: true,
    },
  },
  pack: {
    select: {
      hours: true,
    },
  },
});

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  if (!sig) {
    console.error('Webhook error: Missing stripe-signature header');
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Webhook error: STRIPE_WEBHOOK_SECRET not configured');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification error:', message);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  // Traiter les événements Stripe
  try {
    const eventType = event.type as string;

    switch (eventType) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const coachId = session.metadata?.coachId;
        const reservationId = session.metadata?.reservationId;
        const sessionType = session.metadata?.type;

        console.log(`📋 Checkout session - mode: ${session.mode}, coachId: ${coachId}, reservationId: ${reservationId}, type: ${sessionType}`);

        // Cas 1: C'est un abonnement coach
        if (coachId && session.mode === 'subscription') {
          console.log(`✅ Checkout session complétée pour abonnement coach ${coachId}`);

          // Si c'est un changement de plan, annuler l'ancien abonnement
          if (sessionType === 'plan_change' && session.metadata?.oldSubscriptionId) {
            const oldSubscriptionId = session.metadata.oldSubscriptionId;
            try {
              await stripe.subscriptions.cancel(oldSubscriptionId);
              console.log(`✅ Ancien abonnement ${oldSubscriptionId} annulé suite au changement de plan`);
            } catch (error) {
              console.error(`❌ Erreur lors de l'annulation de l'ancien abonnement ${oldSubscriptionId}:`, error);
            }
          }

          // L'abonnement sera géré par customer.subscription.created/updated
          break;
        }

        // Cas 2: C'est une réservation (NOUVEAU SYSTÈME - Gel des fonds)
        if (reservationId) {
          const reservationType = (session.metadata?.type || 'SINGLE') as ReservationType;

          console.log(`✅ Checkout session complétée pour la réservation ${reservationId} (${reservationType})`);
          console.log(`🔒 NOUVEAU SYSTÈME: Argent GELÉ - Pas de transfer immédiat`);

          // Récupérer la réservation pour obtenir le montant
          const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            select: reservationSelect,
          });

          if (!reservation) {
            console.error(`❌ Réservation ${reservationId} introuvable`);
            return new Response('Reservation not found', { status: 404 });
          }

          const playerProfile = await prisma.player.findUnique({
            where: { userId: reservation.playerId },
            select: {
              firstName: true,
              lastName: true,
              timezone: true,
            },
          });

          const metadata = session.metadata ?? {};
          const parseMetadataInt = (key: string): number | null => {
            const raw = metadata[key];
            if (raw === undefined || raw === null || raw === '') {
              return null;
            }
            const value = Number.parseInt(raw, 10);
            return Number.isFinite(value) ? value : null;
          };

          const sessionsCountFallback = reservation.pack?.hours ?? 0;

          const isPackageMetadata = metadata.isPackage === 'true' ? true : metadata.isPackage === 'false' ? false : undefined;
          const isPackage = isPackageMetadata ?? reservation.type === 'PACK';

          const reservationCoachNetCents = reservation.coachNetCents ?? reservation.priceCents;
          const reservationStripeFeeCents = reservation.stripeFeeCents ?? 0;
          const reservationEdgemyFeeCents = reservation.edgemyFeeCents ?? reservation.commissionCents ?? 0;
          const reservationServiceFeeCents = reservation.serviceFeeCents ?? reservationStripeFeeCents + reservationEdgemyFeeCents;
          const reservationSessionsCount = reservation.sessionsCount ?? sessionsCountFallback;

          const coachNetCents = parseMetadataInt('coachNetCents') ?? reservationCoachNetCents;
          const stripeFeeCents = parseMetadataInt('stripeFeeCents') ?? reservationStripeFeeCents;
          const edgemyFeeCents = parseMetadataInt('edgemyFeeCents') ?? reservationEdgemyFeeCents;
          const serviceFeeCents = parseMetadataInt('serviceFeeCents') ?? reservationServiceFeeCents;
          const totalCustomerCents = parseMetadataInt('totalCustomerCents') ?? coachNetCents + serviceFeeCents;
          const sessionsCountFromMetadata = parseMetadataInt('sessionsCount');
          const sessionsCountValue = isPackage
            ? (sessionsCountFromMetadata ?? reservationSessionsCount)
            : 0;
          const sessionPayoutCents = parseMetadataInt('sessionPayoutCents')
            ?? (isPackage && sessionsCountValue > 0
              ? Math.floor(coachNetCents / sessionsCountValue)
              : coachNetCents);
          const packMetadataId = metadata.packId && metadata.packId.length > 0 ? metadata.packId : null;

          console.log('💰 Ventilation paiement:', {
            coachNetCents,
            stripeFeeCents,
            edgemyFeeCents,
            serviceFeeCents,
            totalCustomerCents,
            isPackage,
            sessionsCountValue,
            sessionPayoutCents,
            packMetadataId,
          });

          const stripePaymentId =
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id ?? null;

          // Calcul TVA Edgemy (20% en France)
          const VAT_RATE_FRANCE = 0.20;
          const edgemyRevenueHT = edgemyFeeCents;
          const edgemyRevenueTVACents = Math.round(edgemyRevenueHT * VAT_RATE_FRANCE);

          const reservationUpdateData: Prisma.ReservationUncheckedUpdateInput = {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
            stripePaymentId: stripePaymentId ?? undefined,
            stripeSessionId: session.id,
            commissionCents: edgemyFeeCents,
            coachEarningsCents: coachNetCents,
            coachNetCents,
            stripeFeeCents,
            edgemyFeeCents,
            serviceFeeCents,
            edgemyRevenueHT,
            edgemyRevenueTVACents,
            isPackage,
            sessionsCount: isPackage ? sessionsCountValue : null,
            transferStatus: 'PENDING',
          };

          await prisma.reservation.update({
            where: { id: reservationId },
            data: reservationUpdateData,
          });

          // 🔐 Vérifier et alerter si marge anormale
          await checkLowMargin(reservationId, edgemyFeeCents, totalCustomerCents);

          console.log(`✅ Réservation ${reservationId} marquée comme PAID et CONFIRMED`);
          console.log(`⏳ transferStatus: PENDING - Le transfer sera fait via /api/reservations/${reservationId}/complete`);

          // Envoi des emails de confirmation
          const formatCurrency = (cents: number) => {
            return new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            }).format(cents / 100);
          };

          const formatDate = (date: Date) => {
            return new Intl.DateTimeFormat('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }).format(date);
          };

          const formatTime = (date: Date) => {
            return new Intl.DateTimeFormat('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short',
            }).format(date);
          };

          const playerEmail = reservation.player?.email;
          const playerName = reservation.player?.name || 'Joueur';
          const coachEmail = reservation.coach?.user?.email;
          const coachName = `${reservation.coach?.firstName || ''} ${reservation.coach?.lastName || ''}`.trim();
          const sessionTitle = reservation.announcement?.title || 'Session de coaching';
          const duration = reservation.announcement?.durationMin || 60;

          // Email au joueur
          if (playerEmail) {
            try {
              const playerEmailData = generateSessionConfirmationEmail({
                playerName,
                coachName,
                sessionTitle,
                sessionDate: formatDate(reservation.startDate),
                sessionTime: formatTime(reservation.startDate),
                duration,
                amount: formatCurrency(totalCustomerCents),
                isPackage,
                sessionsCount: sessionsCountValue > 0 ? sessionsCountValue : undefined,
                sessionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/fr/player/sessions`,
              });

              const emailSent = await sendEmail({
                to: playerEmail,
                toName: playerName,
                subject: `🎉 Réservation confirmée - ${sessionTitle}`,
                htmlContent: playerEmailData.html,
                textContent: playerEmailData.text,
              });

              if (emailSent) {
                console.log(`✅ Email de confirmation envoyé au joueur: ${playerEmail}`);
              } else {
                console.error(`❌ Échec de l'envoi de l'email au joueur: ${playerEmail}`);
              }
            } catch (error) {
              console.error(`❌ Erreur lors de l'envoi de l'email au joueur:`, error);
            }
          }

          // Email au coach
          if (coachEmail) {
            try {
              const coachEmailData = generateCoachSessionNotificationEmail({
                coachName,
                playerName,
                sessionTitle,
                sessionDate: formatDate(reservation.startDate),
                sessionTime: formatTime(reservation.startDate),
                duration,
                amount: formatCurrency(coachNetCents),
                isPackage,
                sessionsCount: sessionsCountValue > 0 ? sessionsCountValue : undefined,
                sessionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/fr/coach/sessions`,
              });

              const emailSent = await sendEmail({
                to: coachEmail,
                toName: coachName,
                subject: `💰 Nouvelle réservation - ${playerName}`,
                htmlContent: coachEmailData.html,
                textContent: coachEmailData.text,
              });

              if (emailSent) {
                console.log(`✅ Email de notification envoyé au coach: ${coachEmail}`);
              } else {
                console.error(`❌ Échec de l'envoi de l'email au coach: ${coachEmail}`);
              }
            } catch (error) {
              console.error(`❌ Erreur lors de l'envoi de l'email au coach:`, error);
            }
          }

          if (isPackage) {
            const existingSession = await prisma.packageSession.findUnique({
              where: { reservationId },
              include: {
                package: true,
              },
            });

            const sessionsTotalCount = sessionsCountValue > 0
              ? sessionsCountValue
              : reservationSessionsCount;
            const totalHours = reservation.pack?.hours ?? sessionsTotalCount;

            let coachingPackage: CoachingPackage | null = existingSession?.package ?? null;
            let shouldUpdateExistingPackage = Boolean(coachingPackage);

            if (!coachingPackage && stripePaymentId) {
              coachingPackage = await prisma.coachingPackage.findFirst({
                where: { stripePaymentId },
              });
              shouldUpdateExistingPackage = Boolean(coachingPackage);
            }

            if (!coachingPackage) {
              // Calculer la durée de la première session pour déduire les heures
              const durationMinutes = reservation.announcement?.durationMin
                ?? Math.max(0, Math.round((reservation.endDate.getTime() - reservation.startDate.getTime()) / 60000));
              const durationHours = durationMinutes / 60;

              const coachingPackageCreateData: Prisma.CoachingPackageUncheckedCreateInput = {
                playerId: reservation.playerId,
                coachId: reservation.coachId,
                announcementId: reservation.announcementId,
                totalHours,
                remainingHours: totalHours - durationHours, // ✅ Déduire la première session immédiatement
                priceCents: reservation.priceCents,
                stripePaymentId: stripePaymentId ?? undefined,
                status: 'ACTIVE',
                commissionCents: edgemyFeeCents,
                coachEarningsCents: coachNetCents,
                stripeFeeCents,
                edgemyFeeCents,
                serviceFeeCents,
                coachNetCents,
                sessionPayoutCents,
                sessionsCompletedCount: 0,
                sessionsTotalCount,
              };

              coachingPackage = await prisma.coachingPackage.create({
                data: coachingPackageCreateData,
              });
              shouldUpdateExistingPackage = false;

              console.log(`✅ CoachingPackage créé avec ${totalHours}h total, ${totalHours - durationHours}h restantes (première session de ${durationHours}h déduite)`);
            }

            if (!existingSession && coachingPackage) {
              const durationMinutes = reservation.announcement?.durationMin
                ?? Math.max(0, Math.round((reservation.endDate.getTime() - reservation.startDate.getTime()) / 60000));

              await prisma.packageSession.create({
                data: {
                  packageId: coachingPackage.id,
                  reservationId,
                  startDate: reservation.startDate,
                  endDate: reservation.endDate,
                  durationMinutes,
                  status: 'SCHEDULED',
                },
              });
              console.log(`🗓️ PackageSession créée pour la réservation ${reservationId}`);
            }

            if (coachingPackage && shouldUpdateExistingPackage) {
              const coachingPackageUpdateData: Prisma.CoachingPackageUncheckedUpdateInput = {
                stripePaymentId: stripePaymentId ?? coachingPackage.stripePaymentId ?? undefined,
                commissionCents: edgemyFeeCents,
                coachEarningsCents: coachNetCents,
                stripeFeeCents,
                edgemyFeeCents,
                serviceFeeCents,
                coachNetCents,
                sessionPayoutCents,
                sessionsTotalCount,
              };

              await prisma.coachingPackage.update({
                where: { id: coachingPackage.id },
                data: coachingPackageUpdateData,
              });
            }
          }

          const hasCoachDiscord = Boolean(reservation.coach?.user?.discordId);
          const hasPlayerDiscord = Boolean(reservation.player?.discordId);
          let discordChannelId: string | null = reservation.discordChannelId ?? null;
          let reservationSummary: DiscordChannelReservation = {
            id: reservation.id,
            startDate: reservation.startDate,
            endDate: reservation.endDate,
            coach: reservation.coach
              ? {
                  id: reservation.coach.id,
                  firstName: reservation.coach.firstName,
                  lastName: reservation.coach.lastName,
                  timezone: reservation.coach.timezone,
                  user: reservation.coach.user
                    ? {
                        id: reservation.coach.user.id,
                        discordId: reservation.coach.user.discordId,
                      }
                    : null,
                }
              : null,
            player: reservation.player
              ? {
                  id: reservation.player.id,
                  name: reservation.player.name,
                  firstName: playerProfile?.firstName ?? null,
                  lastName: playerProfile?.lastName ?? null,
                  discordId: reservation.player.discordId,
                }
              : null,
            announcement: reservation.announcement
              ? { title: reservation.announcement.title ?? null }
              : null,
            pack: reservation.pack
              ? { hours: reservation.pack.hours ?? null }
              : null,
          };

          if (hasCoachDiscord && hasPlayerDiscord) {
            try {
              const channelResult = await createOrReuseDiscordChannel({
                reservationId,
                initiatedBy: 'stripe-webhook',
              });
              discordChannelId = channelResult.textChannelId;
              reservationSummary = channelResult.reservation;
              console.log('[Discord] Canal prêt pour la réservation', reservationId);
            } catch (error) {
              if (error instanceof DiscordChannelError) {
                console.error('[Discord] Erreur création canal:', error.code, error.message);
              } else {
                console.error('[Discord] Erreur inattendue création canal:', error);
              }
            }
          } else {
            console.log('⚠️ Canal Discord non créé: comptes Discord manquants', {
              coachHasDiscord: hasCoachDiscord,
              playerHasDiscord: hasPlayerDiscord,
            });
          }

          const notifyRoles: Array<{
            role: 'player' | 'coach';
            discordId: string | null | undefined;
            assignRole: 'PLAYER' | 'COACH';
          }> = [
            { role: 'player', discordId: reservation.player?.discordId, assignRole: 'PLAYER' },
            { role: 'coach', discordId: reservation.coach?.user?.discordId, assignRole: 'COACH' },
          ];

          await Promise.all(
            notifyRoles.map(async ({ role, discordId, assignRole }) => {
              if (!discordId) {
                return;
              }

              try {
                const [sent] = await Promise.all([
                  sendSessionReminderDM({
                    discordId,
                    reservation: reservationSummary,
                    channelId: discordChannelId,
                    role,
                  }),
                  ensureMemberRole({ discordId, role: assignRole }),
                ]);

                if (sent) {
                  console.log(`[Discord] DM ${role} envoyé pour la réservation ${reservationId}`);
                } else {
                  console.warn(`[Discord] DM ${role} non envoyé pour la réservation ${reservationId}`);
                }
              } catch (error) {
                console.error(`[Discord] Erreur traitement notification ${role}:`, error);
              }
            }),
          );
        } else {
          console.log(`ℹ️ Checkout session complétée sans reservationId ni coachId`);
        }

        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`✅ Payment intent réussi: ${paymentIntent.id}`);

        // Récupérer la session associée pour obtenir la reservationId
        if (paymentIntent.metadata?.reservationId) {
          const reservationId = paymentIntent.metadata.reservationId;

          await prisma.reservation.update({
            where: { id: reservationId },
            data: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
              stripePaymentId: paymentIntent.id,
            },
          });

          console.log(`✅ Réservation ${reservationId} confirmée via payment_intent.succeeded`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`✅ Facture payée: ${invoice.id}`);

        // Gérer les paiements de factures (utile pour les abonnements futurs)
        // Pour l'instant, on log juste l'événement
        if (invoice.metadata?.reservationId) {
          const reservationId = invoice.metadata.reservationId;

          await prisma.reservation.update({
            where: { id: reservationId },
            data: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
            },
          });

          console.log(`✅ Réservation ${reservationId} payée via facture`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(`❌ Paiement échoué: ${paymentIntent.id}`);
        console.error(`Raison: ${paymentIntent.last_payment_error?.message || 'Inconnue'}`);

        // Marquer la réservation comme échouée
        if (paymentIntent.metadata?.reservationId) {
          const reservationId = paymentIntent.metadata.reservationId;

          await prisma.reservation.update({
            where: { id: reservationId },
            data: {
              paymentStatus: 'FAILED',
              status: 'CANCELLED',
            },
          });

          console.log(`❌ Réservation ${reservationId} annulée suite à l'échec du paiement`);
        }
        break;
      }

      // ========================================
      // ÉVÉNEMENTS D'ABONNEMENT COACH
      // ========================================

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const coachId = subscription.metadata?.coachId;

        if (!coachId) {
          console.log(`ℹ️ Abonnement sans metadata coachId: ${subscription.id}`);
          break;
        }

        const planType = subscription.metadata?.plan as 'MONTHLY' | 'YEARLY' || 'MONTHLY';
        const planKey = subscription.metadata?.planKey as 'PRO' | 'LITE' || 'PRO';
        const status = subscription.status;

        // Mapper les statuts Stripe vers nos statuts
        let subscriptionStatus: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | 'TRIALING';
        switch (status) {
          case 'active':
            subscriptionStatus = 'ACTIVE';
            break;
          case 'past_due':
            subscriptionStatus = 'PAST_DUE';
            break;
          case 'incomplete':
          case 'incomplete_expired':
            subscriptionStatus = 'INCOMPLETE';
            break;
          case 'trialing':
            subscriptionStatus = 'TRIALING';
            break;
          case 'canceled':
          case 'unpaid':
            subscriptionStatus = 'CANCELED';
            break;
          default:
            subscriptionStatus = 'ACTIVE';
        }

        const periodEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end;

        await prisma.coach.update({
          where: { id: coachId },
          data: {
            subscriptionId: subscription.id,
            subscriptionStatus,
            subscriptionPlan: planType,
            planKey: planKey, // Ajouter le planKey (PRO ou LITE)
            currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
          },
        });

        console.log(`✅ Abonnement coach mis à jour: ${coachId} - ${subscriptionStatus} (Plan ${planKey} ${planType})`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const coachId = subscription.metadata?.coachId;

        if (!coachId) {
          console.log(`ℹ️ Abonnement supprimé sans metadata coachId: ${subscription.id}`);
          break;
        }

        const periodEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end;

        await prisma.coach.update({
          where: { id: coachId },
          data: {
            subscriptionStatus: 'CANCELED',
            currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
          },
        });

        console.log(`✅ Abonnement coach annulé: ${coachId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as Stripe.Invoice & { subscription?: string }).subscription;

        if (subscriptionId) {
          console.error(`❌ Échec paiement facture abonnement: ${subscriptionId}`);

          // Récupérer le coach concerné
          const coach = await prisma.coach.findFirst({
            where: { subscriptionId: subscriptionId as string },
          });

          if (coach) {
            // Mettre à jour le statut à PAST_DUE
            await prisma.coach.update({
              where: { id: coach.id },
              data: {
                subscriptionStatus: 'PAST_DUE',
              },
            });

            console.log(`⚠️ Coach ${coach.id} mis en statut PAST_DUE suite à l'échec de paiement`);
            // TODO: Envoyer email au coach pour mettre à jour son moyen de paiement
            // TODO: Créer workflow Stripe pour rappels automatiques
          }
        }
        break;
      }

      // ========================================
      // ÉVÉNEMENTS DE TRANSFER (NOUVEAU SYSTÈME)
      // ========================================

      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer;
        console.log(`📤 Transfer créé: ${transfer.id} - ${transfer.amount / 100}€`);

        // Le TransferLog est déjà créé par notre fonction createStripeTransfer()
        // On log juste l'événement ici
        break;
      }

      case 'transfer.paid': {
        const transfer = event.data.object as Stripe.Transfer;
        console.log(`✅ Transfer payé: ${transfer.id} - ${transfer.amount / 100}€`);

        // Mettre à jour le statut du transfer dans nos logs
        await prisma.transferLog.updateMany({
          where: { stripeTransferId: transfer.id },
          data: { status: 'paid' },
        });

        break;
      }

      case 'transfer.failed': {
        const transfer = event.data.object as Stripe.Transfer;
        console.error(`❌ Transfer échoué: ${transfer.id}`);

        // Mettre à jour le statut
        await prisma.transferLog.updateMany({
          where: { stripeTransferId: transfer.id },
          data: { status: 'failed' },
        });

        // Mettre à jour la réservation
        const transferLog = await prisma.transferLog.findFirst({
          where: { stripeTransferId: transfer.id },
        });

        if (transferLog) {
          await prisma.reservation.update({
            where: { id: transferLog.reservationId },
            data: { transferStatus: 'FAILED' },
          });
        }

        // TODO: Envoyer alerte admin
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log(`💸 Remboursement effectué: ${charge.id}`);

        // Les RefundLog sont déjà créés par nos fonctions de remboursement
        // On log juste l'événement ici pour confirmation
        break;
      }

      default:
        console.log(`ℹ️ Événement non géré: ${event.type}`);
    }

    return new Response('ok', { status: 200 });
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    return new Response(
      `Webhook handler error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
}
