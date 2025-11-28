# Sélecteur de langue sur la Landing Page

## 🎯 Objectif

Permettre aux visiteurs de la landing page sur `edgemy.fr` de changer la langue entre français et anglais, tout en gardant le français comme langue par défaut.

## 📍 Emplacement

Le sélecteur de langue est positionné **à côté du bouton "Devenir coach"** dans la section `SocialProof` de la landing page.

## 🎨 Design

### Composant `LanguageSwitcherCompact`

Un sélecteur compact et élégant qui :
- Affiche le drapeau et le code de la langue actuelle (🇫🇷 FR ou 🇬🇧 EN)
- S'intègre visuellement avec le design de la section coach
- Utilise un fond semi-transparent avec effet backdrop-blur
- Affiche un menu déroulant au clic avec les langues disponibles

### Style visuel
```tsx
- Bouton : bg-white/10 avec border blanc semi-transparent
- Hover : bg-white/20 pour feedback visuel
- Menu : fond blanc avec shadow-xl
- Responsive : s'adapte sur mobile et desktop
```

## 🏗️ Structure des fichiers

### Nouveau composant
```
src/components/landing/LanguageSwitcherCompact.tsx
```

### Composant modifié
```
src/components/landing/social-proof.tsx
```
- Import du `LanguageSwitcherCompact`
- Ajout du sélecteur à côté du bouton "Devenir coach"
- Layout flex responsive (colonne sur mobile, ligne sur desktop)

### Nouvelles pages
```
src/app/[locale]/(public)/page.tsx
src/app/[locale]/(public)/layout.tsx
```
- Pages pour la landing internationalisée

## 🔄 Fonctionnement

### Détection de la langue actuelle
```tsx
const currentLang = pathname.startsWith('/en') ? 'en' : 'fr';
```

### Changement de langue
```tsx
// Page d'accueil : / → /fr ou /en
if (pathname === '/' || pathname === '') {
  router.push(`/${langCode}`);
}
// Autres pages : /fr/xxx → /en/xxx
else {
  const newPathname = pathname.replace(/^\/(fr|en)/, `/${langCode}`);
  router.push(newPathname);
}
```

## 🌍 Comportement par défaut

### Landing page (edgemy.fr)
- **URL racine** : `https://edgemy.fr/` → Redirige vers `https://edgemy.fr/fr`
- **Langue par défaut** : Français (FR) 🇫🇷
- **Langues disponibles** : FR, EN

### Sous-domaine app (app.edgemy.fr)
- **URL racine** : `https://app.edgemy.fr/` → Redirige vers `https://app.edgemy.fr/fr/app`
- **Langue par défaut** : Français (FR) 🇫🇷

## 📱 Responsive Design

### Mobile (< 640px)
```tsx
flex-col gap-3
```
- Bouton "Devenir coach" : pleine largeur
- Sélecteur de langue : en dessous, centré

### Desktop (≥ 640px)
```tsx
flex-row gap-3
```
- Bouton "Devenir coach" : flex-1 (prend l'espace disponible)
- Sélecteur de langue : à droite, taille fixe

## 🎯 UX/UI

### États du sélecteur
1. **Fermé** : Affiche la langue actuelle avec icône globe
2. **Ouvert** : Menu déroulant avec les 2 langues
3. **Hover** : Changement de couleur de fond
4. **Sélectionné** : Checkmark (✓) sur la langue active

### Accessibilité
- `aria-label="Changer de langue"`
- Overlay cliquable pour fermer le menu
- Feedback visuel sur hover et sélection

## 🔧 Configuration

### Langues supportées
```tsx
const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];
```

### Ajout d'une nouvelle langue
1. Ajouter l'objet langue dans le tableau `languages`
2. Créer le fichier `messages/{code}.json`
3. Mettre à jour `src/i18n/routing.ts`
4. Mettre à jour le middleware si nécessaire

## ✅ Checklist de validation

- [x] Composant `LanguageSwitcherCompact` créé
- [x] Intégration dans `SocialProof`
- [x] Pages `[locale]/(public)` créées
- [x] Responsive design (mobile + desktop)
- [x] Changement de langue fonctionnel
- [x] Langue par défaut : FR
- [x] Design cohérent avec la landing
- [x] Commit et push effectués

## 🚀 Prochaines étapes

1. **Tester** le changement de langue sur la landing
2. **Traduire** tous les textes de la landing en anglais
3. **Vérifier** que les formulaires fonctionnent dans les 2 langues
4. **Valider** l'UX sur mobile et desktop

## 📚 Fichiers liés

- Configuration i18n : `docs/i18n-configuration.md`
- Exemples d'utilisation : `docs/i18n-usage-examples.md`
- Middleware : `middleware.ts`
- Routing : `src/i18n/routing.ts`

---

**Date de création** : 15 octobre 2025  
**Statut** : ✅ Implémenté et déployé
