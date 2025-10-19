'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useLocale } from 'next-intl';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { OnboardingStep1 } from '@/components/coach/onboarding/OnboardingStep1';
import { OnboardingStep2 } from '@/components/coach/onboarding/OnboardingStep2';
import { OnboardingStep3 } from '@/components/coach/onboarding/OnboardingStep3';
import { OnboardingStep4 } from '@/components/coach/onboarding/OnboardingStep4';
import { OnboardingStep5 } from '@/components/coach/onboarding/OnboardingStep5';
import type { OnboardingData } from '@/types/coach';

export default function CoachOnboardingPage() {
  const router = useRouter();
  const locale = useLocale();
  const { data: session, isPending } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({});

  // Charger le brouillon et le profil coach existant au montage
  useEffect(() => {
    const loadData = async () => {
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
            setFormData(prev => ({ ...prev, ...draft }));
            setCurrentStep(draft.currentStep || 1);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    if (session?.user) {
      loadData();
    }
  }, [session]);

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

  const handleComplete = async (finalData: Partial<OnboardingData>) => {
    setIsLoading(true);
    try {
      const completeData = { ...formData, ...finalData };
      
      const response = await fetch('/api/coach/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création du profil');
      }

      // Rediriger vers le dashboard
      router.push(`/${locale}/coach/dashboard`);
    } catch (error) {
      console.error('Erreur:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) {
    router.push('/');
    return null;
  }

  const progress = (currentStep / 5) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-3xl px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Devenir Coach Edgemy
          </h1>
          <p className="text-gray-600">
            Étape {currentStep} sur 5
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {currentStep === 1 && (
            <OnboardingStep1
              data={formData}
              onNext={handleNext}
            />
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
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <OnboardingStep4
              data={formData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 5 && (
            <OnboardingStep5
              data={formData}
              onComplete={handleComplete}
              onBack={handleBack}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Vos données sont sauvegardées automatiquement
        </div>
      </div>
    </div>
  );
}
