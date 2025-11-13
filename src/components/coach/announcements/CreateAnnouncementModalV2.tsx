'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Target, Search, Wrench, Brain, ArrowRight } from 'lucide-react';

// Import des formulaires spécifiques
import { StrategyForm } from './forms/StrategyForm';
import { ReviewForm } from './forms/ReviewForm';
import { ToolForm } from './forms/ToolForm';
import { MentalForm } from './forms/MentalForm';

interface CreateAnnouncementModalV2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type AnnouncementType = 'STRATEGY' | 'REVIEW' | 'TOOL' | 'MENTAL' | null;

const ANNOUNCEMENT_TYPES = [
  {
    type: 'STRATEGY' as const,
    title: 'Stratégie',
    description: 'Session centrée sur une approche stratégique spécifique',
    icon: Target,
    gradient: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-500/50',
    hoverBorder: 'hover:border-blue-400',
    bgGlow: 'hover:shadow-blue-500/20',
  },
  {
    type: 'REVIEW' as const,
    title: 'Review',
    description: 'Review personnalisée de sessions, mains ou database',
    icon: Search,
    gradient: 'from-green-500 to-green-600',
    borderColor: 'border-green-500/50',
    hoverBorder: 'hover:border-green-400',
    bgGlow: 'hover:shadow-green-500/20',
  },
  {
    type: 'TOOL' as const,
    title: 'Outil / Prise en main',
    description: 'Enseignement de l\'utilisation d\'un logiciel',
    icon: Wrench,
    gradient: 'from-purple-500 to-purple-600',
    borderColor: 'border-purple-500/50',
    hoverBorder: 'hover:border-purple-400',
    bgGlow: 'hover:shadow-purple-500/20',
  },
  {
    type: 'MENTAL' as const,
    title: 'Mental',
    description: 'Coaching mental et préparation psychologique',
    icon: Brain,
    gradient: 'from-pink-500 to-pink-600',
    borderColor: 'border-pink-500/50',
    hoverBorder: 'hover:border-pink-400',
    bgGlow: 'hover:shadow-pink-500/20',
  },
];

export function CreateAnnouncementModalV2({
  open,
  onOpenChange,
  onSuccess,
}: CreateAnnouncementModalV2Props) {
  const [selectedType, setSelectedType] = useState<AnnouncementType>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = () => {
    setSelectedType(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleSuccess = () => {
    handleReset();
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <DialogTitle className="text-white">
              {selectedType ? 'Créer une annonce' : 'Choisissez le type d\'annonce'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-400">
            {selectedType
              ? 'Remplissez les informations de votre annonce'
              : 'Sélectionnez le type d\'annonce que vous souhaitez créer'}
          </DialogDescription>
        </DialogHeader>

        {!selectedType ? (
          // Étape 1 : Sélection du type
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {ANNOUNCEMENT_TYPES.map((announcementType) => {
              const Icon = announcementType.icon;
              return (
                <Card
                  key={announcementType.type}
                  className={`cursor-pointer transition-all duration-200 bg-slate-800/50 border-2 ${announcementType.borderColor} ${announcementType.hoverBorder} hover:shadow-lg ${announcementType.bgGlow} hover:scale-[1.02]`}
                  onClick={() => setSelectedType(announcementType.type)}
                >
                  <CardContent className="pt-6 text-center space-y-3">
                    <div className="flex justify-center">
                      <div className={`p-4 bg-gradient-to-r ${announcementType.gradient} rounded-full shadow-lg`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg text-white">{announcementType.title}</h3>
                    <p className="text-sm text-gray-400">{announcementType.description}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`mt-2 bg-gradient-to-r ${announcementType.gradient} text-white hover:opacity-90 transition-opacity`}
                    >
                      Choisir <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          // Étape 2 : Formulaire spécifique
          <div className="py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="mb-4 text-gray-400 hover:text-white hover:bg-slate-800"
            >
              ← Changer de type
            </Button>

            {selectedType === 'STRATEGY' && (
              <StrategyForm
                onSuccess={handleSuccess}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}
            {selectedType === 'REVIEW' && (
              <ReviewForm
                onSuccess={handleSuccess}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}
            {selectedType === 'TOOL' && (
              <ToolForm
                onSuccess={handleSuccess}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}
            {selectedType === 'MENTAL' && (
              <MentalForm
                onSuccess={handleSuccess}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
