"use client";

import { PlayerSidebar } from "./PlayerSidebar";

interface PlayerLayoutProps {
  children: React.ReactNode;
}

export function PlayerLayout({ children }: PlayerLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      <PlayerSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
