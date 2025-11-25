"use client";

import { useState, useEffect } from "react";
import { signUp } from "@/lib/auth-client";
import { Modal, GradientButton, GradientText, Input, Label } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

interface PlayerSignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
  prefilledEmail?: string;
}

export function PlayerSignUpModal({
  open,
  onOpenChange,
  onSwitchToLogin,
  prefilledEmail
}: PlayerSignUpModalProps) {
  const router = useRouter();
  const locale = useLocale();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(prefilledEmail || "");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Update email if prefilledEmail changes
  useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
  }, [prefilledEmail]);

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
        callbackURL: `/${locale}/player/dashboard`,
      });

      // 2. Vérifier l'email automatiquement (pour dev/test)
      await fetch("/api/user/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // 3. Mettre à jour le rôle à PLAYER (si nécessaire)
      const response = await fetch("/api/user/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "PLAYER" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la mise à jour du rôle");
      }

      onOpenChange(false);
      router.push(`/${locale}/player/dashboard`);
    } catch (err) {
      setError((err as Error).message || "Une erreur est survenue");
    } finally {
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
          <GradientText variant="white">Créer un compte</GradientText>{" "}
          <GradientText variant="emerald">Joueur</GradientText>
        </h2>
        <p className="text-gray-400 text-sm">
          Rejoignez Edgemy et trouvez votre coach
        </p>
      </div>

      <div className="space-y-6">
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
              <Label htmlFor="firstName" className="text-gray-300">Prénom</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Jean"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-300">Nom</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Dupont"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="jean.dupont@exemple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500/50"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500/50"
            />
            <p className="text-xs text-gray-500">Minimum 8 caractères</p>
          </div>

          {/* Submit Button */}
          <GradientButton
            type="submit"
            variant="emerald"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? "Inscription..." : "Créer mon compte"}
          </GradientButton>
        </form>

        {/* Login Link */}
        <div className="text-center text-sm text-gray-400">
          Déjà inscrit ?{" "}
          {onSwitchToLogin ? (
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              Se connecter
            </button>
          ) : (
            <button
              onClick={() => onOpenChange(false)}
              className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              Se connecter
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
