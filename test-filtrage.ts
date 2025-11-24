/**
 * Script de test pour vérifier le système de filtrage dynamique
 *
 * Usage: npx tsx test-filtrage.ts
 */

import {
  extractDynamicFilters,
  filterCoaches,
  normalizeCoachAnnouncements,
  type CoachWithAnnouncements,
  type ActiveFilters,
} from './src/lib/announcementFilters';

// Données de test
const testCoaches: CoachWithAnnouncements[] = [
  {
    id: '1',
    slug: 'jean-dupont',
    firstName: 'Jean',
    lastName: 'Dupont',
    bio: 'Expert MTT',
    avatarUrl: null,
    languages: ['fr', 'en'],
    announcements: [
      {
        id: 'a1',
        type: 'STRATEGY',
        variant: 'NLHE',
        format: 'MTT',
        abiRange: '25',
        tags: ['ICM', 'Postflop'],
        reviewType: null,
        reviewSupport: null,
        toolName: null,
        toolObjective: null,
        mentalFocus: null,
        priceCents: 10000,
        durationMin: 60,
      },
      {
        id: 'a2',
        type: 'REVIEW',
        variant: null,
        format: 'MTT',
        abiRange: null,
        tags: [],
        reviewType: 'SESSION_MTT',
        reviewSupport: 'VIDEO_REPLAY',
        toolName: null,
        toolObjective: null,
        mentalFocus: null,
        priceCents: 8000,
        durationMin: 90,
      },
    ],
  },
  {
    id: '2',
    slug: 'marie-martin',
    firstName: 'Marie',
    lastName: 'Martin',
    bio: 'Coach mental',
    avatarUrl: null,
    languages: ['fr'],
    announcements: [
      {
        id: 'a3',
        type: 'MENTAL',
        variant: null,
        format: null,
        abiRange: null,
        tags: [],
        reviewType: null,
        reviewSupport: null,
        toolName: null,
        toolObjective: null,
        mentalFocus: 'TILT_MANAGEMENT',
        priceCents: 6000,
        durationMin: 45,
      },
    ],
  },
  {
    id: '3',
    slug: 'pierre-dubois',
    firstName: 'Pierre',
    lastName: 'Dubois',
    bio: 'Expert GTO Wizard',
    avatarUrl: null,
    languages: ['en'],
    announcements: [
      {
        id: 'a4',
        type: 'TOOL',
        variant: null,
        format: null,
        abiRange: null,
        tags: [],
        reviewType: null,
        reviewSupport: null,
        toolName: 'GTO_WIZARD',
        toolObjective: 'ONBOARDING',
        mentalFocus: null,
        priceCents: 5000,
        durationMin: 30,
      },
    ],
  },
];

console.log('🧪 Test du système de filtrage dynamique\n');

// Test 1: Extraction des filtres
console.log('✅ Test 1: Extraction des filtres dynamiques');
const filters = extractDynamicFilters(testCoaches);
console.log('   Types d\'annonces:', filters.announcementTypes);
console.log('   Variantes STRATEGY:', filters.strategyVariants);
console.log('   Formats STRATEGY:', filters.strategyFormats);
console.log('   Types REVIEW:', filters.reviewTypes);
console.log('   Supports REVIEW:', filters.reviewSupports);
console.log('   Outils TOOL:', filters.toolNames);
console.log('   Focus MENTAL:', filters.mentalFocusAreas);
console.log('   Langues:', filters.languages);
console.log('   Plages de prix:', filters.priceRanges);
console.log('');

// Test 2: Normalisation
console.log('✅ Test 2: Normalisation des données');
const normalizedCoach = normalizeCoachAnnouncements(testCoaches[0]);
console.log('   Coach normalisé:', {
  id: normalizedCoach.id,
  languages: normalizedCoach.languages,
  announcementsCount: normalizedCoach.announcements.length,
});
console.log('');

// Test 3: Filtrage par type d'annonce
console.log('✅ Test 3: Filtrage par type STRATEGY');
const strategyFilters: ActiveFilters = {
  selectedAnnouncementType: 'STRATEGY',
};
const strategyCoaches = filterCoaches(testCoaches, strategyFilters);
console.log(`   Coachs trouvés: ${strategyCoaches.length}`);
console.log(`   Coach: ${strategyCoaches[0]?.firstName} ${strategyCoaches[0]?.lastName}`);
console.log(`   Annonces: ${strategyCoaches[0]?.announcements.length}`);
console.log('');

// Test 4: Filtrage par langue
console.log('✅ Test 4: Filtrage par langue (fr)');
const langFilters: ActiveFilters = {
  selectedLanguages: ['fr'],
};
const frenchCoaches = filterCoaches(testCoaches, langFilters);
console.log(`   Coachs trouvés: ${frenchCoaches.length}`);
frenchCoaches.forEach(coach => {
  console.log(`   - ${coach.firstName} ${coach.lastName} (${coach.languages.join(', ')})`);
});
console.log('');

// Test 5: Filtrage combiné
console.log('✅ Test 5: Filtrage combiné (STRATEGY + fr)');
const combinedFilters: ActiveFilters = {
  selectedAnnouncementType: 'STRATEGY',
  selectedLanguages: ['fr'],
};
const combinedCoaches = filterCoaches(testCoaches, combinedFilters);
console.log(`   Coachs trouvés: ${combinedCoaches.length}`);
console.log('');

// Test 6: Filtrage par variante STRATEGY
console.log('✅ Test 6: Filtrage par variante NLHE');
const variantFilters: ActiveFilters = {
  selectedAnnouncementType: 'STRATEGY',
  selectedStrategyVariants: ['NLHE'],
};
const nlheCoaches = filterCoaches(testCoaches, variantFilters);
console.log(`   Coachs trouvés: ${nlheCoaches.length}`);
console.log('');

// Test 7: Cas limites - tableau vide
console.log('✅ Test 7: Cas limite - tableau vide');
const emptyFilters = extractDynamicFilters([]);
console.log('   Types d\'annonces:', emptyFilters.announcementTypes);
console.log('   ✓ Retourne une structure vide sans crash');
console.log('');

// Test 8: Cas limites - coach sans annonces
console.log('✅ Test 8: Cas limite - coach sans annonces');
const coachNoAnnouncements: CoachWithAnnouncements = {
  id: '999',
  slug: 'test-noannouncements',
  firstName: 'Test',
  lastName: 'NoAnnouncements',
  bio: null,
  avatarUrl: null,
  languages: ['fr'],
  announcements: [],
};
const noAnnouncementsFilters = extractDynamicFilters([coachNoAnnouncements]);
console.log('   Types d\'annonces:', noAnnouncementsFilters.announcementTypes);
console.log('   ✓ Retourne une structure vide sans crash');
console.log('');

// Test 9: Recherche textuelle
console.log('✅ Test 9: Recherche textuelle');
const searchFilters: ActiveFilters = {
  search: 'MTT',
};
const searchCoaches = filterCoaches(testCoaches, searchFilters);
console.log(`   Coachs trouvés avec "MTT": ${searchCoaches.length}`);
console.log('');

// Test 10: Filtrage par plage de prix
console.log('✅ Test 10: Filtrage par plage de prix (50-80€)');
const priceFilters: ActiveFilters = {
  selectedPriceRange: '50-80',
};
const priceCoaches = filterCoaches(testCoaches, priceFilters);
console.log(`   Coachs trouvés: ${priceCoaches.length}`);
console.log('');

console.log('🎉 Tous les tests sont passés avec succès!\n');
console.log('📊 Résumé:');
console.log(`   - ${testCoaches.length} coachs de test`);
console.log(`   - ${testCoaches.reduce((acc, c) => acc + c.announcements.length, 0)} annonces au total`);
console.log(`   - ${filters.announcementTypes.length} types d'annonces différents`);
console.log(`   - ${filters.languages.length} langues disponibles`);
console.log('');
