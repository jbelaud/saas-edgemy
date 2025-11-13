'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Package, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { AlertDialogCustom } from '@/components/ui/alert-dialog-custom';

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
  hours: z.string().min(1, 'Le nombre d&apos;heures est requis'),
  totalPrice: z.string().min(1, 'Le prix total est requis'),
});

type PackFormValues = z.infer<typeof packSchema>;

export function AnnouncementPacksSection({ announcementId, hourlyRate }: AnnouncementPacksSectionProps) {
  const [packs, setPacks] = useState<AnnouncementPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<AnnouncementPack | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { alertState, confirmState, showError, showConfirm, closeAlert, closeConfirm } = useAlertDialog();

  const form = useForm<PackFormValues>({
    resolver: zodResolver(packSchema),
    defaultValues: {
      hours: '',
      totalPrice: '',
    },
  });

  useEffect(() => {
    fetchPacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      showError('Erreur', 'Une erreur est survenue lors de l\'enregistrement du pack');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (packId: string) => {
    showConfirm(
      'Supprimer ce pack',
      'Êtes-vous sûr de vouloir supprimer ce pack ? Cette action est irréversible.',
      async () => {
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
        } catch (error: unknown) {
          console.error('Erreur:', error);
          showError(
            'Erreur de suppression',
            error instanceof Error ? error.message : 'Une erreur est survenue'
          );
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-semibold text-white">Packs d&apos;heures</span>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Ajouter
        </button>
      </div>

      {packs.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-3 bg-slate-800/30 rounded-lg border border-white/5">
          Aucun pack. Ajoutez des packs pour proposer des tarifs dégressifs.
        </p>
      ) : (
        <div className="space-y-2">
          {packs.map((pack) => {
            const discount = calculateDiscount(pack.hours, pack.totalPrice);
            return (
              <div
                key={pack.id}
                className="flex items-center justify-between p-3 bg-slate-800/30 border border-white/5 rounded-lg hover:border-purple-500/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white">Pack {pack.hours}h</span>
                  <span className="text-purple-400 font-bold text-lg">{(pack.totalPrice / 100).toFixed(0)}€</span>
                  {discount > 0 && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                      -{discount}%
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenModal(pack)}
                    className="h-7 w-7 flex items-center justify-center hover:bg-slate-700/50 rounded transition-all"
                  >
                    <Edit className="h-3.5 w-3.5 text-gray-400 hover:text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(pack.id)}
                    className="h-7 w-7 flex items-center justify-center hover:bg-red-500/10 rounded transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-400" />
                  </button>
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
                    <FormLabel>Nombre d&apos;heures *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="5" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Nombre total d&apos;heures de coaching
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCloseModal}
                  className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700 hover:border-slate-500"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                >
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

      {/* Modals de notification */}
      <AlertDialogCustom
        open={alertState.open}
        onOpenChange={closeAlert}
        title={alertState.title}
        description={alertState.description}
        type={alertState.type}
      />

      <AlertDialogCustom
        open={confirmState.open}
        onOpenChange={closeConfirm}
        title={confirmState.title}
        description={confirmState.description}
        type="warning"
        confirmText="Confirmer"
        cancelText="Annuler"
        onConfirm={confirmState.onConfirm}
        showCancel={true}
      />
    </div>
  );
}
