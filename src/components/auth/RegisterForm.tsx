'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn, signUp, useSession } from '@/lib/auth-client';
import { Mail, Lock, User, Chrome, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RegisterInput = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (session?.user && !isPending) {
      // Utiliser window.location pour forcer la redirection
      window.location.href = '/app/dashboard';
    }
  }, [session, isPending]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (result.error) {
        // Messages d'erreur plus explicites
        const errorMessage = result.error.message;
        if (errorMessage?.includes('already exists') || errorMessage?.includes('duplicate')) {
          setError('Cet email est déjà utilisé. Voulez-vous vous connecter ?');
        } else if (errorMessage?.includes('password')) {
          setError('Le mot de passe doit contenir au moins 8 caractères.');
        } else if (errorMessage?.includes('email')) {
          setError('Adresse email invalide. Veuillez vérifier votre saisie.');
        } else {
          setError(errorMessage || 'Erreur lors de l\'inscription. Veuillez réessayer.');
        }
      } else {
        setSuccess(true);
        // Redirection après inscription réussie
        setTimeout(() => {
          window.location.href = '/app/dashboard';
        }, 1500);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: '/app/dashboard',
      });
    } catch {
      setError('Erreur lors de la connexion avec Google');
      setIsLoading(false);
    }
  };

  // Afficher un loader pendant la vérification de session
  if (isPending) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Si déjà connecté, afficher un message de redirection
  if (session?.user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Vous êtes déjà connecté. Redirection...</p>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-600">Inscription réussie !</CardTitle>
          <CardDescription>
            Redirection vers votre dashboard...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
        <CardDescription>
          Rejoignez Edgemy et commencez votre progression
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
            <Label htmlFor="name">Nom complet</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                className="pl-10"
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

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
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
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
          <span className="text-muted-foreground">Déjà un compte ? </span>
          <a href="/app/auth/login" className="text-primary hover:underline">
            Se connecter
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
