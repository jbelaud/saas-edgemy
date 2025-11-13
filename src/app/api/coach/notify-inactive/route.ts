import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/brevo';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    console.log('🔔 === DÉBUT NOTIFICATION COACH INACTIF ===');

    const { coachId } = await request.json();
    console.log('🔔 Coach ID reçu:', coachId);

    if (!coachId) {
      console.log('❌ Pas de coachId fourni');
      return NextResponse.json(
        { error: 'Coach ID requis' },
        { status: 400 }
      );
    }

    // Récupérer les informations du joueur connecté (s'il l'est)
    console.log('🔔 Récupération de la session utilisateur...');
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    console.log('🔔 Session:', {
      isAuthenticated: !!session?.user,
      userId: session?.user?.id || 'N/A'
    });

    if (!session?.user?.id) {
      console.log('❌ Utilisateur non authentifié');
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const playerId = session.user.id;

    // Vérifier si une notification existe déjà pour ce couple coach-joueur
    console.log('🔔 Vérification des notifications existantes...');
    const existingNotifications = await prisma.coachNotification.findMany({
      where: {
        coachId,
        playerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });

    const lastNotification = existingNotifications[0];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Si une notification existe et qu'elle a moins de 7 jours
    if (lastNotification && lastNotification.createdAt > sevenDaysAgo) {
      const daysSinceLastNotification = Math.floor(
        (now.getTime() - lastNotification.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysRemaining = 7 - daysSinceLastNotification;

      console.log('⏰ Notification trop récente:', {
        lastNotificationDate: lastNotification.createdAt,
        daysSince: daysSinceLastNotification,
        daysRemaining,
      });

      return NextResponse.json(
        {
          error: 'Notification trop récente',
          message: `Tu as déjà contacté ce coach il y a ${daysSinceLastNotification} jour(s). Tu pourras le relancer dans ${daysRemaining} jour(s).`,
          daysSinceLastNotification,
          daysRemaining,
        },
        { status: 429 } // Too Many Requests
      );
    }

    const isFollowUp = !!lastNotification;
    console.log('🔔 Type de notification:', isFollowUp ? 'RELANCE' : 'PREMIER CONTACT');

    // Récupérer le profil joueur
    console.log('🔔 Recherche du profil joueur...');
    const player = await prisma.player.findUnique({
      where: { userId: playerId },
      select: {
        firstName: true,
        lastName: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!player) {
      console.log('⚠️ Aucun profil joueur trouvé pour cet utilisateur');
      return NextResponse.json(
        { error: 'Profil joueur non trouvé' },
        { status: 404 }
      );
    }

    const playerInfo = {
      firstName: player.firstName,
      lastName: player.lastName,
      email: player.user.email,
    };
    console.log('✅ Profil joueur trouvé:', {
      name: `${player.firstName} ${player.lastName}`,
      email: player.user.email
    });

    // Récupérer les informations du coach
    console.log('🔔 Recherche du profil coach...');
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      include: {
        user: {
          select: {
            email: true,
            discordId: true,
          },
        },
      },
    });

    if (!coach || !coach.user) {
      console.log('❌ Coach non trouvé');
      return NextResponse.json(
        { error: 'Coach non trouvé' },
        { status: 404 }
      );
    }

    console.log('✅ Coach trouvé:', {
      id: coach.id,
      name: `${coach.firstName} ${coach.lastName}`,
      email: coach.user.email,
      hasDiscord: !!coach.user.discordId
    });

    // Email via Brevo
    const email = coach.user.email;
    let emailSent = false;

    if (email) {
      try {
        const playerName = `${playerInfo.firstName} ${playerInfo.lastName}`;
        const playerEmail = playerInfo.email;

        console.log('📧 Préparation de l\'email de notification...');
        console.log('📧 Type:', isFollowUp ? 'RELANCE' : 'PREMIER CONTACT');
        console.log('📧 Joueur:', playerName, `(${playerEmail})`);

        // Email différent selon le type de notification
        const emailSubject = isFollowUp
          ? `🔔 ${playerName} relance sa demande de contact !`
          : `🔔 ${playerName} est intéressé par ton profil Edgemy !`;

        const emailContent = isFollowUp
          ? `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #f97316; margin: 0;">Relance de ${coach.firstName} ! 🔔</h1>
              </div>

              <div style="background: linear-gradient(135deg, #f97316, #fb923c); padding: 25px; border-radius: 12px; color: white; margin-bottom: 25px;">
                <p style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">
                  ${playerName} relance sa demande de contact
                </p>
                <p style="margin: 0; font-size: 14px; opacity: 0.95;">Contact : ${playerEmail}</p>
              </div>

              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                ${playerName} t'avait déjà contacté et relance aujourd'hui sa demande pour réserver une session de coaching avec toi sur <strong>Edgemy</strong>.
              </p>

              <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #991b1b; font-weight: bold;">
                  ⚠️ Un joueur motivé t'attend !
                </p>
                <p style="margin: 5px 0 0 0; color: #991b1b;">
                  ${playerName} a relancé sa demande. C'est le moment de réactiver ton compte pour ne pas perdre cette opportunité.
                </p>
              </div>

              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-weight: bold;">
                  💡 N'oublie pas : ton compte est actuellement inactif
                </p>
                <p style="margin: 5px 0 0 0; color: #92400e;">
                  Pour recevoir des réservations, active ton abonnement sur Edgemy.
                </p>
              </div>

              <p style="font-size: 16px; line-height: 1.6;">
                <strong>Que faire maintenant ?</strong>
              </p>

              <ol style="font-size: 15px; line-height: 1.8;">
                <li>Connecte-toi à ton <a href="${process.env.NEXT_PUBLIC_APP_URL}/fr/coach/dashboard" style="color: #f97316; text-decoration: none; font-weight: bold;">tableau de bord coach</a></li>
                <li>Active ton abonnement (mensuel ou annuel)</li>
                <li>Recommence à coacher et gagner de l'argent !</li>
              </ol>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/fr/coach/settings"
                   style="display: inline-block; background-color: #f97316; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Activer mon abonnement
                </a>
              </div>

              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                À bientôt sur Edgemy !<br>
                L'équipe Edgemy
              </p>
            </div>
          `
          : `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #f97316; margin: 0;">Bonne nouvelle, ${coach.firstName} ! 🎉</h1>
              </div>

              <div style="background: linear-gradient(135deg, #f97316, #fb923c); padding: 25px; border-radius: 12px; color: white; margin-bottom: 25px;">
                <p style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">
                  ${playerName} est intéressé par ton profil !
                </p>
                <p style="margin: 0; font-size: 14px; opacity: 0.95;">Contact : ${playerEmail}</p>
              </div>

              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                ${playerName} a consulté ton profil sur <strong>Edgemy</strong> et souhaite réserver une session de coaching avec toi.
              </p>

              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-weight: bold;">
                  💡 N'oublie pas : ton compte est actuellement inactif
                </p>
                <p style="margin: 5px 0 0 0; color: #92400e;">
                  Pour recevoir des réservations, active ton abonnement sur Edgemy.
                </p>
              </div>

              <p style="font-size: 16px; line-height: 1.6;">
                <strong>Que faire maintenant ?</strong>
              </p>

              <ol style="font-size: 15px; line-height: 1.8;">
                <li>Connecte-toi à ton <a href="${process.env.NEXT_PUBLIC_APP_URL}/fr/coach/dashboard" style="color: #f97316; text-decoration: none; font-weight: bold;">tableau de bord coach</a></li>
                <li>Active ton abonnement (mensuel ou annuel)</li>
                <li>Recommence à coacher et gagner de l'argent !</li>
              </ol>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/fr/coach/settings"
                   style="display: inline-block; background-color: #f97316; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Activer mon abonnement
                </a>
              </div>

              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                À bientôt sur Edgemy !<br>
                L'équipe Edgemy
              </p>
            </div>
          `;

        const emailResult = await sendEmail({
          to: [{ email, name: `${coach.firstName} ${coach.lastName}` }],
          subject: emailSubject,
          htmlContent: emailContent,
        });

        if (emailResult.success) {
          emailSent = true;
          console.log('✅ === EMAIL ENVOYÉ AVEC SUCCÈS ===');
          console.log('✅ Email confirmé par Brevo API');
          console.log('✅ Coach:', coach.id, `(${email})`);
          console.log('✅ Message ID Brevo:', (emailResult.result as { messageId?: string })?.messageId || 'N/A');
        } else {
          console.error('❌ === ÉCHEC ENVOI EMAIL ===');
          console.error('❌ L\'API Brevo a rejeté la requête');
          console.error('❌ Erreur:', emailResult.error);
        }
      } catch (error) {
        console.error('Erreur envoi email Brevo:', error);
        // On continue quand même pour tenter Discord
      }
    }

    // Notification Discord (si connecté)
    const discordId = coach.user.discordId;
    let discordSent = false;

    if (discordId && coach.discordUrl) {
      console.log('💬 Tentative d\'envoi DM Discord...');
      console.log('💬 Discord ID:', discordId);
      try {
        // Envoyer un DM Discord via le bot
        const botToken = process.env.DISCORD_BOT_TOKEN;
        if (botToken) {
          console.log('💬 Bot token configuré, envoi en cours...');

          const discordTitle = isFollowUp
            ? '🔔 Un joueur relance sa demande de contact !'
            : '🔔 Un joueur est intéressé par ton profil !';

          const discordDescription = isFollowUp
            ? `Bonne nouvelle **${coach.firstName}** ! Un joueur avait déjà manifesté son intérêt et relance aujourd'hui sa demande pour travailler avec toi.`
            : `Bonne nouvelle **${coach.firstName}** ! Un joueur a consulté ton profil Edgemy et souhaite travailler avec toi.`;

          await fetch(`https://discord.com/api/v10/users/@me/channels`, {
            method: 'POST',
            headers: {
              'Authorization': `Bot ${botToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ recipient_id: discordId }),
          }).then(async (dmResponse) => {
            if (!dmResponse.ok) {
              throw new Error('Impossible de créer le DM');
            }
            const dmChannel = await dmResponse.json();

            await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
              method: 'POST',
              headers: {
                'Authorization': `Bot ${botToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                embeds: [
                  {
                    title: discordTitle,
                    description: discordDescription,
                    color: 0xf97316,
                    fields: [
                      {
                        name: '⚠️ Attention',
                        value: 'Ton compte est actuellement **inactif**. Pour recevoir des réservations, active ton abonnement.',
                        inline: false,
                      },
                    ],
                    footer: {
                      text: 'Edgemy - Plateforme de coaching poker',
                    },
                  },
                ],
                components: [
                  {
                    type: 1,
                    components: [
                      {
                        type: 2,
                        style: 5,
                        label: 'Activer mon abonnement',
                        url: `${process.env.NEXT_PUBLIC_APP_URL}/fr/coach/settings`,
                      },
                    ],
                  },
                ],
              }),
            });
          });

          discordSent = true;
          console.log('✅ DM Discord envoyé avec succès');
          console.log('✅ Coach:', coachId, `(${discordId})`);
        }
      } catch (error) {
        console.error('Erreur envoi DM Discord:', error);
        // On ignore l'erreur Discord, l'email a été envoyé
      }
    }

    // Enregistrer la notification dans la base de données
    console.log('💾 Enregistrement de la notification dans la base de données...');
    await prisma.coachNotification.create({
      data: {
        coachId,
        playerId,
        playerEmail: playerInfo.email,
        playerName: `${playerInfo.firstName} ${playerInfo.lastName}`,
        isFollowUp,
        emailSent,
        discordSent,
      },
    });

    console.log('✅ Notification enregistrée dans la base de données');
    console.log('🔔 === FIN NOTIFICATION COACH INACTIF ===');
    console.log('✅ Notification traitée avec succès');

    return NextResponse.json({
      success: true,
      message: isFollowUp
        ? 'Relance envoyée ! Tu pourras contacter ce coach à nouveau dans 7 jours si aucune réponse.'
        : 'Notification envoyée ! Tu pourras relancer ce coach dans 7 jours si aucune réponse.',
      isFollowUp,
    });

  } catch (error) {
    console.error('❌ === ERREUR NOTIFICATION COACH INACTIF ===');
    console.error('❌ Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
