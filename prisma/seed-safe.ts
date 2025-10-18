// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Fonction pour générer un ID unique
function generateId() {
  return randomBytes(16).toString('hex');
}

// Fonction pour hasher un mot de passe (compatible Better Auth - utilise bcrypt)
async function hashPassword(password: string): Promise<string> {
  return await hash(password, 10);
}

async function main() {
  console.log('🌱 Démarrage du seed SAFE (préserve les subscribers)...');

  // 1. Nettoyer uniquement les données de test (pas les subscribers)
  console.log('🧹 Nettoyage des données de test...');
  
  // Supprimer dans l'ordre (à cause des foreign keys)
  await prisma.reservation.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.availability.deleteMany({});
  await prisma.coach.deleteMany({});
  await prisma.coachDraft.deleteMany({});
  await prisma.player.deleteMany({});
  
  // Supprimer les comptes d'authentification des utilisateurs de test
  await prisma.account.deleteMany({
    where: {
      user: {
        email: {
          in: [
            'coach-actif@edgemy.fr',
            'coach-inactif@edgemy.fr',
            'coach-pending@edgemy.fr',
            'joueur@edgemy.fr',
          ],
        },
      },
    },
  });
  
  // Supprimer uniquement les utilisateurs de test (pas ceux qui ont des subscribers)
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          'coach-actif@edgemy.fr',
          'coach-inactif@edgemy.fr',
          'coach-pending@edgemy.fr',
          'joueur@edgemy.fr',
        ],
      },
    },
  });

  console.log('✅ Nettoyage terminé (subscribers préservés)');

  // 2. Créer les utilisateurs de base (avec upsert pour éviter les erreurs)
  console.log('👤 Création des utilisateurs...');

  const coachActiveUser = await prisma.user.upsert({
    where: { email: 'coach-actif@edgemy.fr' },
    update: {
      name: 'Jean Dupont',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jean',
      updatedAt: new Date(),
    },
    create: {
      id: generateId(),
      email: 'coach-actif@edgemy.fr',
      name: 'Jean Dupont',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jean',
      updatedAt: new Date(),
    },
  });

  const coachInactiveUser = await prisma.user.upsert({
    where: { email: 'coach-inactif@edgemy.fr' },
    update: {
      name: 'Marie Martin',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marie',
      updatedAt: new Date(),
    },
    create: {
      id: generateId(),
      email: 'coach-inactif@edgemy.fr',
      name: 'Marie Martin',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marie',
      updatedAt: new Date(),
    },
  });

  const coachPendingUser = await prisma.user.upsert({
    where: { email: 'coach-pending@edgemy.fr' },
    update: {
      name: 'Pierre Durand',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pierre',
      updatedAt: new Date(),
    },
    create: {
      id: generateId(),
      email: 'coach-pending@edgemy.fr',
      name: 'Pierre Durand',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pierre',
      updatedAt: new Date(),
    },
  });

  const playerUser = await prisma.user.upsert({
    where: { email: 'joueur@edgemy.fr' },
    update: {
      name: 'Sophie Bernard',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophie',
      updatedAt: new Date(),
    },
    create: {
      id: generateId(),
      email: 'joueur@edgemy.fr',
      name: 'Sophie Bernard',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophie',
      updatedAt: new Date(),
    },
  });

  console.log('✅ Utilisateurs créés');

  // 2.5. Créer les comptes d'authentification (Better Auth)
  console.log('🔐 Création des comptes d\'authentification...');
  
  const defaultPassword = await hashPassword('Password123!'); // Mot de passe par défaut pour tous

  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: 'credential',
        accountId: coachActiveUser.id,
      },
    },
    update: {},
    create: {
      id: generateId(),
      userId: coachActiveUser.id,
      accountId: coachActiveUser.id,
      providerId: 'credential',
      password: defaultPassword,
      updatedAt: new Date(),
    },
  });

  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: 'credential',
        accountId: coachInactiveUser.id,
      },
    },
    update: {},
    create: {
      id: generateId(),
      userId: coachInactiveUser.id,
      accountId: coachInactiveUser.id,
      providerId: 'credential',
      password: defaultPassword,
      updatedAt: new Date(),
    },
  });

  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: 'credential',
        accountId: coachPendingUser.id,
      },
    },
    update: {},
    create: {
      id: generateId(),
      userId: coachPendingUser.id,
      accountId: coachPendingUser.id,
      providerId: 'credential',
      password: defaultPassword,
      updatedAt: new Date(),
    },
  });

  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: 'credential',
        accountId: playerUser.id,
      },
    },
    update: {},
    create: {
      id: generateId(),
      userId: playerUser.id,
      accountId: playerUser.id,
      providerId: 'credential',
      password: defaultPassword,
      updatedAt: new Date(),
    },
  });

  console.log('✅ Comptes d\'authentification créés');
  console.log('   📝 Mot de passe par défaut : Password123!');

  // 3. Créer les profils coach
  console.log('🎓 Création des profils coach...');

  const coachActive = await prisma.coach.create({
    data: {
      userId: coachActiveUser.id,
      slug: 'jean-dupont',
      firstName: 'Jean',
      lastName: 'Dupont',
      bio: `Joueur professionnel de poker depuis 10 ans, spécialisé en MTT et Cash Game. 
      
J'ai remporté plusieurs tournois majeurs dont un bracelet WSOP et je partage maintenant mon expérience avec les joueurs qui souhaitent progresser.

Ma méthode se base sur l'analyse détaillée de vos mains, le travail sur les leaks et l'optimisation de votre stratégie selon votre niveau et vos objectifs.`,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jean',
      bannerUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=1200&h=400&fit=crop',
      status: 'ACTIVE',
      formats: ['MTT', 'CASH', 'GTO'],
      stakes: 'NL100-NL500',
      roi: 18.5,
      experience: 10,
      languages: ['fr', 'en'],
      twitchUrl: 'https://twitch.tv/jeandupont',
      youtubeUrl: 'https://youtube.com/@jeandupont',
      twitterUrl: 'https://twitter.com/jeandupont',
      stripeAccountId: 'acct_test_active',
      subscriptionId: 'sub_test_active',
      badges: ['WSOP_BRACELET', 'EPT_WINNER'],
    },
  });

  const coachInactive = await prisma.coach.create({
    data: {
      userId: coachInactiveUser.id,
      slug: 'marie-martin',
      firstName: 'Marie',
      lastName: 'Martin',
      bio: 'Spécialiste Spin & Go et MTT low stakes. Ancienne joueuse professionnelle.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marie',
      status: 'INACTIVE',
      formats: ['SPIN', 'MTT'],
      stakes: 'NL10-NL50',
      roi: 12.0,
      experience: 5,
      languages: ['fr'],
      stripeAccountId: 'acct_test_inactive',
      subscriptionId: null,
    },
  });

  const coachPending = await prisma.coach.create({
    data: {
      userId: coachPendingUser.id,
      slug: 'pierre-durand',
      firstName: 'Pierre',
      lastName: 'Durand',
      bio: 'Coach mental game et stratégie avancée. Expert en psychologie du poker.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pierre',
      status: 'PENDING_REVIEW',
      formats: ['MENTAL', 'GTO'],
      stakes: 'NL50-NL200',
      experience: 7,
      languages: ['fr', 'en', 'de'],
      stripeAccountId: 'acct_test_pending',
      subscriptionId: 'sub_test_pending',
    },
  });

  console.log('✅ Profils coach créés');

  // 4. Créer les annonces
  console.log('📢 Création des annonces...');

  await prisma.announcement.createMany({
    data: [
      {
        coachId: coachActive.id,
        title: 'Coaching MTT - Débutant',
        slug: 'coaching-mtt-debutant-jean-dupont',
        description: 'Session de coaching pour débutants en MTT. Nous travaillerons sur les bases : sélection de mains, gestion de bankroll, et stratégie de tournoi.',
        priceCents: 5000,
        durationMin: 60,
        format: 'MTT',
        isActive: true,
      },
      {
        coachId: coachActive.id,
        title: 'Coaching Cash Game NL100-NL200',
        slug: 'coaching-cash-game-nl100-nl200-jean-dupont',
        description: 'Analyse de vos sessions de cash game, détection des leaks, et optimisation de votre stratégie pour les limites NL100-NL200.',
        priceCents: 8000,
        durationMin: 90,
        format: 'CASH',
        isActive: true,
      },
      {
        coachId: coachActive.id,
        title: 'Pack 5 sessions - Progression MTT',
        slug: 'pack-5-sessions-progression-mtt-jean-dupont',
        description: 'Pack de 5 sessions pour une progression complète en MTT. Suivi personnalisé entre les sessions et plan de travail adapté.',
        priceCents: 20000,
        durationMin: 60,
        format: 'MTT',
        isActive: true,
      },
      {
        coachId: coachActive.id,
        title: 'Analyse de main GTO',
        slug: 'analyse-de-main-gto-jean-dupont',
        description: 'Session courte d\'analyse approfondie d\'une main complexe avec approche GTO. Parfait pour comprendre les spots difficiles.',
        priceCents: 3000,
        durationMin: 30,
        format: 'GTO',
        isActive: false,
      },
    ],
  });

  await prisma.announcement.create({
    data: {
      coachId: coachInactive.id,
      title: 'Coaching Spin & Go',
      slug: 'coaching-spin-go-marie-martin',
      description: 'Session de coaching Spin & Go pour tous niveaux.',
      priceCents: 4000,
      durationMin: 60,
      format: 'SPIN',
      isActive: true,
    },
  });

  console.log('✅ Annonces créées');

  // 5. Créer le profil joueur
  console.log('🎮 Création du profil joueur...');

  await prisma.player.create({
    data: {
      id: generateId(),
      userId: playerUser.id,
      formats: ['MTT', 'CASH'],
      goals: 'Améliorer mon jeu en MTT et atteindre les limites NL100',
    },
  });

  console.log('✅ Profil joueur créé');

  // 6. Créer les réservations
  console.log('📅 Création des réservations...');

  const announcements = await prisma.announcement.findMany({
    where: { coachId: coachActive.id, isActive: true },
    take: 2,
  });

  if (announcements.length > 0) {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    await prisma.reservation.createMany({
      data: [
        {
          playerId: playerUser.id,
          coachId: coachActive.id,
          announcementId: announcements[0].id,
          startDate: futureDate,
          endDate: new Date(futureDate.getTime() + 60 * 60 * 1000), // +1h
          priceCents: 5000,
          status: 'CONFIRMED',
        },
        {
          playerId: playerUser.id,
          coachId: coachActive.id,
          announcementId: announcements[1].id,
          startDate: pastDate,
          endDate: new Date(pastDate.getTime() + 90 * 60 * 1000), // +1h30
          priceCents: 8000,
          status: 'COMPLETED',
        },
      ],
    });
  }

  console.log('✅ Réservations créées');

  // 7. Vérifier les subscribers
  const subscriberCount = await prisma.subscriber.count();
  console.log(`\n📊 Subscribers préservés : ${subscriberCount}`);

  // 8. Afficher le résumé
  console.log('\n📊 RÉSUMÉ DU SEED SAFE\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n✅ Données créées :');
  console.log('  • 4 utilisateurs (3 coachs + 1 joueur)');
  console.log('  • 3 profils coach (ACTIVE, INACTIVE, PENDING_REVIEW)');
  console.log('  • 5 annonces');
  console.log('  • 1 profil joueur');
  console.log('  • 2 réservations');
  console.log(`\n🔒 Subscribers préservés : ${subscriberCount}`);
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('\n🔐 COMPTES DE TEST\n');
  console.log('🟢 coach-actif@edgemy.fr     → /coach/jean-dupont');
  console.log('🔴 coach-inactif@edgemy.fr   → /coach/marie-martin (404)');
  console.log('🟡 coach-pending@edgemy.fr   → /coach/pierre-durand (404)');
  console.log('🎮 joueur@edgemy.fr          → Peut réserver');
  console.log('\n✅ Seed SAFE terminé avec succès!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
