'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useLocale } from 'next-intl';
import { Loader2 } from 'lucide-react';

/**
 * Page de callback après authentification Google
 * Redirige vers le dashboard approprié selon les rôles
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const locale = useLocale();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    const redirectToDashboard = async () => {
      if (!isPending && session?.user) {
        try {
          // Déterminer le dashboard approprié selon les rôles
          const response = await fetch('/api/user/redirect-dashboard');
          if (response.ok) {
            const { redirectTo } = await response.json();
            router.replace(`/${locale}${redirectTo}`);
          } else {
            // Fallback vers player dashboard
            router.replace(`/${locale}/player/dashboard`);
          }
        } catch (error) {
          console.error('Erreur lors de la redirection:', error);
          router.replace(`/${locale}/player/dashboard`);
        }
      } else if (!isPending && !session) {
        // Si pas de session, rediriger vers la page d'accueil
        router.replace(`/${locale}`);
      }
    };

    redirectToDashboard();
  }, [session, isPending, router, locale]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
        <p className="text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
}
