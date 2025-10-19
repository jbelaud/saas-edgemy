"use client";

import { useState, useEffect } from "react";
import { signUp, signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [context, setContext] = useState<'coach' | 'player'>('player');
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const contextParam = searchParams.get('context');
    if (contextParam === 'coach' || contextParam === 'player') {
      setContext(contextParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const role = context === 'coach' ? 'COACH' : 'PLAYER';
      const dashboardUrl = context === 'coach' ? `/${locale}/coach/dashboard` : `/${locale}/player/dashboard`;
      
      // 1. Inscription de l'utilisateur
      await signUp.email({
        email,
        password,
        name: `${firstName} ${lastName}`.trim(),
        callbackURL: dashboardUrl,
      });
      
      // 2. Vérifier l'email automatiquement (pour dev/test)
      await fetch("/api/user/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      // 3. Mettre à jour le rôle
      const response = await fetch("/api/user/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la mise à jour du rôle");
      }
      
      router.push(dashboardUrl);
    } catch (err) {
      setError((err as Error).message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const role = context === 'coach' ? 'Coach' : 'Player';
      const dashboardUrl = context === 'coach' ? `/${locale}/coach/dashboard` : `/${locale}/player/dashboard`;
      const setupParam = context === 'coach' ? 'setupCoach' : 'setupPlayer';
      
      // Stocker l'intention dans le localStorage
      localStorage.setItem(`pending${role}Role`, "true");
      
      await signIn.social({
        provider: "google",
        callbackURL: `${dashboardUrl}?${setupParam}=true`,
      });
    } catch (error) {
      console.error("Erreur d'inscription Google:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link href="/" className="text-2xl font-bold text-primary">
              Edgemy
            </Link>
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">
              {context === 'coach' ? 'Devenir Coach Edgemy' : 'Créer un compte joueur'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Déjà inscrit ?{" "}
              <Link href="/app" className="font-semibold text-primary hover:underline">
                Se connecter
              </Link>
            </p>
          </div>

          <div className="mt-10">
            <div>
              <Button
                variant="outline"
                onClick={handleGoogleSignUp}
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

              <div className="relative mt-10">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm font-medium leading-6">
                  <span className="bg-white px-6 text-gray-900">Ou continuer avec</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-2"
                    placeholder="Jean"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-2"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2"
                  placeholder="jean.dupont@exemple.fr"
                />
              </div>

              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Inscription..." : "Créer mon compte"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Image/Branding */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <div className="text-center text-white p-12">
            <h1 className="text-4xl font-bold mb-4">Bienvenue sur Edgemy</h1>
            <p className="text-xl opacity-90">
              Rejoignez la plateforme de coaching poker de référence
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
