"use client";

import { Suspense } from "react";
import { AppHeader } from "./AppHeader";
import { AppFooter } from "./AppFooter";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Suspense fallback={<div className="h-16 sm:h-20 bg-slate-950/80 backdrop-blur-xl border-b border-white/5" />}>
        <AppHeader />
      </Suspense>
      <main className="flex-1">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
