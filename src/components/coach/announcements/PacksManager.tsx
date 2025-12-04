'use client';

import { useState, useEffect } from 'react';
import { fetchWithCsrf } from '@/lib/security/csrf-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

interface PacksManagerProps {
  announcementId: string;
  hourlyRate: number; // Prix de base par heure en centimes
}

const packSchema = z.object({
  hours: z.string().min(1, 'Le nombre d&apos;heures est requis'),
  totalPrice: z.string().min(1, 'Le prix total est requis'),
  discountPercent: z.string().optional(),
});

type PackFormValues = z.infer<typeof packSchema>;

export function PacksManager({ announcementId, hourlyRate }: PacksManagerProps) {
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
      discountPercent: '',
    },
  });

  // Charger les packs
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
        discountPercent: pack.discountPercent?.toString() || '',
      });
    } else {
      setEditingPack(null);
      form.reset({
        hours: '',
        totalPrice: '',
        discountPercent: '',
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
      const totalPrice = parseFloat(data.totalPrice) * 100; // Convertir en centimes
      const discountPercent = data.discountPercent ? parseInt(data.discountPercent, 10) : null;

      if (editingPack) {
        // Modifier
        const response = await fetchWithCsrf(`/api/coach/announcement/${announcementId}/packs`, {
          method: 'PUT',
          body: JSON.stringify({
            packId: editingPack.id,
            hours,
            totalPrice,
            discountPercent,
          }),
        });

        if (!response.ok) throw new Error('Erreur lors de la modification');
      } else {
        // Créer
        const response = await fetchWithCsrf(`/api/coach/announcement/${announcementId}/packs`, {
          method: 'POST',
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
          const response = await fetchWithCsrf(
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
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <CardTitle>Packs d&apos;heures</CardTitle>
            </div>
            <Button onClick={() => handleOpenModal()} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un pack
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {packs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun pack configuré. Ajoutez des packs pour proposer des tarifs dégressifs.
            </p>
          ) : (
            <div className="space-y-3">
              {packs.map((pack) => {
                const discount = calculateDiscount(pack.hours, pack.totalPrice);
                return (
                  <div
                    key={pack.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">Pack {pack.hours}h</span>
                        {discount > 0 && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            -{discount}%
                          </Badge>
                        )}
                        {!pack.isActive && (
                          <Badge variant="secondary">Inactif</Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {(pack.totalPrice / 100).toFixed(0)}€
                      </p>
                      <p className="text-xs text-muted-foreground">
                        au lieu de {((hourlyRate / 100) * pack.hours).toFixed(0)}€
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(pack)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(pack.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Ajouter/Modifier */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent>
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
                    <FormDescription>
                      Nombre total d&apos;heures de coaching dans ce pack
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
                      <Input type="number" min="0" step="0.01" placeholder="450" {...field} />
                    </FormControl>
                    <FormDescription>
                      Prix total du pack (tarif réduit)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Réduction (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" placeholder="10" {...field} />
                    </FormControl>
                    <FormDescription>
                      Pourcentage de réduction (optionnel, calculé automatiquement)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700 hover:border-slate-500"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
    </>
  );
}
