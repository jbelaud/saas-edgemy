'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, Trophy, TrendingUp } from 'lucide-react';

export default function AppPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Badge variant="secondary" className="mb-4">
              🚧 {t('common.development')}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              {t('home.title')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              {t('home.subtitle')}
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.description')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button size="lg" className="px-8 py-6 text-lg" asChild>
              <a href="/app/dashboard">
                {t('nav.dashboard')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg" asChild>
              <a href="/app/profile">
                {t('nav.profile')}
              </a>
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Coaching Personnalisé</CardTitle>
                <CardDescription>
                  Connectez-vous avec des coachs experts pour améliorer votre jeu
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Suivi des Performances</CardTitle>
                <CardDescription>
                  Analysez vos sessions et suivez votre progression en temps réel
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Communauté Active</CardTitle>
                <CardDescription>
                  Rejoignez une communauté de joueurs passionnés et motivés
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
