'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { AuthButton } from '@/components/auth/AuthButton';
import { LoginModal } from '@/components/auth/LoginModal';
import { CoachSignUpModal } from '@/components/auth/CoachSignUpModal';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Button } from '@/components/ui/button';

export function AppHeader() {
  const { data: session, isPending } = useSession();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCoachSignUpModal, setShowCoachSignUpModal] = useState(false);
  const [signupContext, setSignupContext] = useState<'coach' | 'player'>('player');

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

    window.addEventListener('openLoginModal', handleOpenLoginModal);
    window.addEventListener('openCoachModal', handleOpenCoachModal);

    return () => {
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
      window.removeEventListener('openCoachModal', handleOpenCoachModal);
    };
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <span className="text-slate-950 font-bold text-xl">E</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Edgemy
            </span>
          </Link>

          {/* Navigation centrale */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/coachs"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Découvrir les coachs
            </Link>
            <a
              href="#features"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Fonctionnalités
            </a>
            <a
              href="#for-players"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Pour les joueurs
            </a>
            <a
              href="#for-coaches"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Pour les coachs
            </a>
            <a
              href="#about"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              À propos
            </a>
          </nav>

          {/* Auth Buttons & Language Switcher */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {isPending ? (
              // Skeleton pendant le chargement pour éviter le flash
              <div className="flex items-center gap-3">
                <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
                <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
                <div className="h-9 w-28 bg-muted animate-pulse rounded-md" />
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
                  Se connecter
                </Button>
                <Button 
                  onClick={() => {
                    setSignupContext('coach');
                    setShowCoachSignUpModal(true);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 shadow-lg shadow-amber-500/20"
                >
                  Devenir Coach
                </Button>
              </>
            )}
          </div>
        </div>
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
            // Pour player, on redirige vers /signup avec le contexte
            window.location.href = '/signup?context=player';
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
    </>
  );
}
