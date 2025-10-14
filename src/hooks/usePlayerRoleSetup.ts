"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export function usePlayerRoleSetup() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  useEffect(() => {
    const setupPlayer = searchParams.get("setupPlayer");
    const pendingPlayerRole = localStorage.getItem("pendingPlayerRole");

    if ((setupPlayer === "true" || pendingPlayerRole === "true") && session?.user) {
      // Vérifier l'email et mettre à jour le rôle à PLAYER
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
          body: JSON.stringify({ role: "PLAYER" }),
        }),
      ])
        .then(([verifyResponse, roleResponse]) => {
          if (roleResponse.ok) {
            console.log("Rôle PLAYER attribué avec succès");
            // Nettoyer le localStorage
            localStorage.removeItem("pendingPlayerRole");
            // Recharger la page pour mettre à jour la session
            window.location.href = "/app/dashboard";
          }
        })
        .catch((error) => {
          console.error("Erreur lors de l'attribution du rôle PLAYER:", error);
        });
    }
  }, [searchParams, session]);
}
