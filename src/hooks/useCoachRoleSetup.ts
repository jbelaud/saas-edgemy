"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export function useCoachRoleSetup() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  useEffect(() => {
    const setupCoach = searchParams.get("setupCoach");
    const pendingCoachRole = localStorage.getItem("pendingCoachRole");

    if ((setupCoach === "true" || pendingCoachRole === "true") && session?.user) {
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
        .then(([_verifyResponse, roleResponse]) => {
          if (roleResponse.ok) {
            console.log("Rôle COACH attribué avec succès");
            // Nettoyer le localStorage
            localStorage.removeItem("pendingCoachRole");
            // Recharger la page pour mettre à jour la session
            window.location.href = "/coach/dashboard";
          }
        })
        .catch((error) => {
          console.error("Erreur lors de l'attribution du rôle COACH:", error);
        });
    }
  }, [searchParams, session]);
}
