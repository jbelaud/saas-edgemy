'use client';

import { useState } from 'react';
import { fetchWithCsrf } from '@/lib/security/csrf-client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Calendar as CalendarIcon, Clock, Bell } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { AlertDialogCustom } from '@/components/ui/alert-dialog-custom';

interface SchedulePackSessionModalProps {
  packId: string;
  playerId: string;
  playerName: string;
  announcementTitle: string;
  currentSessionNumber: number;
  totalSessions: number;
  durationMin: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const scheduleSchema = z.object({
  date: z.date(),
  time: z.string().min(1, 'L\'heure est requise'),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

// Générer les créneaux horaires de 8h à 23h
const TIME_SLOTS = Array.from({ length: 16 }, (_, i) => {
  const hour = i + 8;
  return {
    value: `${hour.toString().padStart(2, '0')}:00`,
    label: `${hour}:00`,
  };
});

export function SchedulePackSessionModal({
  packId,
  playerId,
  playerName,
  announcementTitle,
  currentSessionNumber,
  totalSessions,
  durationMin,
  open,
  onOpenChange,
  onSuccess,
}: SchedulePackSessionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { alertState, confirmState, showError, closeAlert, closeConfirm } = useAlertDialog();

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      time: '20:00',
    },
  });

  const onSubmit = async (data: ScheduleFormValues) => {
    setIsLoading(true);
    try {
      // Construire les dates de début et fin
      const [hours, minutes] = data.time.split(':').map(Number);
      const startDate = new Date(data.date);
      startDate.setHours(hours, minutes, 0, 0);

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + durationMin);

      const response = await fetchWithCsrf(`/api/coach/packs/${packId}/schedule`, {
        method: 'POST',
        body: JSON.stringify({
          playerId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la planification');
      }

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Erreur:', error);
      showError(
        'Erreur de planification',
        error instanceof Error ? error.message : 'Une erreur est survenue lors de la planification'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Planifier une session</DialogTitle>
          <DialogDescription>
            Session {currentSessionNumber}/{totalSessions} avec {playerName}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-900">{announcementTitle}</p>
          <p className="text-xs text-blue-700 mt-1">Durée: {durationMin} minutes</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP', { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une heure" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {slot.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Info notification */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-2">
                <Bell className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-amber-900">
                    Notification automatique
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Une notification sera envoyée à {playerName} après la planification.
                    <span className="block mt-1 italic">
                      (⚠️ Fonctionnalité à implémenter)
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Planification...
                  </>
                ) : (
                  'Planifier la session'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

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
    </Dialog>
  );
}
