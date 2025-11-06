'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Progress } from '@/components/ui/progress';
import { OnboardingStep1 } from './OnboardingStep1';
import { OnboardingStep2 } from './OnboardingStep2';
import { OnboardingStep3 } from './OnboardingStep3';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { OnboardingData } from '@/types/coach';

interface CoachOnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CoachOnboardingModal({
  open,
  onOpenChange,
}: CoachOnboardingModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({});

  // Charger le brouillon et le profil coach existant au montage
  useEffect(() => {
    const loadData = async () => {
      if (!open || !session?.user) return;

      try {
        // Charger le profil coach existant
        const coachResponse = await fetch('/api/coach/profile');
        if (coachResponse.ok) {
          const { coach } = await coachResponse.json();
          if (coach) {
            // Pré-remplir avec les données existantes
            setFormData({
              firstName: coach.firstName,
              lastName: coach.lastName,
              bio: coach.bio || '',
              formats: coach.formats || [],
              stakes: coach.stakes || '',
              roi: coach.roi || undefined,
              experience: coach.experience || undefined,
              languages: coach.languages || ['fr'],
              twitchUrl: coach.twitchUrl || '',
              youtubeUrl: coach.youtubeUrl || '',
              twitterUrl: coach.twitterUrl || '',
              discordUrl: coach.discordUrl || '',
            });
          }
        }

        // Charger le brouillon (qui écrase les données du profil si présent)
        const draftResponse = await fetch('/api/coach/draft');
        if (draftResponse.ok) {
          const { draft } = await draftResponse.json();
          if (draft) {
            setFormData((prev) => ({ ...prev, ...draft }));
            setCurrentStep(draft.currentStep || 1);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    loadData();
  }, [session, open]);

  // Sauvegarder automatiquement le brouillon
  const saveDraft = async (data: Partial<OnboardingData>, step: number) => {
    try {
      await fetch('/api/coach/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, currentStep: step }),
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du brouillon:', error);
    }
  };

  const handleNext = async (stepData: Partial<OnboardingData>) => {
    const newData = { ...formData, ...stepData };
    setFormData(newData);

    // Sauvegarder le brouillon
    await saveDraft(newData, currentStep + 1);

    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleComplete = async (stepData: Partial<OnboardingData>) => {
    setIsLoading(true);
    try {
      const completeData = { ...formData, ...stepData };

      const response = await fetch('/api/coach/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création du profil');
      }

      // Fermer le modal
      onOpenChange(false);

      // Recharger la page pour mettre à jour l'état
      router.refresh();
    } catch (error) {
      console.error('Erreur:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    // Empêcher la fermeture pendant le chargement
    if (isLoading) return;
    onOpenChange(newOpen);
  };

  const progress = (currentStep / 3) * 100;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900/98 backdrop-blur-xl border-amber-500/20"
        showCloseButton={!isLoading}
      >
        <DialogHeader>
          <DialogTitle className="text-3xl bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Complétez votre profil coach
          </DialogTitle>
          <DialogDescription className="text-base">
            Étape {currentStep} sur 3 • Créez votre profil de coach professionnel
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Progression</span>
            <span className="text-sm font-semibold text-amber-400">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2.5" />
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {currentStep === 1 && (
            <OnboardingStep1 data={formData} onNext={handleNext} />
          )}
          {currentStep === 2 && (
            <OnboardingStep2
              data={formData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <OnboardingStep3
              data={formData}
              onNext={handleComplete}
              onBack={handleBack}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-emerald-300 font-medium">
              Sauvegarde automatique activée
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
