'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { AuthButton } from '@/components/auth/AuthButton';
import { LoginModal } from '@/components/auth/LoginModal';
import { CoachSignUpModal } from '@/components/auth/CoachSignUpModal';
import { Button } from '@/components/ui/button';

export function AppHeader() {
  const { data: session } = useSession();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCoachSignUpModal, setShowCoachSignUpModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/app" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Edgemy
            </span>
          </Link>

          {/* Navigation centrale */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/app/dashboard"
              className="transition-colors hover:text-primary text-foreground/60"
            >
              Dashboard
            </Link>
            <Link
              href="/app/coachs"
              className="transition-colors hover:text-primary text-foreground/60"
            >
              Trouver un coach
            </Link>
            <Link
              href="/app/sessions"
              className="transition-colors hover:text-primary text-foreground/60"
            >
              Mes sessions
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {session?.user ? (
              <AuthButton />
            ) : (
              <>
                <Button 
                  variant="outline"
                  onClick={() => setShowCoachSignUpModal(true)}
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  Devenir Coach
                </Button>
                <Button 
                  variant="outline"
                  asChild
                >
                  <Link href="/app/signup">
                    S&apos;inscrire
                  </Link>
                </Button>
                <Button onClick={() => setShowLoginModal(true)}>
                  Se connecter
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      <CoachSignUpModal open={showCoachSignUpModal} onOpenChange={setShowCoachSignUpModal} />
    </>
  );
}
