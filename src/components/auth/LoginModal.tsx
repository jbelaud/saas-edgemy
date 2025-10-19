"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context?: 'coach' | 'player';
  onSwitchToSignup?: () => void;
}

export function LoginModal({ open, onOpenChange, context = 'player', onSwitchToSignup }: LoginModalProps) {
  // En dev, pré-remplir avec le compte de test
  const isDev = process.env.NODE_ENV === 'development';
  const [email, setEmail] = useState(isDev ? "coach-actif@edgemy.fr" : "");
  const [password, setPassword] = useState(isDev ? "Password123!" : "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    console.log('🔐 Tentative de connexion avec:', { email, password: '***' });
    
    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });
      
      console.log('✅ Résultat complet:', JSON.stringify(result, null, 2));
      
      if (result?.error) {
        // Extraire le message d'erreur de manière robuste
        const err = result.error as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        let errorMessage = "Erreur de connexion";
        
        if (typeof err === 'string') {
          errorMessage = err;
        } else if (err && typeof err === 'object') {
          errorMessage = err.message || JSON.stringify(err);
        }
        
        setError(errorMessage);
        console.error('❌ Erreur détaillée:', result.error);
      } else if (result?.data) {
        console.log('✅ Connexion réussie, données:', result.data);
        onOpenChange(false);
        // Force reload pour s'assurer que la session est bien chargée
        window.location.href = "/dashboard";
      } else {
        console.log('⚠️ Résultat inattendu:', result);
        setError("Résultat de connexion inattendu");
      }
    } catch (error) {
      console.error("❌ Exception lors de la connexion:", error);
      if (error instanceof Error) {
        console.error("❌ Stack:", error.stack);
        console.error("❌ Message:", error.message);
        setError(error.message);
      } else {
        setError("Une erreur est survenue lors de la connexion");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Pour la connexion, on ne définit pas de rôle spécifique
      // Le rôle sera déjà défini si l'utilisateur existe
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (error) {
      console.error("Erreur de connexion Google:", error);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Se connecter</DialogTitle>
          <DialogDescription>
            Connectez-vous à votre compte Edgemy
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuer avec Google
          </Button>

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

          <form onSubmit={handleEmailLogin} className="grid gap-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="coach-actif@edgemy.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Password123!"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {isDev && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded text-xs">
                💡 Mode dev : Champs pré-remplis avec coach-actif@edgemy.fr
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <div className="text-center text-sm">
            Pas encore de compte ?{" "}
            {onSwitchToSignup ? (
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-primary hover:underline font-medium"
              >
                S&apos;inscrire
              </button>
            ) : (
              <Link href={`/signup?context=${context}`} className="text-primary hover:underline">
                S&apos;inscrire
              </Link>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
