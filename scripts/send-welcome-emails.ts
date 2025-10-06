import { db } from '../src/lib/db';
import { sendWelcomeEmail } from '../src/lib/brevo';

async function sendWelcomeEmails() {
  try {
    console.log('🚀 Début de l\'envoi des emails de bienvenue...');
    
    // Récupérer tous les subscribers
    const subscribers = await db.subscriber.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📧 ${subscribers.length} subscribers trouvés`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const subscriber of subscribers) {
      try {
        console.log(`📤 Envoi email à ${subscriber.email} (${subscriber.role})`);
        
        const result = await sendWelcomeEmail({
          email: subscriber.email,
          firstName: subscriber.firstName || undefined,
          role: subscriber.role as 'PLAYER' | 'COACH'
        });
        
        if (result.success) {
          console.log(`✅ Email envoyé avec succès à ${subscriber.email}`);
          successCount++;
        } else {
          console.error(`❌ Erreur envoi email à ${subscriber.email}:`, result.error);
          errorCount++;
        }
        
        // Pause de 1 seconde entre chaque email pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erreur lors de l'envoi à ${subscriber.email}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n📊 Résumé:');
    console.log(`✅ Emails envoyés avec succès: ${successCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log(`📧 Total: ${subscribers.length}`);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    await db.$disconnect();
  }
}

// Exécuter le script
sendWelcomeEmails();
