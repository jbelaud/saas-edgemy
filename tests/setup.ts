import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import './mocks/server'; // Importe et configure MSW

// Cleanup après chaque test
afterEach(() => {
  cleanup();
});

// Mock de Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock de next-intl
vi.mock('next-intl', () => ({
  useLocale: () => 'fr',
  useTranslations: () => (key: string) => key,
}));
