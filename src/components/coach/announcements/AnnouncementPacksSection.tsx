'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Package, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface AnnouncementPack {
  id: string;
  hours: number;
  totalPrice: number;
  discountPercent: number | null;
  isActive: boolean;
}

interface AnnouncementPacksSectionProps {
  announcementId: string;
  hourlyRate: number; // Prix de base par heure en centimes
}

const packSchema = z.object({
  hours: z.string().min(1, 'Le nombre d\'heures est requis'),
  totalPrice: z.string().min(1, 'Le prix total est requis'),
});

type PackFormValues = z.infer<typeof packSchema>;

export function AnnouncementPacksSection({ announcementId, hourlyRate }: AnnouncementPacksSectionProps) {
  const [packs, setPacks] = useState<AnnouncementPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<AnnouncementPack | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<PackFormValues>({
    resolver: zodResolver(packSchema),
    defaultValues: {
      hours: '',
      totalPrice: '',
    },
  });

  useEffect(() => {
    fetchPacks();
  }, [announcementId]);

  const fetchPacks = async () => {
    try {
      const response = await fetch(`/api/coach/announcement/${announcementId}/packs`);
      if (response.ok) {
        const data = await response.json();
        setPacks(data.packs || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des packs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDiscount = (hours: number, totalPrice: number): number => {
    const regularPrice = (hourlyRate / 100) * hours;
    const discount = ((regularPrice - totalPrice / 100) / regularPrice) * 100;
    return Math.round(discount);
  };

  const handleOpenModal = (pack?: AnnouncementPack) => {
    if (pack) {
      setEditingPack(pack);
      form.reset({
        hours: pack.hours.toString(),
        totalPrice: (pack.totalPrice / 100).toString(),
      });
    } else {
      setEditingPack(null);
      form.reset({
        hours: '',
        totalPrice: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPack(null);
    form.reset();
  };

  const onSubmit = async (data: PackFormValues) => {
    setIsSaving(true);
    try {
      const hours = parseInt(data.hours, 10);
      const totalPrice = parseFloat(data.totalPrice) * 100;
      const discountPercent = calculateDiscount(hours, totalPrice);

      if (editingPack) {
        const response = await fetch(`/api/coach/announcement/${announcementId}/packs`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packId: editingPack.id,
            hours,
            totalPrice,
            discountPercent,
          }),
        });

        if (!response.ok) throw new Error('Erreur lors de la modification');
      } else {
        const response = await fetch(`/api/coach/announcement/${announcementId}/packs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hours,
            totalPrice,
            discountPercent,
          }),
        });

        if (!response.ok) throw new Error('Erreur lors de la création');
      }

      await fetchPacks();
      handleCloseModal();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (packId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce pack ?')) return;

    try {
      const response = await fetch(
        `/api/coach/announcement/${announcementId}/packs?packId=${packId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      await fetchPacks();
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(error.message || 'Une erreur est survenue');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Packs d'heures</span>
        </div>
        <Button onClick={() => handleOpenModal()} size="sm" variant="outline">
          <Plus className="h-3 w-3 mr-1" />
          Ajouter
        </Button>
      </div>

      {packs.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">
          Aucun pack. Ajoutez des packs pour proposer des tarifs dégressifs.
        </p>
      ) : (
        <div className="space-y-2">
          {packs.map((pack) => {
            const discount = calculateDiscount(pack.hours, pack.totalPrice);
            return (
              <div
                key={pack.id}
                className="flex items-center justify-between p-2 border rounded text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">Pack {pack.hours}h</span>
                  <span className="text-primary font-bold">{(pack.totalPrice / 100).toFixed(0)}€</span>
                  {discount > 0 && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      -{discount}%
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleOpenModal(pack)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleDelete(pack.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Ajouter/Modifier */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {editingPack ? 'Modifier le pack' : 'Ajouter un pack'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre d'heures *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="5" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Nombre total d'heures de coaching
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix total (€) *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" placeholder="450" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Prix du pack (ex: {((hourlyRate / 100) * 5).toFixed(0)}€ pour 5h au tarif normal)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={handleCloseModal}>
                  Annuler
                </Button>
                <Button type="submit" size="sm" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    editingPack ? 'Modifier' : 'Créer'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
