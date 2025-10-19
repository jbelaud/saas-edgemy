"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useLocale } from "next-intl";

export function useCoachRoleSetup() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const locale = useLocale();

  useEffect(() => {
    const setupCoach = searchParams.get("setupCoach");
    const pendingCoachRole = localStorage.getItem("pendingCoachRole");

    if ((setupCoach === "true" || pendingCoachRole === "true") && session?.user) {
      console.log("Démarrage du setup coach pour:", session.user.id);
      
      // Vérifier l'email et mettre à jour le rôle à COACH
      Promise.all([
        fetch("/api/user/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }),
        fetch("/api/user/update-role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: "COACH" }),
        }),
      ])
        .then(async ([_verifyResponse, roleResponse]) => {
          if (roleResponse.ok) {
            console.log("Rôle COACH attribué avec succès");
            const data = await roleResponse.json();
            console.log("Profil coach créé:", data);
            
            // Nettoyer le localStorage
            localStorage.removeItem("pendingCoachRole");
            
            // Attendre un tout petit peu pour que la base de données soit à jour
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Recharger la page pour mettre à jour la session (sans le param setupCoach)
            window.location.href = `/${locale}/coach/dashboard`;
          } else {
            const errorData = await roleResponse.json();
            console.error("Erreur lors de la création du profil coach:", errorData);
          }
        })
        .catch((error) => {
          console.error("Erreur lors de l'attribution du rôle COACH:", error);
        });
    }
  }, [searchParams, session, locale]);
}
