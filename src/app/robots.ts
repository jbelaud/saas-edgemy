import { MetadataRoute } from 'next';

/**
 * Génère le fichier robots.txt pour le SEO
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://edgemy.fr';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/player/',
          '/coach/activate',
          '/coach/agenda',
          '/coach/availability',
          '/coach/packs',
          '/coach/revenue',
          '/coach/settings',
          '/coach/students',
          '/coach/announcements',
          '/coach/dashboard',
          '/session/',
          '/signup',
          '/auth/',
          '/test/',
          '/unauthorized',
          '/debug-user',
          '/reservation-lite/',
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: [
          '/',
          '/coachs',
          '/coach/',
          '/pages/blog',
          '/pages/a-propos',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
        ],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: [
          '/',
          '/coachs',
          '/coach/',
          '/pages/blog',
          '/pages/a-propos',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
