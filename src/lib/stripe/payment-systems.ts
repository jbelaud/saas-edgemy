/**
 * Configuration des systèmes de paiement Edgemy
 * 
 * Ce fichier définit les 3 modes de paiement disponibles :
 * - SYSTEM_A : Paiement intégral immédiat (ACTIF)
 * - SYSTEM_B : Paiement différé après session (COMMENTÉ)
 * - SYSTEM_C : Paiement split 50/50 (COMMENTÉ)
 * 
 * @see PAYMENT_SYSTEM_AUDIT.md pour la documentation complète
 */

// ============================================
// CONFIGURATION ACTIVE
// ============================================

/**
 * Système de paiement actif
 * Valeurs possibles : 'A' | 'B' | 'C'
 */
export const ACTIVE_PAYMENT_SYSTEM = (process.env.ACTIVE_PAYMENT_SYSTEM || 'A') as 'A' | 'B' | 'C';

/**
 * Types de systèmes de paiement
 */
export type PaymentSystemType = 'A' | 'B' | 'C';

// ============================================
// SYSTÈME A - PAIEMENT INTÉGRAL IMMÉDIAT
// ============================================

/**
 * Système A : Paiement intégral immédiat
 * 
 * Sessions uniques :
 * - Joueur paie 100% immédiatement (prix coach + 6.5% Edgemy)
 * - Edgemy reçoit sa commission immédiatement
 * - Coach reçoit son paiement APRÈS la session
 * 
 * Packs d'heures :
 * - Joueur paie 100% immédiatement
 * - Edgemy reçoit sa commission immédiatement
 * - Coach reçoit 100% de son paiement APRÈS LA 1ÈRE SESSION
 * - Les heures sont déduites en temps réel (basé sur durée, pas sessions)
 */
export const SYSTEM_A_CONFIG = {
  name: 'Paiement Intégral Immédiat',
  code: 'A' as const,
  
  // Sessions uniques
  singleSession: {
    playerPaysImmediately: true,      // Joueur paie immédiatement
    edgemyReceivesImmediately: true,  // Edgemy reçoit sa part immédiatement
    coachReceivesAfterSession: true,  // Coach reçoit après la session
  },
  
  // Packs d'heures
  hourPack: {
    playerPaysImmediately: true,           // Joueur paie 100% immédiatement
    edgemyReceivesImmediately: true,       // Edgemy reçoit sa part immédiatement
    coachReceivesAfterFirstSession: true,  // Coach reçoit 100% après 1ère session
    deductionMode: 'HOURS' as const,       // Déduction basée sur heures réelles
  },
  
  // Commission Edgemy
  edgemyFeePercent: 6.5,
} as const;

// ============================================
// SYSTÈME B - PAIEMENT DIFFÉRÉ (COMMENTÉ)
// ============================================

/* ========== DÉBUT SYSTÈME B (COMMENTÉ) ==========

/**
 * Système B : Paiement différé après session
 * 
 * Sessions uniques :
 * - Joueur paie immédiatement
 * - Argent GELÉ chez Edgemy
 * - Coach reçoit APRÈS la session
 * 
 * Packs d'heures :
 * - Joueur paie immédiatement
 * - Argent GELÉ chez Edgemy
 * - Coach reçoit par session (paiement fractionné)
 * /
export const SYSTEM_B_CONFIG = {
  name: 'Paiement Différé',
  code: 'B' as const,
  
  // Sessions uniques
  singleSession: {
    playerPaysImmediately: true,
    fundsHeldByEdgemy: true,          // Argent gelé
    coachReceivesAfterSession: true,
  },
  
  // Packs d'heures
  hourPack: {
    playerPaysImmediately: true,
    fundsHeldByEdgemy: true,
    coachReceivesPerSession: true,    // Paiement fractionné par session
    deductionMode: 'SESSIONS' as const,
  },
  
  edgemyFeePercent: 6.5,
} as const;

========== FIN SYSTÈME B (COMMENTÉ) ========== */

// ============================================
// SYSTÈME C - PAIEMENT SPLIT 50/50 (COMMENTÉ)
// ============================================

/* ========== DÉBUT SYSTÈME C (COMMENTÉ) ==========

/**
 * Système C : Paiement split 50/50
 * 
 * Uniquement pour les packs d'heures :
 * - Joueur paie 50% à l'achat
 * - Joueur paie 50% automatiquement à la fin du pack
 * - Edgemy prend 6.5% sur CHAQUE paiement
 * - Coach reçoit 100% après le 2ème paiement
 * /
export const SYSTEM_C_CONFIG = {
  name: 'Paiement Split 50/50',
  code: 'C' as const,
  
  // Sessions uniques (même comportement que Système A)
  singleSession: {
    playerPaysImmediately: true,
    edgemyReceivesImmediately: true,
    coachReceivesAfterSession: true,
  },
  
  // Packs d'heures
  hourPack: {
    firstPaymentPercent: 50,          // 50% à l'achat
    secondPaymentPercent: 50,         // 50% à la fin
    edgemyFeeOnEachPayment: true,     // 6.5% sur chaque paiement
    coachReceivesAfterSecondPayment: true,
    deductionMode: 'HOURS' as const,
  },
  
  edgemyFeePercent: 6.5,
} as const;

// Types pour Système C
export interface SplitPaymentMetadata {
  packId: string;
  paymentNumber: 1 | 2;
  totalPayments: 2;
  firstPaymentId?: string;
  secondPaymentId?: string;
}

// Fonction pour créer la 2ème session de paiement (Système C)
export async function createSecondPaymentSession(
  packId: string,
  firstPaymentId: string,
  amountCents: number,
): Promise<{ sessionId: string; url: string }> {
  // TODO: Implémenter la création de la 2ème session Stripe
  // avec les métadonnées appropriées
  throw new Error('Système C non implémenté');
}

========== FIN SYSTÈME C (COMMENTÉ) ========== */

// ============================================
// HELPERS
// ============================================

/**
 * Retourne la configuration du système actif
 */
export function getActiveSystemConfig() {
  switch (ACTIVE_PAYMENT_SYSTEM) {
    case 'A':
      return SYSTEM_A_CONFIG;
    // case 'B':
    //   return SYSTEM_B_CONFIG;
    // case 'C':
    //   return SYSTEM_C_CONFIG;
    default:
      return SYSTEM_A_CONFIG;
  }
}

/**
 * Vérifie si le système actif est le Système A
 */
export function isSystemA(): boolean {
  return ACTIVE_PAYMENT_SYSTEM === 'A';
}

/**
 * Vérifie si le système actif est le Système B
 */
export function isSystemB(): boolean {
  return ACTIVE_PAYMENT_SYSTEM === 'B';
}

/**
 * Vérifie si le système actif est le Système C
 */
export function isSystemC(): boolean {
  return ACTIVE_PAYMENT_SYSTEM === 'C';
}

/**
 * Détermine si le coach doit recevoir le paiement intégral du pack
 * après la première session (Système A uniquement)
 */
export function shouldTransferFullPackAfterFirstSession(): boolean {
  return isSystemA();
}

/**
 * Détermine le mode de déduction des heures pour les packs
 * - 'HOURS' : Basé sur la durée réelle en heures
 * - 'SESSIONS' : Basé sur le nombre de sessions
 */
export function getPackDeductionMode(): 'HOURS' | 'SESSIONS' {
  const config = getActiveSystemConfig();
  return config.hourPack.deductionMode;
}

/**
 * Calcule les heures à déduire d'un pack après une session
 * 
 * @param sessionDurationMinutes - Durée de la session en minutes
 * @returns Heures à déduire
 */
export function calculateHoursToDeduct(sessionDurationMinutes: number): number {
  const mode = getPackDeductionMode();
  
  if (mode === 'HOURS') {
    // Déduction basée sur la durée réelle
    return sessionDurationMinutes / 60;
  } else {
    // Déduction basée sur les sessions (1 session = 1 unité)
    // Note: Dans ce mode, on ne déduit pas vraiment des heures
    // mais on compte les sessions
    return 1;
  }
}

// ============================================
// LOGS & DEBUG
// ============================================

/**
 * Log le système de paiement actif au démarrage
 */
export function logActivePaymentSystem(): void {
  const config = getActiveSystemConfig();
  console.log(`💳 Système de paiement actif: ${config.name} (${config.code})`);
  console.log(`   Commission Edgemy: ${config.edgemyFeePercent}%`);
  
  if (isSystemA()) {
    console.log(`   Sessions: Coach payé après session`);
    console.log(`   Packs: Coach payé intégralement après 1ère session`);
    console.log(`   Déduction: Basée sur heures réelles`);
  }
}
