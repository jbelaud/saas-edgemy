"use client";

import { useState } from "react";
import { signUp, signIn } from "@/lib/auth-client";
import { Modal, GradientButton, GradientText, Input, Label } from "@/components/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

interface CoachSignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
}

export function CoachSignUpModal({ open, onOpenChange, onSwitchToLogin }: CoachSignUpModalProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth.signUp');
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Inscription de l'utilisateur
      await signUp.email({
        email,
        password,
        name: `${firstName} ${lastName}`.trim(),
        callbackURL: `/${locale}/coach/dashboard`,
      });
      
      // 2. Vérifier l'email automatiquement (pour dev/test)
      await fetch("/api/user/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      // 3. Mettre à jour le rôle à COACH (crée aussi l'entrée dans la table coach)
      const response = await fetch("/api/user/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "COACH" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la mise à jour du rôle");
      }
      
      onOpenChange(false);
      router.push(`/${locale}/coach/dashboard`);
    } catch (err) {
      setError((err as Error).message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      // Le profil coach sera créé automatiquement dans le callback Google
      await signIn.social({
        provider: "google",
        callbackURL: `/${locale}/coach/dashboard?setupCoach=true`,
      });
    } catch (error) {
      console.error("Erreur d'inscription Google:", error);
      setIsLoading(false);
    }
  };

  return (
    <Modal 
      open={open} 
      onClose={() => onOpenChange(false)}
      maxWidth="lg"
    >
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">
          <GradientText variant="white">{t('title').split(' ').slice(0, 2).join(' ')}</GradientText>{" "}
          <GradientText variant="amber">Edgemy</GradientText>
        </h2>
        <p className="text-gray-400 text-sm">
          {t('subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        {/* Google Sign Up */}
        <GradientButton
          variant="ghost"
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          fullWidth
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
          {t('googleButton')}
        </GradientButton>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-2 text-gray-500">
              {t('orContinueWith')}
            </span>
          </div>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-300">{t('firstName')}</Label>
              <Input
                id="firstName"
                type="text"
                placeholder={t('firstNamePlaceholder')}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-300">{t('lastName')}</Label>
              <Input
                id="lastName"
                type="text"
                placeholder={t('lastNamePlaceholder')}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50"
            />
          </div>

          {/* Submit Button */}
          <GradientButton 
            type="submit" 
            variant="amber"
            fullWidth 
            disabled={isLoading}
          >
            {isLoading ? t('submitting') : t('submit')}
          </GradientButton>
        </form>

        {/* Login Link */}
        <div className="text-center text-sm text-gray-400">
          {t('alreadyMember')}{" "}
          {onSwitchToLogin ? (
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
            >
              {t('signIn')}
            </button>
          ) : (
            <Link 
              href="/app" 
              className="text-amber-400 hover:text-amber-300 transition-colors font-medium" 
              onClick={() => onOpenChange(false)}
            >
              {t('signIn')}
            </Link>
          )}
        </div>
      </div>
    </Modal>
  );
}
