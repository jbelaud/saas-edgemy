import type { Metadata } from "next";

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
    <div className="min-h-screen bg-gray-50">
      {/* Header App */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Edgemy App</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Version développement</span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
