import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";

export const metadata: Metadata = {
  title: "Edgemy App - Plateforme de coaching poker",
  description: "Accédez à votre espace personnel Edgemy pour gérer vos sessions de coaching poker.",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-6">
        {children}
      </main>
    </div>
  );
}
