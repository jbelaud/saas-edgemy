"use client";

import { ReactNode } from "react";
import { GlassCard, GradientButton } from "@/components/ui";
import { Zap, CheckCircle2, Megaphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

interface SubscriptionGateProps {
  isActive: boolean;
  children: ReactNode;
  onOpenOnboarding?: () => void;
}

export function SubscriptionGate({
  isActive,
  children,
  onOpenOnboarding,
}: SubscriptionGateProps) {
  const router = useRouter();
  const locale = useLocale();

  if (!isActive) {
    return (
      <GlassCard className="text-center p-8 max-w-3xl mx-auto shadow-md border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/10 animate-fade-in">
        <div className="mb-6">
          <Megaphone className="h-16 w-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-3 text-white">
            Active ton abonnement pour débloquer cette fonctionnalité
          </h2>
          <p className="text-gray-300 text-base mb-2">
            Cette section est réservée aux coachs abonnés Edgemy.
          </p>
          <p className="text-gray-300 text-base">
            Active ton plan pour accéder à toutes les fonctionnalités
            et gérer ton activité de coaching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
          <div className="flex items-start gap-3 text-left">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-white">Profil public visible</p>
              <p className="text-sm text-gray-400">Apparaissez dans les résultats de recherche</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-left">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-white">Réservations illimitées</p>
              <p className="text-sm text-gray-400">Recevez autant de réservations que vous le souhaitez</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-left">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-white">Gestion des disponibilités</p>
              <p className="text-sm text-gray-400">Calendrier intelligent et synchronisation</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-left">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-white">Paiements sécurisés</p>
              <p className="text-sm text-gray-400">Recevez vos paiements directement</p>
            </div>
          </div>
        </div>

        <GradientButton
          size="lg"
          variant="amber"
          className="min-w-[280px]"
          onClick={() => {
            if (onOpenOnboarding) {
              onOpenOnboarding();
            } else {
              router.push(`/${locale}/coach/dashboard`);
            }
          }}
        >
          <Zap className="mr-2 h-5 w-5" />
          Activer mon abonnement
        </GradientButton>
      </GlassCard>
    );
  }

  return <>{children}</>;
}
