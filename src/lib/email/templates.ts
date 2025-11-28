interface SessionConfirmationData {
  playerName: string;
  coachName: string;
  sessionTitle: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  amount: string;
  isPackage: boolean;
  sessionsCount?: number;
  sessionUrl: string;
}

export function generateSessionConfirmationEmail(data: SessionConfirmationData): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de réservation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Réservation confirmée !</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Bonjour ${data.playerName},</p>

    <p style="font-size: 16px; margin-bottom: 30px;">
      Votre ${data.isPackage ? 'pack de sessions' : 'session'} de coaching a été confirmé${data.isPackage ? '' : 'e'} avec succès ! 🎉
    </p>

    <div style="background: #f9fafb; border-left: 4px solid #f97316; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
      <h2 style="margin-top: 0; color: #f97316; font-size: 20px;">Détails de votre réservation</h2>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Coach :</td>
          <td style="padding: 8px 0;">${data.coachName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Session :</td>
          <td style="padding: 8px 0;">${data.sessionTitle}</td>
        </tr>
        ${data.isPackage ? `
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Type :</td>
          <td style="padding: 8px 0;">Pack de ${data.sessionsCount} session${data.sessionsCount && data.sessionsCount > 1 ? 's' : ''}</td>
        </tr>
        ` : `
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Date :</td>
          <td style="padding: 8px 0;">${data.sessionDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Heure :</td>
          <td style="padding: 8px 0;">${data.sessionTime}</td>
        </tr>
        `}
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Durée :</td>
          <td style="padding: 8px 0;">${data.duration} minutes</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Montant payé :</td>
          <td style="padding: 8px 0; font-weight: 700; color: #f97316;">${data.amount}</td>
        </tr>
      </table>
    </div>

    <div style="background: #eff6ff; border: 1px solid #dbeafe; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #1e40af;">
        💬 <strong>Un canal Discord privé va être créé automatiquement</strong> pour communiquer avec votre coach.
        Assurez-vous d'avoir rejoint le serveur Edgemy !
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.sessionUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Voir mes sessions
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
      Des questions ? Contactez-nous à <a href="mailto:contact@edgemy.fr" style="color: #f97316;">contact@edgemy.fr</a>
    </p>

    <p style="font-size: 14px; color: #6b7280; margin: 0;">
      À bientôt sur Edgemy ! 🚀
    </p>
  </div>

  <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
    <p style="margin: 5px 0;">© ${new Date().getFullYear()} Edgemy - Plateforme de coaching esport</p>
    <p style="margin: 5px 0;">
      <a href="https://edgemy.fr" style="color: #9ca3af; text-decoration: none;">edgemy.fr</a>
    </p>
  </div>
</body>
</html>
`;

  const text = `
Réservation confirmée !

Bonjour ${data.playerName},

Votre ${data.isPackage ? 'pack de sessions' : 'session'} de coaching a été confirmé${data.isPackage ? '' : 'e'} avec succès !

DÉTAILS DE VOTRE RÉSERVATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Coach : ${data.coachName}
Session : ${data.sessionTitle}
${data.isPackage ? `Type : Pack de ${data.sessionsCount} session${data.sessionsCount && data.sessionsCount > 1 ? 's' : ''}` : `Date : ${data.sessionDate}
Heure : ${data.sessionTime}`}
Durée : ${data.duration} minutes
Montant payé : ${data.amount}

Un canal Discord privé va être créé automatiquement pour communiquer avec votre coach.
Assurez-vous d'avoir rejoint le serveur Edgemy !

Accédez à vos sessions : ${data.sessionUrl}

Des questions ? Contactez-nous à contact@edgemy.fr

À bientôt sur Edgemy !

━━━━━━━━━━━━━━━━━━━━━━━━━━━
© ${new Date().getFullYear()} Edgemy - edgemy.fr
`;

  return { html, text };
}

interface CoachSessionNotificationData {
  coachName: string;
  playerName: string;
  sessionTitle: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  amount: string;
  isPackage: boolean;
  sessionsCount?: number;
  sessionUrl: string;
}

export function generateCoachSessionNotificationEmail(data: CoachSessionNotificationData): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle réservation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Nouvelle réservation !</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Bonjour ${data.coachName},</p>

    <p style="font-size: 16px; margin-bottom: 30px;">
      Vous avez reçu une nouvelle réservation de ${data.playerName} ! 🎉
    </p>

    <div style="background: #f9fafb; border-left: 4px solid #8b5cf6; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
      <h2 style="margin-top: 0; color: #8b5cf6; font-size: 20px;">Détails de la réservation</h2>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Joueur :</td>
          <td style="padding: 8px 0;">${data.playerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Session :</td>
          <td style="padding: 8px 0;">${data.sessionTitle}</td>
        </tr>
        ${data.isPackage ? `
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Type :</td>
          <td style="padding: 8px 0;">Pack de ${data.sessionsCount} session${data.sessionsCount && data.sessionsCount > 1 ? 's' : ''}</td>
        </tr>
        ` : `
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Date :</td>
          <td style="padding: 8px 0;">${data.sessionDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Heure :</td>
          <td style="padding: 8px 0;">${data.sessionTime}</td>
        </tr>
        `}
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Durée :</td>
          <td style="padding: 8px 0;">${data.duration} minutes</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Montant :</td>
          <td style="padding: 8px 0; font-weight: 700; color: #10b981;">${data.amount}</td>
        </tr>
      </table>
    </div>

    <div style="background: #eff6ff; border: 1px solid #dbeafe; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #1e40af;">
        💬 <strong>Un canal Discord privé a été créé</strong> pour communiquer avec ${data.playerName}.
        Vous le trouverez dans le serveur Edgemy.
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.sessionUrl}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Voir mes sessions
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
      Des questions ? Contactez-nous à <a href="mailto:contact@edgemy.fr" style="color: #8b5cf6;">contact@edgemy.fr</a>
    </p>

    <p style="font-size: 14px; color: #6b7280; margin: 0;">
      Bon coaching ! 🚀
    </p>
  </div>

  <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
    <p style="margin: 5px 0;">© ${new Date().getFullYear()} Edgemy - Plateforme de coaching esport</p>
    <p style="margin: 5px 0;">
      <a href="https://edgemy.fr" style="color: #9ca3af; text-decoration: none;">edgemy.fr</a>
    </p>
  </div>
</body>
</html>
`;

  const text = `
Nouvelle réservation !

Bonjour ${data.coachName},

Vous avez reçu une nouvelle réservation de ${data.playerName} !

DÉTAILS DE LA RÉSERVATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Joueur : ${data.playerName}
Session : ${data.sessionTitle}
${data.isPackage ? `Type : Pack de ${data.sessionsCount} session${data.sessionsCount && data.sessionsCount > 1 ? 's' : ''}` : `Date : ${data.sessionDate}
Heure : ${data.sessionTime}`}
Durée : ${data.duration} minutes
Montant : ${data.amount}

Un canal Discord privé a été créé pour communiquer avec ${data.playerName}.
Vous le trouverez dans le serveur Edgemy.

Accédez à vos sessions : ${data.sessionUrl}

Des questions ? Contactez-nous à contact@edgemy.fr

Bon coaching !

━━━━━━━━━━━━━━━━━━━━━━━━━━━
© ${new Date().getFullYear()} Edgemy - edgemy.fr
`;

  return { html, text };
}
