'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AuthButton } from '@/components/auth/AuthButton';
import { LoginModal } from '@/components/auth/LoginModal';
import { CoachSignUpModal } from '@/components/auth/CoachSignUpModal';
import { PlayerSignUpModal } from '@/components/auth/PlayerSignUpModal';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';

export function AppHeader() {
  const { data: session, isPending } = useSession();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || 'fr';
  const t = useTranslations('header');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCoachSignUpModal, setShowCoachSignUpModal] = useState(false);
  const [showPlayerSignUpModal, setShowPlayerSignUpModal] = useState(false);
  const [signupContext, setSignupContext] = useState<'coach' | 'player'>('player');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prefilledEmail, setPrefilledEmail] = useState<string>('');

  // Check URL parameters to auto-open authentication modals
  useEffect(() => {
    const authParam = searchParams?.get('auth');
    const emailParam = searchParams?.get('email');

    if (authParam === 'signup') {
      setSignupContext('player');
      setShowPlayerSignUpModal(true);

      // Pre-fill email if provided
      if (emailParam) {
        setPrefilledEmail(emailParam);
      }
    } else if (authParam === 'signin') {
      setSignupContext('player');
      setShowLoginModal(true);
    }
  }, [searchParams]);

  // Listen for custom events from homepage CTAs
  useEffect(() => {
    const handleOpenLoginModal = () => {
      setSignupContext('player');
      setShowLoginModal(true);
    };

    const handleOpenCoachModal = () => {
      setSignupContext('coach');
      setShowCoachSignUpModal(true);
    };

    const handleOpenSignupModal = () => {
      setSignupContext('player');
      setShowPlayerSignUpModal(true);
    };

    window.addEventListener('openLoginModal', handleOpenLoginModal);
    window.addEventListener('openCoachModal', handleOpenCoachModal);
    window.addEventListener('openSignupModal', handleOpenSignupModal);

    return () => {
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
      window.removeEventListener('openCoachModal', handleOpenCoachModal);
      window.removeEventListener('openSignupModal', handleOpenSignupModal);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Navigation centrale */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href={`/${locale}/coachs`}
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              {t('nav.discoverCoaches')}
            </Link>
            <Link
              href={`/${locale}/pages/blog`}
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              {t('nav.blog')}
            </Link>
            <Link
              href={`/${locale}/pages/a-propos`}
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              {t('nav.about')}
            </Link>
            <Link
              href={`/${locale}/pages/contact`}
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              {t('nav.contact')}
            </Link>
          </nav>

          {/* Desktop: Auth Buttons & Language Switcher */}
          <div className="hidden lg:flex items-center gap-3 relative">
            <div className="w-10 flex-shrink-0 relative">
              <LanguageSwitcher />
            </div>
            {isPending ? (
              <div className="flex items-center gap-3">
                <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
                <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
              </div>
            ) : session?.user ? (
              <AuthButton />
            ) : (
              <>
                <Button 
                  variant="ghost"
                  onClick={() => {
                    setSignupContext('player');
                    setShowLoginModal(true);
                  }}
                  className="text-gray-300 hover:text-white hover:bg-white/5"
                >
                  {t('auth.login')}
                </Button>
                <Button 
                  onClick={() => {
                    setSignupContext('coach');
                    setShowCoachSignUpModal(true);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 shadow-lg shadow-amber-500/20"
                >
                  {t('auth.becomeCoach')}
                </Button>
              </>
            )}
          </div>

          {/* Mobile: Hamburger + Language */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="w-10 flex-shrink-0 relative">
              <LanguageSwitcher />
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all border border-white/10"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-b border-white/5 py-6 px-6">
            <nav className="flex flex-col gap-4 mb-6">
              <Link
                href={`/${locale}/coachs`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white transition-colors text-base font-medium py-2"
              >
                {t('nav.discoverCoaches')}
              </Link>
              <Link
                href={`/${locale}/pages/blog`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white transition-colors text-base font-medium py-2"
              >
                {t('nav.blog')}
              </Link>
              <Link
                href={`/${locale}/pages/a-propos`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white transition-colors text-base font-medium py-2"
              >
                {t('nav.about')}
              </Link>
              <Link
                href={`/${locale}/pages/contact`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white transition-colors text-base font-medium py-2"
              >
                {t('nav.contact')}
              </Link>
            </nav>

            {!session?.user && (
              <div className="flex flex-col gap-3">
                <Button 
                  variant="ghost"
                  onClick={() => {
                    setSignupContext('player');
                    setShowLoginModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-gray-300 hover:text-white hover:bg-white/5 justify-center"
                >
                  {t('auth.login')}
                </Button>
                <Button 
                  onClick={() => {
                    setSignupContext('coach');
                    setShowCoachSignUpModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/20"
                >
                  {t('auth.becomeCoach')}
                </Button>
              </div>
            )}
          </div>
        )}
      </header>

      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        context={signupContext}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          if (signupContext === 'coach') {
            setShowCoachSignUpModal(true);
          } else {
            setShowPlayerSignUpModal(true);
          }
        }}
      />
      <CoachSignUpModal
        open={showCoachSignUpModal}
        onOpenChange={setShowCoachSignUpModal}
        onSwitchToLogin={() => {
          setShowCoachSignUpModal(false);
          setSignupContext('coach');
          setShowLoginModal(true);
        }}
      />
      <PlayerSignUpModal
        open={showPlayerSignUpModal}
        onOpenChange={setShowPlayerSignUpModal}
        prefilledEmail={prefilledEmail}
        onSwitchToLogin={() => {
          setShowPlayerSignUpModal(false);
          setSignupContext('player');
          setShowLoginModal(true);
        }}
      />
    </>
  );
}
