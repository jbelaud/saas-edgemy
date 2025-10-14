'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Target, Users, Brain, Shield, User, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const coachSchema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  email: z.string().email("Adresse email invalide"),
});

type CoachInput = z.infer<typeof coachSchema>;

const features = [
  {
    icon: Target,
    title: "Coaching personnalisé",
    description: "Sessions adaptées à votre niveau et vos objectifs spécifiques"
  },
  {
    icon: Users,
    title: "Communauté active",
    description: "Échangez avec d'autres joueurs passionnés dans un environnement bienveillant"
  },
  {
    icon: Brain,
    title: "Mental game",
    description: "Développez votre mindset pour performer sous pression"
  },
  {
    icon: Shield,
    title: "Plateforme sécurisée",
    description: "Paiements protégés et coachs vérifiés pour votre tranquillité d'esprit"
  }
];

export function SocialProof() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'already_subscribed'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CoachInput>({
    resolver: zodResolver(coachSchema)
  });

  const onSubmit = async (data: CoachInput) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/subscribe-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: data.firstName,
          email: data.email,
          role: 'COACH'
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        reset();
      } else if (response.status === 409) {
        setSubmitStatus('already_subscribed');
      } else {
        const errorData = await response.json();
        console.error('Submission error:', errorData);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Network error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Une nouvelle façon de connecter les passionnés de poker
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Edgemy crée le lien entre les joueurs en quête de progression et les coachs qui veulent partager leur expertise.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <feature.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Coach Application */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(-45deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            
            <div className="relative z-10 text-center mb-8">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Vous êtes coach <span className="text-blue-300">poker/mindset</span> ?
              </h3>
              <p className="text-xl opacity-90 leading-relaxed">
              Partagez votre expertise avec des joueurs passionnés et développez votre activité de coaching sur Edgemy.              </p>
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8">
              {submitStatus === 'success' ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h4 className="text-2xl font-bold mb-2">Bienvenue parmi les coachs Edgemy ! 👏</h4>
                  <p className="text-lg opacity-90">
                  Vous êtes désormais dans la liste prioritaire pour accéder à la plateforme dès son lancement et créer votre espace coach.                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Prénom */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Prénom
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          {...register('firstName')}
                          type="text"
                          className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                          placeholder="Votre prénom"
                        />
                      </div>
                      {errors.firstName && (
                        <p className="text-red-200 text-sm mt-1">{errors.firstName.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          {...register('email')}
                          type="email"
                          className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                          placeholder="votre@email.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-200 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Error Messages */}
                  {submitStatus === 'already_subscribed' && (
                    <div className="flex items-center justify-center p-4 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-amber-200 mr-2" />
                      <span className="text-amber-200">
                        Cet email fait déjà partie de notre liste d&apos;attente. Vous recevrez nos actualités !
                      </span>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="flex items-center justify-center p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-200 mr-2" />
                      <span className="text-red-200">
                        Erreur d&apos;envoi. Veuillez réessayer dans quelques instants.
                      </span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "w-full px-8 py-4 bg-white text-blue-700 font-bold text-lg rounded-lg transition-all duration-300 hover:bg-gray-100 transform hover:scale-105 cursor-pointer",
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
                        'Devenir coach'
                      )}
                    </div>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
