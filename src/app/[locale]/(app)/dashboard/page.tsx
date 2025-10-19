'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useLocale } from 'next-intl';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const locale = useLocale();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    const redirect = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch('/api/user/role');
        if (response.ok) {
          const data = await response.json();
          
          // Redirection selon le rôle
          if (data.role === 'COACH') {
            router.push(`/${locale}/coach/dashboard`);
          } else if (data.role === 'PLAYER') {
            router.push(`/${locale}/player/dashboard`);
          } else {
            // Pour USER ou ADMIN, rediriger vers la page d'accueil
            router.push(`/${locale}`);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du rôle:', error);
        router.push('/');
      }
    };

    if (session?.user) {
      redirect();
    }
  }, [session, router]);

  if (isPending || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
}
