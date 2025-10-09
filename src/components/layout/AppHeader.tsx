'use client';

import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
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
      </div>
    </header>
  );
}
