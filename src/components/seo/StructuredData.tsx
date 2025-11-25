import Script from 'next/script';

interface StructuredDataProps {
  data: object;
}

/**
 * Composant pour injecter des données structurées JSON-LD dans le DOM
 * Utilisé pour le SEO et l'optimisation GEO (Generative Engine Optimization)
 */
export function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id={`structured-data-${JSON.stringify(data).substring(0, 20)}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
