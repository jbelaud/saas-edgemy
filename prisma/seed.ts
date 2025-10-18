// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import { hashSync } from '@node-rs/bcrypt';

const prisma = new PrismaClient();

// Fonction pour générer un ID unique
function generateId() {
  return randomBytes(16).toString('hex');
}

// Fonction pour hasher un mot de passe (compatible Better Auth)
function hashPassword(password: string): string {
  return hashSync(password, 10);
}

async function main() {
  console.log('🌱 Démarrage du seed...');

  // 1. Créer les utilisateurs de base
  console.log('👤 Création des utilisateurs...');

  // Coach actif avec profil complet
  const coachActiveUser = await prisma.user.upsert({
    where: { email: 'coach-actif@edgemy.fr' },
    update: { updatedAt: new Date() },
    create: {
      id: generateId(),
      email: 'coach-actif@edgemy.fr',
      name: 'Jean Dupont',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jean',
      updatedAt: new Date(),
    },
  });

  // Coach inactif (abonnement expiré)
  const coachInactiveUser = await prisma.user.upsert({
    where: { email: 'coach-inactif@edgemy.fr' },
    update: { updatedAt: new Date() },
    create: {
      id: generateId(),
      email: 'coach-inactif@edgemy.fr',
      name: 'Marie Martin',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marie',
      updatedAt: new Date(),
    },
  });

  // Coach en attente de validation
  const coachPendingUser = await prisma.user.upsert({
    where: { email: 'coach-pending@edgemy.fr' },
    update: { updatedAt: new Date() },
    create: {
      id: generateId(),
      email: 'coach-pending@edgemy.fr',
      name: 'Pierre Durand',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pierre',
      updatedAt: new Date(),
    },
  });

  // Joueur simple
  const playerUser = await prisma.user.upsert({
    where: { email: 'joueur@edgemy.fr' },
    update: { updatedAt: new Date() },
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

  // 1.5. Créer les comptes d'authentification (Better Auth)
  console.log('🔐 Création des comptes d\'authentification...');
  
  // Hash le mot de passe pour chaque compte (chaque hash sera unique grâce au salt)
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
      password: hashPassword('Password123!'),
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
      password: hashPassword('Password123!'),
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
      password: hashPassword('Password123!'),
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
      password: hashPassword('Password123!'),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Comptes d\'authentification créés');
  console.log('   📝 Mot de passe par défaut : Password123!');

  // 2. Créer les profils coach
  console.log('🎓 Création des profils coach...');

  // Coach actif - Profil complet
  const coachActive = await prisma.coach.upsert({
    where: { userId: coachActiveUser.id },
    update: {},
    create: {
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

  // Coach inactif - Abonnement expiré
  const coachInactive = await prisma.coach.upsert({
    where: { userId: coachInactiveUser.id },
    update: {},
    create: {
      userId: coachInactiveUser.id,
      slug: 'marie-martin',
      firstName: 'Marie',
      lastName: 'Martin',
      bio: 'Spécialiste Spin & Go et MTT low stakes. Ancienne joueuse professionnelle.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marie',
      status: 'INACTIVE', // Abonnement expiré
      formats: ['SPIN', 'MTT'],
      stakes: 'NL10-NL50',
      roi: 12.0,
      experience: 5,
      languages: ['fr'],
      stripeAccountId: 'acct_test_inactive',
      subscriptionId: null, // Pas d'abonnement actif
    },
  });

  // Coach en attente de validation
  const coachPending = await prisma.coach.upsert({
    where: { userId: coachPendingUser.id },
    update: {},
    create: {
      userId: coachPendingUser.id,
      slug: 'pierre-durand',
      firstName: 'Pierre',
      lastName: 'Durand',
      bio: 'Coach mental game et stratégie avancée. Expert en psychologie du poker.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pierre',
      status: 'PENDING_REVIEW', // En attente de validation
      formats: ['MENTAL', 'GTO'],
      stakes: 'NL50-NL200',
      experience: 7,
      languages: ['fr', 'en', 'de'],
      stripeAccountId: 'acct_test_pending',
      subscriptionId: 'sub_test_pending',
    },
  });

  console.log('✅ Profils coach créés');

  // 3. Créer les annonces pour le coach actif
  console.log('📢 Création des annonces...');

  await prisma.announcement.createMany({
    data: [
      {
        coachId: coachActive.id,
        title: 'Coaching MTT - Débutant',
        slug: 'coaching-mtt-debutant-jean-dupont',
        description: 'Session de coaching pour débutants en MTT. Nous travaillerons sur les bases : sélection de mains, gestion de bankroll, et stratégie de tournoi.',
        priceCents: 5000, // 50€
        durationMin: 60,
        format: 'MTT',
        isActive: true,
      },
      {
        coachId: coachActive.id,
        title: 'Coaching Cash Game NL100-NL200',
        slug: 'coaching-cash-game-nl100-nl200-jean-dupont',
        description: 'Analyse de vos sessions de cash game, détection des leaks, et optimisation de votre stratégie pour les limites NL100-NL200.',
        priceCents: 8000, // 80€
        durationMin: 90,
        format: 'CASH',
        isActive: true,
      },
      {
        coachId: coachActive.id,
        title: 'Pack 5 sessions - Progression MTT',
        slug: 'pack-5-sessions-progression-mtt-jean-dupont',
        description: 'Pack de 5 sessions pour une progression complète en MTT. Suivi personnalisé entre les sessions et plan de travail adapté.',
        priceCents: 20000, // 200€ (au lieu de 250€)
        durationMin: 60,
        format: 'MTT',
        isActive: true,
      },
      {
        coachId: coachActive.id,
        title: 'Analyse de main GTO',
        slug: 'analyse-de-main-gto-jean-dupont',
        description: 'Session courte d\'analyse approfondie d\'une main complexe avec approche GTO. Parfait pour comprendre les spots difficiles.',
        priceCents: 3000, // 30€
        durationMin: 30,
        format: 'GTO',
        isActive: false, // Annonce désactivée
      },
    ],
  });

  // Annonces pour le coach inactif (ne seront pas visibles)
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

  // 4. Créer un profil joueur
  console.log('🎮 Création du profil joueur...');

  await prisma.player.upsert({
    where: { userId: playerUser.id },
    update: {},
    create: {
      id: generateId(),
      userId: playerUser.id,
      formats: ['MTT', 'CASH'],
      goals: 'Améliorer mon jeu en MTT et atteindre les limites NL100',
    },
  });

  console.log('✅ Profil joueur créé');

  // 5. Créer quelques réservations de test
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

  // 6. Afficher le résumé
  console.log('\n📊 RÉSUMÉ DU SEED\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n🔐 COMPTES DE TEST (mot de passe: password123)\n');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│ 🟢 COACH ACTIF                                          │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ Email    : coach-actif@edgemy.fr                        │');
  console.log('│ Nom      : Jean Dupont                                  │');
  console.log('│ Slug     : jean-dupont                                  │');
  console.log('│ Status   : ACTIVE ✅                                     │');
  console.log('│ Annonces : 4 (3 actives)                                │');
  console.log('│ URL      : /coach/jean-dupont                           │');
  console.log('└─────────────────────────────────────────────────────────┘\n');

  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│ 🔴 COACH INACTIF                                        │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ Email    : coach-inactif@edgemy.fr                      │');
  console.log('│ Nom      : Marie Martin                                 │');
  console.log('│ Slug     : marie-martin                                 │');
  console.log('│ Status   : INACTIVE ❌ (abonnement expiré)              │');
  console.log('│ Annonces : 1 (non visible publiquement)                 │');
  console.log('│ URL      : /coach/marie-martin (inactif)                    │');
  console.log('└─────────────────────────────────────────────────────────┘\n');

  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│ 🟡 COACH EN VALIDATION                                  │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ Email    : coach-pending@edgemy.fr                      │');
  console.log('│ Nom      : Pierre Durand                                │');
  console.log('│ Slug     : pierre-durand                                │');
  console.log('│ Status   : PENDING_REVIEW ⏳                            │');
  console.log('│ Annonces : 0                                            │');
  console.log('│ URL      : /coach/pierre-durand (404)                   │');
  console.log('└─────────────────────────────────────────────────────────┘\n');

  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│ 🎮 JOUEUR                                               │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ Email    : joueur@edgemy.fr                             │');
  console.log('│ Nom      : Sophie Bernard                               │');
  console.log('│ Niveau   : INTERMEDIATE                                 │');
  console.log('│ Format   : MTT                                          │');
  console.log('└─────────────────────────────────────────────────────────┘\n');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n🧪 SCÉNARIOS DE TEST\n');
  console.log('1. Connexion coach actif → Dashboard accessible');
  console.log('2. Connexion coach inactif → Alert abonnement expiré');
  console.log('3. Connexion coach pending → Alert validation en cours');
  console.log('4. Page publique jean-dupont → Visible avec 3 annonces');
  console.log('5. Page publique marie-martin → Visible (inactif)');
  console.log('6. Connexion joueur → Peut réserver avec Jean Dupont');
  console.log('\n✅ Seed terminé avec succès!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
