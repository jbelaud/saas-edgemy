# 🎯 Edgemy - Plateforme de Coaching Poker

Edgemy est une plateforme moderne qui connecte les joueurs de poker avec les meilleurs coachs pour un accompagnement personnalisé et professionnel.

## 🚀 Fonctionnalités

### Phase 1 - Landing Page (Actuelle)
- ✅ **Hero Section** avec présentation attractive
- ✅ **Formulaire d'inscription** pour capter les early adopters
- ✅ **Internationalisation** (FR, EN, DE, IT, ES)
- ✅ **Design responsive** avec Tailwind CSS
- ✅ **API de souscription** connectée à PostgreSQL

### Phases Futures
- 🔄 **Authentification** (BetterAuth.js avec Google, Discord, email)
- 🔄 **Dashboard joueurs/coachs** avec profils et réservations
- 🔄 **Système de paiement** Stripe intégré
- 🔄 **Intégration Discord** pour les sessions de coaching

## 🛠️ Stack Technique

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL avec Prisma ORM
- **Internationalisation**: next-intl
- **Validation**: Zod + React Hook Form
- **Package Manager**: pnpm

## 📁 Structure du Projet

```
src/
├── app/
│   └── [locale]/           # Routes internationalisées
│       ├── layout.tsx      # Layout principal avec i18n
│       ├── page.tsx        # Page d'accueil
│       └── api/
│           └── subscribe/  # API de souscription
├── components/
│   ├── landing/           # Composants de la landing page
│   └── language-switcher.tsx
├── i18n/
│   ├── config.ts          # Configuration des langues
│   └── request.ts         # Configuration next-intl
├── lib/
│   ├── db.ts              # Client Prisma
│   ├── utils.ts           # Utilitaires
│   └── validations/       # Schémas de validation Zod
└── messages/              # Fichiers de traduction JSON
```

## 🚀 Installation et Développement

### Prérequis
- Node.js 18+
- PostgreSQL
- pnpm

### Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd saas-edgemy
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Configuration de l'environnement**
Créer un fichier `.env` à la racine :
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/edgemy_db"

# Next.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Configuration de la base de données**
```bash
# Générer le client Prisma
pnpm prisma generate

# Créer et appliquer les migrations
pnpm prisma db push

# (Optionnel) Voir la base de données
pnpm prisma studio
```

5. **Lancer le serveur de développement**
```bash
pnpm dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🌍 Internationalisation

Le projet supporte 5 langues :
- 🇫🇷 **Français** (par défaut)
- 🇬🇧 **Anglais**
- 🇩🇪 **Allemand**
- 🇮🇹 **Italien**
- 🇪🇸 **Espagnol**

### URLs
- `/fr` - Version française
- `/en` - Version anglaise
- `/de` - Version allemande
- `/it` - Version italienne
- `/es` - Version espagnole

## 📊 Base de Données

### Modèle Subscriber (Phase 1)
```prisma
model Subscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  role      Role     // PLAYER ou COACH
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🔧 Scripts Disponibles

```bash
# Développement
pnpm dev

# Build de production
pnpm build

# Démarrer en production
pnpm start

# Linting
pnpm lint

# Prisma
pnpm prisma generate    # Générer le client
pnpm prisma db push     # Appliquer le schéma
pnpm prisma studio      # Interface graphique DB
```

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connecter le repository à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Variables d'environnement de production
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="production-secret"
NEXTAUTH_URL="https://your-domain.com"
```

## 🗺️ Roadmap

### Phase 2 - Authentification (2-3 semaines)
- [ ] NextAuth.js avec providers multiples
- [ ] Gestion des erreurs et reset password
- [ ] Tables User, Role, OAuthAccount, Session

### Phase 3 - Dashboard (3 semaines)
- [ ] Profils joueurs et coachs
- [ ] Listing des coachs avec filtres
- [ ] Gestion des offres de coaching
- [ ] Interface de réservation

### Phase 4 - Réservations (2 semaines)
- [ ] Intégration Stripe
- [ ] Création automatique de salons Discord
- [ ] Système de notifications

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support, contactez l'équipe de développement.

---

**Edgemy** - Révolutionner l'apprentissage du poker, une session à la fois. 🃏
