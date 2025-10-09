import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { LanguageProvider } from "@/contexts/LanguageContext";

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
    <LanguageProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <main className="flex-1">
          {children}
        </main>
        <AppFooter />
      </div>
    </LanguageProvider>
  );
}
