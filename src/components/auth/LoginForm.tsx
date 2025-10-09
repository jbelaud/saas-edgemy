'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn, useSession } from '@/lib/auth-client';
import { Mail, Lock, Chrome, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginInput = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const callbackUrl = searchParams.get('callbackUrl') || '/app/dashboard';

  // Si l'utilisateur est déjà connecté (retour OAuth), rediriger
  useEffect(() => {
    if (session?.user) {
      router.push(callbackUrl);
    }
  }, [session, callbackUrl, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: callbackUrl, // Better Auth gère la redirection automatiquement
      });

      if (result.error) {
        // Messages d'erreur plus explicites
        const errorMessage = result.error.message;
        if (errorMessage?.includes('Invalid email or password')) {
          setError('Email ou mot de passe incorrect. Veuillez réessayer.');
        } else if (errorMessage?.includes('User not found')) {
          setError('Aucun compte trouvé avec cet email. Voulez-vous vous inscrire ?');
        } else {
          setError(errorMessage || 'Erreur de connexion. Veuillez réessayer.');
        }
        setIsLoading(false);
      }
      // Pas besoin de else - Better Auth redirige automatiquement
    } catch (err) {
      console.error('Login error:', err);
      setError('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: callbackUrl,
      });
    } catch {
      setError('Erreur lors de la connexion avec Google');
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
        <CardDescription>
          Connectez-vous à votre compte Edgemy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                className="pl-10"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
            <div className="text-right">
              <a 
                href="/app/auth/forgot-password" 
                className="text-sm text-primary hover:underline"
              >
                Mot de passe oublié ?
              </a>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou continuer avec
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <Chrome className="mr-2 h-4 w-4" />
          Google
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Pas encore de compte ? </span>
          <a href="/app/auth/register" className="text-primary hover:underline">
            S&apos;inscrire
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
