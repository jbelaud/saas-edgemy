'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Pencil, Loader2 } from 'lucide-react';

interface Announcement {
  id: string;
  type: string;
  title: string;
  description: string;
  priceCents: number;
  durationMin: number;
  isActive: boolean;
  slug: string;
  createdAt: string;
  // STRATEGY
  variant?: string;
  format?: string;
  abiRange?: string;
  tags?: string[];
  // REVIEW
  reviewType?: string;
  reviewSupport?: string;
  // TOOL
  toolName?: string;
  toolObjective?: string;
  prerequisites?: string;
  // MENTAL
  mentalFocus?: string;
}

interface EditAnnouncementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
  onSuccess?: () => void;
}

export function EditAnnouncementModal({
  open,
  onOpenChange,
  announcement,
  onSuccess,
}: EditAnnouncementModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceCents: 0,
    durationMin: 60,
  });

  // Initialiser le formulaire quand l'annonce change
  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        description: announcement.description,
        priceCents: announcement.priceCents / 100, // Convertir en euros
        durationMin: announcement.durationMin,
      });
    }
  }, [announcement]);

  const handleClose = () => {
    setIsLoading(false);
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/coach/announcement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: announcement.id,
          title: formData.title,
          description: formData.description,
          priceCents: formData.priceCents * 100, // Convertir en centimes
          durationMin: formData.durationMin,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour de l\'annonce');
    } finally {
      setIsLoading(false);
    }
  };

  if (!announcement) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-orange-500" />
            <DialogTitle className="text-white">
              Modifier l&apos;annonce
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-400">
            Modifiez les informations de votre annonce
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Titre */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Titre de l'annonce"
              required
              className="bg-slate-800/50 border-slate-600 focus:border-orange-500 text-white"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description de l'annonce"
              rows={5}
              required
              className="bg-slate-800/50 border-slate-600 focus:border-orange-500 text-white"
            />
          </div>

          {/* Prix et Durée */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-white">Prix (€) *</Label>
              <Input
                id="price"
                type="number"
                step="1"
                min="0"
                max="9999"
                value={formData.priceCents}
                onChange={(e) => setFormData({ ...formData, priceCents: parseInt(e.target.value) || 0 })}
                placeholder="80"
                required
                className="bg-slate-800/50 border-slate-600 focus:border-orange-500 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-white">Durée (min) *</Label>
              <Input
                id="duration"
                type="number"
                step="15"
                min="15"
                max="180"
                value={formData.durationMin}
                onChange={(e) => setFormData({ ...formData, durationMin: parseInt(e.target.value) || 60 })}
                placeholder="60"
                required
                className="bg-slate-800/50 border-slate-600 focus:border-orange-500 text-white"
              />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border-slate-600 text-white hover:bg-slate-800"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
