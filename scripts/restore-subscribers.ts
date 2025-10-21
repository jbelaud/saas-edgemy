import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const subscribersData = [
  {"id":"cmgwfn6dd0000ii04az8n5irn","email":"jeremy.belaud@gmail.com","role":"COACH","createdAt":"2025-10-18 15:28:40.705","updatedAt":"2025-10-18 15:28:40.705","firstName":null},
  {"id":"cmgwfnpju0001ii04f4ztaaos","email":"jeremybelaud.pro@gmail.com","role":"PLAYER","createdAt":"2025-10-18 15:29:05.563","updatedAt":"2025-10-18 15:29:05.563","firstName":null},
  {"id":"cmgwfnu720002ii04ouvvgph8","email":"harmonie.meron@gmail.com","role":"PLAYER","createdAt":"2025-10-18 15:29:11.582","updatedAt":"2025-10-18 15:29:11.582","firstName":null},
  {"id":"cmgwfnzw20003ii048vbg2sf1","email":"cperalez@gmail.com","role":"PLAYER","createdAt":"2025-10-18 15:29:18.963","updatedAt":"2025-10-18 15:29:18.963","firstName":null},
  {"id":"cmgwfo4yi0004ii04a02ty045","email":"test@testcoach.com","role":"COACH","createdAt":"2025-10-18 15:29:25.531","updatedAt":"2025-10-18 15:29:25.531","firstName":null},
  {"id":"cmgwfo8ux0005ii04dlqq0c51","email":"testjoueur@test.fr","role":"PLAYER","createdAt":"2025-10-18 15:29:30.586","updatedAt":"2025-10-18 15:29:30.586","firstName":null},
  {"id":"cmgwfocr40006ii04tibp3o73","email":"test@testflavien.com","role":"COACH","createdAt":"2025-10-18 15:29:35.632","updatedAt":"2025-10-18 15:29:35.632","firstName":null},
  {"id":"cmgwfolnn0007ii04qj4h1qse","email":"olive.belaud@gmail.com","role":"PLAYER","createdAt":"2025-10-18 15:29:47.171","updatedAt":"2025-10-18 15:29:47.171","firstName":null},
  {"id":"cmgz795v60000kz040c2ofuzm","email":"kdserie@gmail.com","role":"COACH","createdAt":"2025-10-20 13:57:08.467","updatedAt":"2025-10-20 13:57:08.467","firstName":"John "}
];

async function restoreSubscribers() {
  console.log('🔄 Début de la restauration des subscribers...\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const subscriber of subscribersData) {
    try {
      // Vérifier si l'email existe déjà
      const existing = await prisma.subscriber.findUnique({
        where: { email: subscriber.email },
      });

      if (existing) {
        console.log(`⏭️  Email déjà existant: ${subscriber.email}`);
        skipCount++;
        continue;
      }

      // Créer le subscriber avec l'ID original
      await prisma.subscriber.create({
        data: {
          id: subscriber.id,
          email: subscriber.email,
          role: subscriber.role as 'COACH' | 'PLAYER',
          firstName: subscriber.firstName,
          createdAt: new Date(subscriber.createdAt),
          updatedAt: new Date(subscriber.updatedAt),
        },
      });

      console.log(`✅ Restauré: ${subscriber.email} (${subscriber.role})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Erreur pour ${subscriber.email}:`, error);
      errorCount++;
    }
  }

  console.log('\n📊 Résumé de la restauration:');
  console.log(`   ✅ Restaurés: ${successCount}`);
  console.log(`   ⏭️  Ignorés (déjà existants): ${skipCount}`);
  console.log(`   ❌ Erreurs: ${errorCount}`);
  console.log(`   📝 Total: ${subscribersData.length}`);
}

restoreSubscribers()
  .then(() => {
    console.log('\n✨ Restauration terminée avec succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erreur lors de la restauration:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
