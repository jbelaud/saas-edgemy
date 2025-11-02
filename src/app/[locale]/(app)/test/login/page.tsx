'use client';

import { useState } from 'react';
import { signIn } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

/**
 * Page de login simplifiée pour les tests E2E
 * Cette page permet aux tests Playwright de se connecter facilement
 *
 * ⚠️ À DÉSACTIVER EN PRODUCTION ⚠️
 */
export default function TestLoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Désactiver en production
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_TEST_ROUTES !== 'true') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Cette page n&apos;est disponible qu&apos;en développement</h1>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.email({
        email,
        password,
        fetchOptions: {
          onSuccess: () => {
            // Empêcher la redirection automatique de Better Auth
          },
        },
      });

      console.log('🔍 SignIn result:', result);
      console.log('🔍 result?.data:', result?.data);
      console.log('🔍 result?.error:', result?.error);

      if (result?.error) {
        const err = result.error as { message?: string };
        setError(err.message || 'Erreur de connexion');
      } else {
        // Connexion réussie - rediriger vers le dashboard approprié selon le rôle
        console.log('✅ Login successful, determining dashboard...');

        // Petit délai pour laisser le temps aux cookies de session de se propager
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
          // Utiliser l'API pour déterminer le bon dashboard selon le rôle
          const response = await fetch('/api/user/redirect-dashboard', {
            credentials: 'include', // Important: inclure les cookies
          });

          console.log('🔍 Redirect API response status:', response.status);

          if (response.ok) {
            const { redirectTo } = await response.json();
            console.log('✅ Redirecting to:', redirectTo);
            // Utiliser setTimeout pour laisser React terminer avant de naviguer
            setTimeout(() => {
              window.location.href = `/${locale}${redirectTo}`;
            }, 0);
          } else {
            // Fallback vers player dashboard
            console.log('⚠️ API failed, using fallback redirect');
            setTimeout(() => {
              window.location.href = `/${locale}/player/dashboard`;
            }, 0);
          }
        } catch (error) {
          console.error('❌ Redirect error:', error);
          // Fallback vers player dashboard
          router.push(`/${locale}/player/dashboard`);
        }
      }
    } catch (error) {
      console.error('❌ SignIn error:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-md p-8 bg-slate-800 rounded-xl border border-white/10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Test Login</h1>
          <p className="text-sm text-gray-400">Page de test pour l&apos;authentification E2E</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="test@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white"
              data-testid="email-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">
              Mot de passe
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white"
              data-testid="password-input"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            data-testid="submit-button"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-300 font-mono">
            💡 Cette page est utilisée pour les tests automatisés
          </p>
        </div>
      </div>
    </div>
  );
}
