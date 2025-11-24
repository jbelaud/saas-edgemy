/**
 * Utilitaires pour gérer les URLs YouTube
 */

/**
 * Extrait l'ID d'une vidéo YouTube depuis différents formats d'URL
 *
 * Formats supportés:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 *
 * @param url - URL YouTube complète
 * @returns ID de la vidéo ou null si invalide
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  // Nettoyer l'URL
  url = url.trim();

  // Pattern pour youtube.com/watch?v=ID
  const watchPattern = /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;
  const watchMatch = url.match(watchPattern);
  if (watchMatch) return watchMatch[1];

  // Pattern pour youtu.be/ID
  const shortPattern = /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const shortMatch = url.match(shortPattern);
  if (shortMatch) return shortMatch[1];

  // Pattern pour youtube.com/embed/ID
  const embedPattern = /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const embedMatch = url.match(embedPattern);
  if (embedMatch) return embedMatch[1];

  // Pattern pour youtube.com/v/ID
  const vPattern = /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/;
  const vMatch = url.match(vPattern);
  if (vMatch) return vMatch[1];

  // Si c'est déjà juste un ID (11 caractères alphanumériques)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  return null;
}

/**
 * Valide si une URL YouTube est valide
 *
 * @param url - URL à valider
 * @returns true si l'URL est valide
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

/**
 * Génère l'URL d'embed YouTube à partir d'une URL quelconque
 *
 * @param url - URL YouTube
 * @returns URL d'embed ou null si invalide
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;

  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Génère l'URL de la miniature YouTube
 *
 * @param url - URL YouTube
 * @param quality - Qualité de la miniature ('default' | 'hq' | 'mq' | 'sd' | 'maxres')
 * @returns URL de la miniature ou null si invalide
 */
export function getYouTubeThumbnailUrl(
  url: string,
  quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq'
): string | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;

  const qualityMap = {
    default: 'default',
    hq: 'hqdefault',
    mq: 'mqdefault',
    sd: 'sddefault',
    maxres: 'maxresdefault',
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}
