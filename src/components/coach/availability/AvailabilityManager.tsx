'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Plus, Trash2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface Availability {
  id: string;
  type: 'RECURRING' | 'SPECIFIC' | 'EXCEPTION';
  dayOfWeek: number | null;
  startTime: string | null;
  endTime: string | null;
  specificDate: string | null;
  isBlocked: boolean;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 0, label: 'Dimanche' },
];

const availabilitySchema = z.object({
  type: z.enum(['RECURRING', 'SPECIFIC']),
  dayOfWeek: z.string().optional(),
  startTime: z.string().min(1, 'Heure de début requise'),
  endTime: z.string().min(1, 'Heure de fin requise'),
  specificDate: z.string().optional(),
});

type AvailabilityFormValues = z.infer<typeof availabilitySchema>;

export function AvailabilityManager() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      type: 'RECURRING',
      startTime: '09:00',
      endTime: '18:00',
    },
  });

  const watchType = form.watch('type');

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const fetchAvailabilities = async () => {
    try {
      const response = await fetch('/api/coach/availability');
      if (response.ok) {
        const data = await response.json();
        setAvailabilities(data.availabilities || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AvailabilityFormValues) => {
    setIsSaving(true);
    try {
      const payload = {
        type: data.type,
        startTime: data.startTime,
        endTime: data.endTime,
        ...(data.type === 'RECURRING' && { dayOfWeek: parseInt(data.dayOfWeek || '1', 10) }),
        ...(data.type === 'SPECIFIC' && { specificDate: data.specificDate }),
      };

      const response = await fetch('/api/coach/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création');
      }

      await fetchAvailabilities();
      setIsModalOpen(false);
      form.reset();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) return;

    try {
      const response = await fetch(`/api/coach/availability?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      await fetchAvailabilities();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    }
  };

  const groupedAvailabilities = availabilities.reduce((acc, avail) => {
    if (avail.type === 'RECURRING' && avail.dayOfWeek !== null) {
      if (!acc[avail.dayOfWeek]) {
        acc[avail.dayOfWeek] = [];
      }
      acc[avail.dayOfWeek].push(avail);
    }
    return acc;
  }, {} as Record<number, Availability[]>);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Créneaux récurrents</h2>
          <p className="text-sm text-gray-600">
            Définissez vos disponibilités hebdomadaires
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un créneau
        </Button>
      </div>

      {/* Affichage par jour de la semaine */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const dayAvailabilities = groupedAvailabilities[day.value] || [];
          
          return (
            <Card key={day.value}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{day.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {dayAvailabilities.length} créneau{dayAvailabilities.length > 1 ? 'x' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayAvailabilities.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Aucun créneau
                  </p>
                ) : (
                  dayAvailabilities.map((avail) => (
                    <div
                      key={avail.id}
                      className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {avail.startTime} - {avail.endTime}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleDelete(avail.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal d'ajout */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un créneau de disponibilité</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de créneau</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="RECURRING">Récurrent (chaque semaine)</SelectItem>
                        <SelectItem value="SPECIFIC">Spécifique (une date précise)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchType === 'RECURRING' && (
                <FormField
                  control={form.control}
                  name="dayOfWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jour de la semaine *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un jour" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DAYS_OF_WEEK.map((day) => (
                            <SelectItem key={day.value} value={day.value.toString()}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchType === 'SPECIFIC' && (
                <FormField
                  control={form.control}
                  name="specificDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date spécifique *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure de début *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure de fin *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Ajouter'
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
