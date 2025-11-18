'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui';
import { CreditCard, Plus, X, Loader2, AlertCircle } from 'lucide-react';

const COMMON_PAYMENT_METHODS = [
  'USDT (TRC20)',
  'USDC',
  'Wise',
  'Revolut',
  'PayPal',
  'Virement SEPA',
  'Crypto (Bitcoin)',
  'Crypto (Ethereum)',
];

export function PaymentPreferencesForm() {
  const [paymentPreferences, setPaymentPreferences] = useState<string[]>([]);
  const [planKey, setPlanKey] = useState<string>('PRO');
  const [customMethod, setCustomMethod] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/coach/payment-preferences');
      if (response.ok) {
        const data = await response.json();
        setPaymentPreferences(data.paymentPreferences || []);
        setPlanKey(data.planKey || 'PRO');
      }
    } catch (error) {
      console.error('Erreur chargement préférences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSuccessMessage('');

      const response = await fetch('/api/coach/payment-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentPreferences,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la sauvegarde');
      }

      setSuccessMessage('Préférences sauvegardées avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur sauvegarde préférences:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };

  const addCommonMethod = (method: string) => {
    if (!paymentPreferences.includes(method)) {
      setPaymentPreferences([...paymentPreferences, method]);
    }
  };

  const addCustomMethod = () => {
    if (customMethod.trim() && !paymentPreferences.includes(customMethod.trim())) {
      setPaymentPreferences([...paymentPreferences, customMethod.trim()]);
      setCustomMethod('');
    }
  };

  const removeMethod = (method: string) => {
    setPaymentPreferences(paymentPreferences.filter(m => m !== method));
  };

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      </GlassCard>
    );
  }

  // Afficher seulement pour les coachs avec plan LITE
  if (planKey !== 'LITE') {
    return (
      <GlassCard className="p-6">
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900">Plan PRO</p>
            <p className="text-sm text-blue-800">
              Les préférences de paiement sont uniquement disponibles pour les coachs avec le plan LITE.
              Avec le plan PRO, les paiements se font automatiquement via Stripe.
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-orange-600" />
          Préférences de paiement - Plan Lite
        </h3>
        <p className="text-sm text-gray-600">
          Indiquez vos moyens de paiement préférés. Ces informations seront affichées à vos joueurs
          dans le salon Discord. <strong>Ne partagez jamais vos coordonnées bancaires ici</strong>, seulement vos préférences.
        </p>
      </div>

      {/* Méthodes courantes */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Méthodes courantes
        </label>
        <div className="flex flex-wrap gap-2">
          {COMMON_PAYMENT_METHODS.map((method) => (
            <button
              key={method}
              onClick={() => addCommonMethod(method)}
              disabled={paymentPreferences.includes(method)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                paymentPreferences.includes(method)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
              }`}
            >
              <Plus className="h-3 w-3 inline mr-1" />
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Méthode personnalisée */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ajouter une méthode personnalisée
        </label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ex: Binance Pay, Skrill, etc."
            value={customMethod}
            onChange={(e) => setCustomMethod(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomMethod()}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={addCustomMethod}
            disabled={!customMethod.trim()}
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Liste des préférences sélectionnées */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Vos préférences ({paymentPreferences.length})
        </label>
        {paymentPreferences.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Aucune préférence sélectionnée
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {paymentPreferences.map((method) => (
              <Badge
                key={method}
                variant="outline"
                className="bg-green-50 border-green-200 text-green-700 px-3 py-1.5"
              >
                {method}
                <button
                  onClick={() => removeMethod(method)}
                  className="ml-2 hover:text-green-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Message de succès */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Bouton sauvegarder */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sauvegarde...
          </>
        ) : (
          'Sauvegarder les préférences'
        )}
      </Button>

      {/* Note */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-900">
          <strong>Important :</strong> Ces préférences seront visibles par vos joueurs dans le salon Discord.
          Vous communiquerez vos coordonnées bancaires complètes (IBAN, adresse crypto, etc.) directement
          dans la conversation privée avec chaque joueur.
        </p>
      </div>
    </GlassCard>
  );
}
