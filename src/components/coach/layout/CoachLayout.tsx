"use client";

import { CoachSidebar } from "./CoachSidebar";

interface CoachLayoutProps {
  children: React.ReactNode;
}

export function CoachLayout({ children }: CoachLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      {/* Sidebar */}
      <CoachSidebar />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 pt-8 max-w-7xl">
          {children}
        </div>
      </div>
    </div>
  );
}
