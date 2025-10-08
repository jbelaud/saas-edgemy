'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Mail, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useStats } from '@/hooks/useStats';

const subscriberSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  role: z.enum(["PLAYER", "COACH"], {
    message: "Veuillez sélectionner votre rôle",
  }),
});

type SubscriberInput = z.infer<typeof subscriberSchema>;

export function LandingNewsletter() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'already_subscribed'>('idle');
  const { stats, loading } = useStats();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<SubscriberInput>({
    resolver: zodResolver(subscriberSchema)
  });

  const watchedRole = watch('role');

  const onSubmit = async (data: SubscriberInput) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/subscribe-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus('success');
        reset();
        // Mettre à jour le compteur localement
        stats.subscriberCount += 1;
      } else if (response.status === 409) {
        setSubmitStatus('already_subscribed');
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="newsletter-section" className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(-45deg,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
              <User className="w-4 h-4 mr-2" />
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Chargement...
                </span>
              ) : (
                `Rejoignez +${stats.subscriberCount.toLocaleString()} membres`
              )}
            </div>
            
            <h2 className="text-4xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Rejoignez Edgemy, la révolution du coaching poker francophone
            </h2>
            
            <p className="text-xl text-gray-600 leading-relaxed">
            Inscrivez-vous dès maintenant pour faire partie <span className="text-blue-600 font-semibold"> des premiers</span> à découvrir Edgemy — la plateforme qui <span className="text-blue-600 font-semibold"> connecte joueurs et coachs</span> passionnés. 
            </p>
          </div>

          {/* Modern Form Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 md:p-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Email Input with Icon */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="votre@email.com"
                    className={cn(
                      "w-full pl-12 pr-4 py-4 text-lg bg-gray-50/50 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:bg-white",
                      errors.email 
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" 
                        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    )}
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <p className="text-sm">{errors.email.message}</p>
                  </div>
                )}
              </div>

              {/* Role Selection - Modern Cards */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Je suis...
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Player Card */}
                  <label className={cn(
                    "relative flex items-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md",
                    watchedRole === 'PLAYER' 
                      ? "border-blue-500 bg-blue-50 shadow-lg ring-4 ring-blue-100" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}>
                    <input
                      {...register('role')}
                      type="radio"
                      value="PLAYER"
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors",
                        watchedRole === 'PLAYER' ? "border-blue-500 bg-blue-500" : "border-gray-300"
                      )}>
                        {watchedRole === 'PLAYER' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">🎯 Joueur</div>
                        <div className="text-sm text-gray-600">Je veux progresser</div>
                      </div>
                    </div>
                  </label>

                  {/* Coach Card */}
                  <label className={cn(
                    "relative flex items-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md",
                    watchedRole === 'COACH' 
                      ? "border-purple-500 bg-purple-50 shadow-lg ring-4 ring-purple-100" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}>
                    <input
                      {...register('role')}
                      type="radio"
                      value="COACH"
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors",
                        watchedRole === 'COACH' ? "border-purple-500 bg-purple-500" : "border-gray-300"
                      )}>
                        {watchedRole === 'COACH' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">👨‍🏫 Coach</div>
                        <div className="text-sm text-gray-600">Je veux enseigner</div>
                      </div>
                    </div>
                  </label>
                </div>
                {errors.role && (
                  <div className="flex items-center mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <p className="text-sm">{errors.role.message}</p>
                  </div>
                )}
              </div>
              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-xl transition-all duration-300 hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  )}
              >
                <div className="flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Inscription en cours...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Rejoindre la communauté
                    </>
                  )}
                </div>
                </button>
              </div>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-green-800 font-semibold">Vous êtes sur la liste ! 🎉</p>
                    <p className="text-green-700 text-sm">Vous recevrez nos conseils exclusifs et serez informé en priorité du lancement.</p>
                  </div>
                </div>
              )}

              {submitStatus === 'already_subscribed' && (
                <div className="flex items-center p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-600 mr-3" />
                  <div>
                    <p className="text-amber-800 font-semibold">Email déjà inscrit</p>
                    <p className="text-amber-700 text-sm">Cet email fait déjà partie de notre liste d&apos;attente. Vous recevrez nos actualités !</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <p className="text-red-800 font-semibold">Erreur d&apos;inscription</p>
                    <p className="text-red-700 text-sm">Veuillez réessayer dans quelques instants.</p>
                  </div>
                </div>
              )}
            </form>

            {/* Trust Indicators */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  Gratuit
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  Sans spam
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  Désinscription facile
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
