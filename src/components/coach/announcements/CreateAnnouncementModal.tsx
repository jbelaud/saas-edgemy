"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Sparkles, Euro, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const announcementSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères"),
  format: z.string().min(1, "Veuillez sélectionner un format"),
  price: z.string()
    .min(1, "Le prix est requis")
    .refine((val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 0 && num <= 9999 && Number.isInteger(parseFloat(val));
    }, "Le prix doit être un nombre entier entre 0€ et 9999€"),
  duration: z.string().min(1, "La durée est requise"),
  isActive: z.boolean().default(true),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

interface CreateAnnouncementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const FORMATS = [
  { value: "MTT", label: "Tournoi Multi-Tables (MTT)" },
  { value: "CASH_GAME", label: "Cash Game" },
  { value: "SNG", label: "Sit & Go" },
  { value: "SPIN", label: "Spin & Go" },
  { value: "AUTRE", label: "Autre" },
];

const DURATIONS = [
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 heure" },
  { value: "90", label: "1h30" },
  { value: "120", label: "2 heures" },
  { value: "180", label: "3 heures" },
];

export function CreateAnnouncementModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateAnnouncementModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      description: "",
      format: "",
      price: "",
      duration: "60",
      isActive: true,
    },
  });

  const onSubmit = async (data: AnnouncementFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        title: data.title,
        description: data.description,
        format: data.format,
        priceCents: parseInt(data.price, 10) * 100, // Convertir euros en centimes
        durationMin: parseInt(data.duration, 10),
        isActive: data.isActive,
      };

      console.log("📤 Envoi de l'annonce:", payload);

      const response = await fetch("/api/coach/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Erreur API:", errorData);
        throw new Error(errorData.error || "Erreur lors de la création de l'annonce");
      }

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Erreur:", error);
      alert(error instanceof Error ? error.message : "Une erreur est survenue lors de la création de l'annonce");
    } finally {
      setIsLoading(false);
    }
  };

  // Aperçu en temps réel
  const watchedValues = form.watch();
  const previewPrice = watchedValues.price ? `${watchedValues.price}€` : "0€";
  const previewDuration = DURATIONS.find(d => d.value === watchedValues.duration)?.label || "1 heure";
  const previewFormat = FORMATS.find(f => f.value === watchedValues.format)?.label || "Format";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Créer une nouvelle annonce
          </DialogTitle>
          <DialogDescription>
            Créez une annonce de coaching pour attirer de nouveaux joueurs
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Formulaire */}
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre de l'annonce *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Coaching MTT pour débutants"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Un titre accrocheur et descriptif
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Format *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FORMATS.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix (€) *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              max="9999"
                              placeholder="50"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DURATIONS.map((duration) => (
                              <SelectItem key={duration.value} value={duration.value}>
                                {duration.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez votre offre de coaching en détail..."
                          className="min-h-[120px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Expliquez ce que vous proposez, votre méthode, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Activer l'annonce
                        </FormLabel>
                        <FormDescription>
                          L'annonce sera visible publiquement
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Créer l'annonce
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Aperçu */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <Card className="border-2 border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">Aperçu de l'annonce</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {watchedValues.title || "Titre de votre annonce"}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
                      {previewFormat}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Euro className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">{previewPrice}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{previewDuration}</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {watchedValues.description || "Votre description apparaîtra ici..."}
                  </p>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        watchedValues.isActive ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <span className="text-gray-600">
                      {watchedValues.isActive ? "Annonce active" : "Annonce inactive"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
