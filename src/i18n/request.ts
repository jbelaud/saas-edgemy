import {hasLocale} from 'next-intl'
import {getRequestConfig} from 'next-intl/server'

import {routing} from './routing'

// Helper function to load and merge all translation files for a locale
async function loadMessages(locale: string) {
  const namespaces = [
    'common',
    'home',
    'header',
    'auth',
    'dashboard',
    'coach',
    'player',
    'footer'
  ];

  const messages: Record<string, unknown> = {};

  for (const ns of namespaces) {
    try {
      const nsMessages = (await import(`../../messages/${locale}/${ns}.json`)).default;
      messages[ns] = nsMessages;
    } catch {
      // Namespace not found, skip silently
    }
  }

  // Also try to load legacy flat file for backward compatibility
  try {
    const legacyMessages = (await import(`../../messages/${locale}.json`)).default;
    // Merge legacy messages at root level (they take lower priority)
    return { ...legacyMessages, ...messages };
  } catch {
    // No legacy file, just return modular messages
    return messages;
  }
}

export default getRequestConfig(async ({requestLocale}) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    messages: await loadMessages(locale),
  }
})
