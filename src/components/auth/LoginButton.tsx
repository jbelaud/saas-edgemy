'use client';

import { useTranslations } from 'next-intl';

export function LoginButton() {
  const t = useTranslations('header.auth');
  
  const handleLogin = () => {
    const event = new CustomEvent('openLoginModal');
    window.dispatchEvent(event);
  };

  return (
    <button
      onClick={handleLogin}
      className="text-emerald-400 hover:text-emerald-300 underline"
    >
      {t('login')}
    </button>
  );
}
