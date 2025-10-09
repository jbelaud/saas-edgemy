import { LoginForm } from '@/components/auth/LoginForm';
import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  // Vérifier la session côté serveur
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Si déjà connecté, rediriger immédiatement
  if (session?.user) {
    const callbackUrl = searchParams.callbackUrl || '/app/dashboard';
    redirect(callbackUrl);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<div>Chargement...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
