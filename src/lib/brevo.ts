import * as brevo from '@getbrevo/brevo';

// Configuration du client Brevo
let apiInstance: brevo.TransactionalEmailsApi;

function getBrevoClient() {
  if (!apiInstance) {
    apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);
  }
  return apiInstance;
}

export interface WelcomeEmailData {
  email: string;
  role: 'PLAYER' | 'COACH';
  firstName?: string;
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  try {
    // Vérification des variables d'environnement
    if (!process.env.BREVO_API_KEY) {
      console.error('BREVO_API_KEY not configured');
      return { success: false, error: 'Email service not configured' };
    }

    console.log('Brevo config check:', {
      hasKey: !!process.env.BREVO_API_KEY,
      senderEmail: process.env.BREVO_SENDER_EMAIL,
      senderName: process.env.BREVO_SENDER_NAME
    });

    const client = getBrevoClient();
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = "Bienvenue dans la communauté Edgemy ! 🎉";
    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || "Edgemy",
      email: process.env.BREVO_SENDER_EMAIL || "contact@edgemy.fr"
    };
    sendSmtpEmail.to = [{ email: data.email }];
    
    // Template HTML selon le rôle
    const isCoach = data.role === 'COACH';
    const firstName = data.firstName || '';
    const greeting = firstName ? `Bonjour ${firstName}` : 'Bonjour';
    
    if (isCoach) {
      // Email spécifique pour les coachs
      sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Bienvenue coach - Edgemy</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://edgemy.fr/logos/logo-noir-edgemy.png" alt="Edgemy" style="height: 60px;">
            </div>
            
            <div style="background: linear-gradient(135deg, #DC2626, #B91C1C, #7C2D12); padding: 30px; border-radius: 15px; text-align: center; color: white; margin-bottom: 30px;">
              <h1 style="margin: 0 0 10px 0; font-size: 28px;">${greeting} 👋</h1>
              <p style="margin: 0; font-size: 18px; opacity: 0.9;">Merci de t'être inscrit à Edgemy</p>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Tu es désormais sur la liste pour accéder en avant-première à notre plateforme de coaching poker.
              </p>
              
              <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
                <h2 style="color: #1e293b; margin-top: 0; font-size: 18px;">🎯 Sur Edgemy, tu pourras bientôt :</h2>
                <ul style="color: #475569; margin: 0; padding-left: 20px;">
                  <li>Créer ton profil coach (bio, spécialités, tarifs)</li>
                  <li>Être visible par les premiers joueurs inscrits</li>
                  <li>Réserver tes premières sessions de coaching directement via Edgemy</li>
                </ul>
              </div>
              
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Nous t'enverrons bientôt des nouvelles du lancement officiel 🚀
              </p>
              
              <p style="font-size: 16px; color: #374151;">
                En attendant, rejoins notre communauté Discord pour échanger avec d'autres joueurs et coachs passionnés.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://discord.gg/dYDEzbVz" style="background: #5865F2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; cursor: pointer;">
                Rejoindre le Discord 🎮
              </a>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
              <p>À bientôt,<br>L'équipe Edgemy 🚀</p>
            </div>
          </body>
        </html>
      `;
    } else {
      // Email pour les joueurs
      sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Bienvenue joueur - Edgemy</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://edgemy.fr/logos/logo-noir-edgemy.png" alt="Edgemy" style="height: 60px;">
            </div>
            
            <div style="background: linear-gradient(135deg, #3B82F6, #6366F1, #8B5CF6); padding: 30px; border-radius: 15px; text-align: center; color: white; margin-bottom: 30px;">
              <h1 style="margin: 0 0 10px 0; font-size: 28px;">Bienvenue dans la communauté Edgemy ! 🎯</h1>
              <p style="margin: 0; font-size: 18px; opacity: 0.9;">Vous êtes maintenant inscrit(e) en tant que joueur</p>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
              <h2 style="color: #1e293b; margin-top: 0;">Que se passe-t-il maintenant ?</h2>
              <ul style="color: #475569;">
                <li><strong>Lancement prioritaire :</strong> Vous serez informé(e) en premier</li>
                <li><strong>Accès early bird :</strong> Tarifs préférentiels pour les premiers utilisateurs</li>
                <li><strong>Choix des coachs :</strong> Accès privilégié aux meilleurs profils</li>
              </ul>
            </div>
            
             <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Nous t'enverrons bientôt des nouvelles du lancement officiel 🚀
              </p>
              
              <p style="font-size: 16px; color: #374151;">
                En attendant, rejoins notre communauté Discord pour échanger avec d'autres joueurs et coachs passionnés.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://discord.gg/dYDEzbVz" style="background: #5865F2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; cursor: pointer;">
                Rejoindre le Discord 🎮
              </a>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
              <p>À bientôt,<br>L'équipe Edgemy 🚀</p>
            </div>
          </body>
        </html>
      `;
    }

    const result = await client.sendTransacEmail(sendSmtpEmail);
    console.log('Welcome email sent successfully:', result);
    return { success: true, result };
    
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error };
  }
}


// Fonction générique pour envoyer des emails
export interface SendEmailParams {
  to: Array<{ email: string; name?: string }>;
  subject: string;
  htmlContent: string;
  sender?: { email: string; name: string };
}

export async function sendEmail(params: SendEmailParams) {
  try {
    console.log('📧 === DÉBUT ENVOI EMAIL ===');
    console.log('📧 Destinataire(s):', JSON.stringify(params.to, null, 2));
    console.log('📧 Sujet:', params.subject);

    if (!process.env.BREVO_API_KEY) {
      console.error('❌ BREVO_API_KEY not configured');
      return { success: false, error: 'Email service not configured' };
    }

    console.log('✅ BREVO_API_KEY est configurée');
    console.log('📧 Longueur de la clé API:', process.env.BREVO_API_KEY.length, 'caractères');
    console.log('📧 Préfixe de la clé:', process.env.BREVO_API_KEY.substring(0, 15) + '...');

    const client = getBrevoClient();
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = params.subject;
    sendSmtpEmail.sender = params.sender || {
      name: process.env.BREVO_SENDER_NAME || "Edgemy",
      email: process.env.BREVO_SENDER_EMAIL || "contact@edgemy.fr"
    };
    sendSmtpEmail.to = params.to;
    sendSmtpEmail.htmlContent = params.htmlContent;

    console.log('📧 Configuration email:', {
      sender: sendSmtpEmail.sender,
      to: sendSmtpEmail.to,
      subject: sendSmtpEmail.subject,
      htmlContentLength: params.htmlContent.length
    });

    console.log('📧 Appel API Brevo en cours...');
    const result = await client.sendTransacEmail(sendSmtpEmail);

    console.log('✅ === RÉPONSE BREVO REÇUE ===');
    console.log('✅ Status: SUCCESS');
    console.log('✅ Message ID:', (result as { messageId?: string }).messageId || 'N/A');
    console.log('✅ Résultat complet:', JSON.stringify(result, null, 2));
    console.log('✅ === FIN ENVOI EMAIL ===');

    return { success: true, result };

  } catch (error) {
    console.error('❌ === ERREUR ENVOI EMAIL ===');
    console.error('❌ Type d\'erreur:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('❌ Message d\'erreur:', error instanceof Error ? error.message : String(error));

    if (error && typeof error === 'object') {
      console.error('❌ Détails de l\'erreur:', JSON.stringify(error, null, 2));

      // Si c'est une erreur Axios, afficher plus de détails
      if ('response' in error) {
        const axiosError = error as { response?: { status?: number; statusText?: string; data?: unknown; headers?: unknown } };
        console.error('❌ Status HTTP:', axiosError.response?.status);
        console.error('❌ Status Text:', axiosError.response?.statusText);
        console.error('❌ Response Data:', JSON.stringify(axiosError.response?.data, null, 2));
        console.error('❌ Response Headers:', JSON.stringify(axiosError.response?.headers, null, 2));
      }
    }

    console.error('❌ === FIN ERREUR EMAIL ===');
    return { success: false, error };
  }
}

// Email de notification interne pour l'équipe
export async function sendInternalNotification(type: 'subscriber', data: { email: string; role: string; firstName?: string }) {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.error('BREVO_API_KEY not configured');
      return;
    }

    const client = getBrevoClient();
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = `Nouvelle inscription ${data.role.toLowerCase()} : ${data.email}`;
      
    sendSmtpEmail.sender = {
      name: "Edgemy System",
      email: process.env.BREVO_SENDER_EMAIL || "contact@edgemy.fr"
    };
    sendSmtpEmail.to = [{ email: "contact@edgemy.fr" }];
    
    sendSmtpEmail.htmlContent = `
      <h2>Nouvelle inscription</h2>
      <ul>
        <li><strong>Email:</strong> ${data.email}</li>
        ${data.firstName ? `<li><strong>Prénom:</strong> ${data.firstName}</li>` : ''}
        <li><strong>Rôle:</strong> ${data.role}</li>
        <li><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</li>
      </ul>
    `;

    await client.sendTransacEmail(sendSmtpEmail);
    console.log('Internal notification sent successfully');
    
  } catch (error) {
    console.error('Error sending internal notification:', error);
  }
}
