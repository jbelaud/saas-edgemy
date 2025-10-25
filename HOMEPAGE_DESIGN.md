# Homepage Edgemy - Documentation Design

## 🎨 Vue d'ensemble

Homepage moderne et élégante pour Edgemy, plateforme SaaS de coaching poker. Design inspiré de Notion, Superprof et CoachHub avec une atmosphère stratégique poker.

## 🎯 Thème & Style

### Palette de couleurs
- **Background**: Slate 950/900 (anthracite/deep navy)
- **Accents primaires**: Amber 400-600 (doré)
- **Accents secondaires**: Emerald/Teal 400-600 (mint)
- **Texte**: White/Gray gradients

### Typographie
- **Font**: System fonts (Geist Sans/Mono via Next.js)
- **Titres**: Bold, gradients from-white to-gray
- **Accents**: Gradients amber/emerald selon contexte

### Design System
- **Border radius**: 2xl (rounded-2xl/3xl)
- **Spacing**: Padding généreux (p-8, p-10)
- **Shadows**: Soft shadows avec couleurs d'accent
- **Effects**: Hover scale, fade-in, pulse animations

## 📐 Structure de la page

### 1. **LandingHeader** (Sticky)
- Logo Edgemy avec icône "E" dorée
- Navigation: Découvrir coachs, Fonctionnalités, Pour joueurs, Pour coachs, À propos
- CTAs: "Se connecter" (ghost) + "Créer un compte" (accent)
- Menu mobile responsive

### 2. **HeroSection** (Above the fold)
- Background: Gradient dark avec orbes animés
- Pattern: Grid subtil + symboles poker (♠♥♣♦)
- Titre principal: "Progresse plus vite. Avec les meilleurs coachs de poker."
- Sous-titre: Value proposition claire
- CTAs: "Trouver un coach" (primary) + "Devenir coach" (secondary)
- Social proof: Badges vérification (coachs vérifiés, paiements sécurisés, suivi)

### 3. **HowItWorksSection** (3 étapes)
- Étape 01: Choisis ton coach (icône recherche)
- Étape 02: Réserve ta session (icône calendrier)
- Étape 03: Progresse avec ton coach (icône graphique)
- Cards avec numéros en badge doré
- Hover effects avec scale et glow

### 4. **WhyEdgemySection** (4 features)
- **Coachs vérifiés**: Badge vert/teal
- **Sessions personnalisées**: Badge doré
- **Paiements sécurisés**: Badge bleu
- **Suivi de progression**: Badge violet/rose
- Grid 4 colonnes responsive
- Hover effects avec translation verticale

### 5. **DualSection** (Players/Coaches)
Deux cards côte à côte:

**Card Joueurs** (Emerald/Teal):
- Icône utilisateur
- Liste features avec checkmarks
- CTA: "Créer un compte joueur"
- Glow effect emerald

**Card Coachs** (Amber):
- Icône briefcase
- Liste features avec checkmarks
- CTA: "Devenir coach sur Edgemy"
- Glow effect amber

### 6. **TestimonialsSection**
- 4 témoignages en grid
- Avatars avec initiales
- Rating 5 étoiles
- Citations avec guillemets
- Stats en bas: 100+ coachs, 500+ joueurs, 1000+ sessions, 4.9/5

### 7. **MissionSection**
- Badge "Notre mission"
- Titre: "Rendre le coaching poker plus humain et accessible"
- 3 valeurs: Communauté, Qualité, Simplicité
- Citation de l'équipe Edgemy
- Background avec orbes subtils

### 8. **FinalCTASection**
- Titre: "Rejoins la communauté Edgemy dès aujourd'hui"
- 2 CTAs: Joueur (emerald) + Coach (amber)
- Trust indicators: Inscription gratuite, Sans engagement, Support 7j/7

### 9. **LandingFooter**
4 colonnes:
- **Branding**: Logo + tagline
- **Navigation**: Liens principaux
- **Ressources**: Contact, FAQ, Blog, Aide
- **Légal**: CGU, Confidentialité + Socials (Discord, Twitter, LinkedIn)

Bottom bar: Copyright + badges sécurité Stripe

## 🎭 Animations & Interactions

### Hover Effects
- **Buttons**: Scale 1.05 + shadow enhancement
- **Cards**: Translation -2px + border glow
- **Icons**: Scale 1.1
- **Links**: Color transition

### Background Animations
- **Orbes**: Pulse animation avec delays
- **Gradients**: Opacity transitions
- **Glow effects**: Blur opacity sur hover

### Scroll Behavior
- **Header**: Sticky avec backdrop blur
- **Sections**: Smooth scroll pour ancres

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (md)
- **Tablet**: 768px - 1024px (md-lg)
- **Desktop**: > 1024px (lg+)

### Adaptations Mobile
- Menu hamburger
- Grid → Stack (1 colonne)
- Font sizes réduits
- Padding ajusté
- CTAs full-width

## 🔗 Navigation & Liens

### Liens internes
- `/signup?context=player` → Inscription joueur
- `/signup?context=coach` → Inscription coach
- `/signin` → Connexion
- Ancres: `#coaches`, `#features`, `#for-players`, `#for-coaches`, `#about`

### Liens externes
- Discord, Twitter, LinkedIn (footer)
- À configurer avec vraies URLs

## 🎨 Composants Créés

```
src/components/landing/
├── LandingHeader.tsx       # Header sticky avec navigation
├── HeroSection.tsx         # Hero avec CTAs
├── HowItWorksSection.tsx   # 3 étapes
├── WhyEdgemySection.tsx    # 4 features
├── DualSection.tsx         # Players/Coaches cards
├── TestimonialsSection.tsx # Témoignages + stats
├── MissionSection.tsx      # Mission/Vision
├── FinalCTASection.tsx     # CTA final
├── LandingFooter.tsx       # Footer complet
└── index.ts                # Exports
```

## 🚀 Utilisation

La page principale (`src/app/[locale]/page.tsx`) importe et assemble tous les composants:

```tsx
import { LandingHeader, HeroSection, ... } from '@/components/landing'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950">
      <LandingHeader />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <WhyEdgemySection />
        <DualSection />
        <TestimonialsSection />
        <MissionSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
```

## ✨ Points forts du design

1. **Cohérence visuelle**: Palette limitée (slate/amber/emerald) utilisée de manière cohérente
2. **Hiérarchie claire**: Titres gradients, sections bien délimitées
3. **Micro-interactions**: Hover effects sur tous les éléments interactifs
4. **Performance**: Composants client uniquement où nécessaire
5. **Accessibilité**: Aria-labels, contraste suffisant, navigation clavier
6. **SEO-friendly**: Structure sémantique HTML5
7. **Mobile-first**: Design responsive avec breakpoints appropriés

## 🎯 Conversion Optimization

- **Above the fold**: Value proposition + 2 CTAs clairs
- **Social proof**: Badges, stats, témoignages
- **Dual path**: Séparation claire joueurs/coachs
- **Trust signals**: Sécurité, vérification, garanties
- **Multiple CTAs**: Répétés stratégiquement dans la page
- **Friction minimale**: Inscription en 1 clic

## 🔄 Prochaines étapes

1. **Internationalisation**: Ajouter traductions (next-intl)
2. **Analytics**: Tracking conversions
3. **A/B Testing**: Tester variantes CTAs
4. **Images**: Ajouter vraies photos coaching
5. **Animations**: Scroll animations (framer-motion)
6. **SEO**: Meta tags, Open Graph, Schema.org

---

**Design créé le**: 25 octobre 2025  
**Stack**: Next.js 15 + Tailwind CSS 4 + TypeScript  
**Inspiration**: Notion, Superprof, CoachHub
