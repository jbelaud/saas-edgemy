import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering pour éviter l'erreur Prisma au build
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalider toutes les heures

/**
 * Génère le sitemap.xml dynamique pour le SEO
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://edgemy.fr';
  const locales = ['fr', 'en'];

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [];

  // Pour chaque locale, générer les URLs des pages statiques
  for (const locale of locales) {
    staticPages.push(
      {
        url: `${baseUrl}/${locale}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/${locale}/coachs`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/${locale}/pages/a-propos`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/${locale}/pages/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/${locale}/pages/blog`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }
    );
  }

  // Pages dynamiques : profils de coachs actifs
  try {
    const coaches = await prisma.coach.findMany({
      where: {
        status: { in: ['ACTIVE', 'PENDING_REVIEW'] }, // Seuls les coachs ACTIVE ou PENDING_REVIEW
        subscriptionStatus: 'ACTIVE',
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const coachPages: MetadataRoute.Sitemap = [];
    for (const coach of coaches) {
      for (const locale of locales) {
        coachPages.push({
          url: `${baseUrl}/${locale}/coach/${coach.slug}`,
          lastModified: coach.updatedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }

    return [...staticPages, ...coachPages];
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap:', error);
    // Retourner au moins les pages statiques si Prisma échoue
    return staticPages;
  }
}
