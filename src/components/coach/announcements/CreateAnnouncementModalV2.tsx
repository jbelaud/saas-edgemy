'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Target, Search, Wrench, ArrowRight } from 'lucide-react';

// Import des formulaires spécifiques
import { StrategyForm } from './forms/StrategyForm';
import { ReviewForm } from './forms/ReviewForm';
import { ToolForm } from './forms/ToolForm';

interface CreateAnnouncementModalV2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type AnnouncementType = 'STRATEGY' | 'REVIEW' | 'TOOL' | null;

const ANNOUNCEMENT_TYPES = [
  {
    type: 'STRATEGY' as const,
    title: 'Stratégie',
    description: 'Session centrée sur une approche stratégique spécifique',
    icon: Target,
    color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
  },
  {
    type: 'REVIEW' as const,
    title: 'Review',
    description: 'Review personnalisée de sessions, mains ou database',
    icon: Search,
    color: 'bg-green-50 hover:bg-green-100 border-green-200',
  },
  {
    type: 'TOOL' as const,
    title: 'Outil / Prise en main',
    description: 'Enseignement de l\'utilisation d\'un logiciel',
    icon: Wrench,
    color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle>
              {selectedType ? 'Créer une annonce' : 'Choisissez le type d\'annonce'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {selectedType
              ? 'Remplissez les informations de votre annonce'
              : 'Sélectionnez le type d\'annonce que vous souhaitez créer'}
          </DialogDescription>
        </DialogHeader>

        {!selectedType ? (
          // Étape 1 : Sélection du type
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            {ANNOUNCEMENT_TYPES.map((announcementType) => {
              const Icon = announcementType.icon;
              return (
                <Card
                  key={announcementType.type}
                  className={`cursor-pointer transition-all ${announcementType.color} border-2`}
                  onClick={() => setSelectedType(announcementType.type)}
                >
                  <CardContent className="pt-6 text-center space-y-3">
                    <div className="flex justify-center">
                      <div className="p-3 bg-white rounded-full">
                        <Icon className="h-8 w-8" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg">{announcementType.title}</h3>
                    <p className="text-sm text-gray-600">{announcementType.description}</p>
                    <Button variant="ghost" size="sm" className="mt-2">
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
              className="mb-4"
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
