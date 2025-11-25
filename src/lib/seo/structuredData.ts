/**
 * Générateurs de données structurées Schema.org pour le SEO
 * https://schema.org/
 */

interface OrganizationData {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}

interface PersonData {
  name: string;
  url: string;
  image?: string;
  jobTitle?: string;
  description?: string;
  sameAs?: string[];
}

interface ServiceData {
  name: string;
  description: string;
  provider: {
    name: string;
    url: string;
  };
  url: string;
  price?: number;
  priceCurrency?: string;
  serviceType?: string;
}

interface ReviewData {
  author: {
    name: string;
  };
  datePublished: string;
  reviewBody: string;
  reviewRating: {
    ratingValue: number;
    bestRating: number;
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Données structurées de l'organisation Edgemy
 */
export function generateOrganizationSchema(data: OrganizationData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    logo: data.logo,
    description: data.description,
    sameAs: data.sameAs || [],
  };
}

/**
 * Données structurées d'une personne (coach)
 */
export function generatePersonSchema(data: PersonData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.name,
    url: data.url,
    image: data.image,
    jobTitle: data.jobTitle || 'Coach Poker Professionnel',
    description: data.description,
    sameAs: data.sameAs || [],
  };
}

/**
 * Données structurées d'un service (offre de coaching)
 */
export function generateServiceSchema(data: ServiceData) {
  const schema: {
    '@context': string;
    '@type': string;
    name: string;
    description: string;
    provider: {
      '@type': string;
      name: string;
      url: string;
    };
    url: string;
    serviceType: string;
    offers?: {
      '@type': string;
      price: number;
      priceCurrency: string;
    };
  } = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: data.name,
    description: data.description,
    provider: {
      '@type': 'Person',
      name: data.provider.name,
      url: data.provider.url,
    },
    url: data.url,
    serviceType: data.serviceType || 'Coaching',
  };

  // Ajouter les informations de prix uniquement si disponibles
  if (data.price !== undefined && data.priceCurrency) {
    schema.offers = {
      '@type': 'Offer',
      price: data.price,
      priceCurrency: data.priceCurrency,
    };
  }

  return schema;
}

/**
 * Données structurées d'un avis
 */
export function generateReviewSchema(data: ReviewData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: data.author.name,
    },
    datePublished: data.datePublished,
    reviewBody: data.reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: data.reviewRating.ratingValue,
      bestRating: data.reviewRating.bestRating,
    },
  };
}

/**
 * Données structurées d'un fil d'Ariane (Breadcrumb)
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Données structurées agrégées pour un profil de coach
 * Combine Person + Service + AggregateRating
 */
export function generateCoachProfileSchema({
  coach,
  locale,
  announcements,
  averageRating,
  reviewCount,
}: {
  coach: {
    firstName: string;
    lastName: string;
    slug: string;
    bio?: string;
    avatarUrl?: string;
    twitterUrl?: string;
    twitchUrl?: string;
    youtubeUrl?: string;
  };
  locale: string;
  announcements: Array<{
    title: string;
    description: string;
    priceCents: number;
    type: string;
  }>;
  averageRating?: number;
  reviewCount?: number;
}) {
  const coachName = `${coach.firstName} ${coach.lastName}`;
  const coachUrl = `https://edgemy.fr/${locale}/coach/${coach.slug}`;

  const sameAs = [
    coach.twitterUrl,
    coach.twitchUrl,
    coach.youtubeUrl,
  ].filter(Boolean) as string[];

  // Schema de base pour le coach (Person)
  const personSchema = generatePersonSchema({
    name: coachName,
    url: coachUrl,
    image: coach.avatarUrl,
    description: coach.bio,
    sameAs,
  });

  // Schemas pour chaque service
  const serviceSchemas = announcements.slice(0, 5).map(announcement =>
    generateServiceSchema({
      name: announcement.title,
      description: announcement.description,
      provider: {
        name: coachName,
        url: coachUrl,
      },
      url: coachUrl,
      price: announcement.priceCents / 100,
      priceCurrency: 'EUR',
      serviceType: announcement.type,
    })
  );

  // Si on a des avis, ajouter AggregateRating au schema Person
  if (averageRating && reviewCount && reviewCount > 0) {
    (personSchema as Record<string, unknown>).aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      reviewCount: reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return [personSchema, ...serviceSchemas];
}
