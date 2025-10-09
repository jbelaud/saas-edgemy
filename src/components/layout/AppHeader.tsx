'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { AuthButton } from '@/components/auth/AuthButton';
import { LoginModal } from '@/components/auth/LoginModal';
import { Button } from '@/components/ui/button';

export function AppHeader() {
  const { data: session } = useSession();
  const [showLoginModal, setShowLoginModal] = useState(false);

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

          {/* Auth Button ou Login */}
          <div>
            {session?.user ? (
              <AuthButton />
            ) : (
              <Button onClick={() => setShowLoginModal(true)}>
                Se connecter
              </Button>
            )}
          </div>
        </div>
      </header>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </>
  );
}
