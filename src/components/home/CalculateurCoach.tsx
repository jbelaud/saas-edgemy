'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, animate } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';

interface CalculateurInputs {
  nombreEleves: number;
  sessionsParSemaine: number;
  dureeMoyenne: number;
  tarifHoraire: number;
  tempsAdminSemaine: number;
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const animation = animate(displayValue, value, {
      duration: 1,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayValue(latest);
      },
    });

    return () => animation.stop();
  }, [value, displayValue]);

  return (
    <span>
      {Math.round(displayValue)}
      {suffix}
    </span>
  );
}

export function CalculateurCoach() {
  const t = useTranslations('home.calculator');
  const [inputs, setInputs] = useState<CalculateurInputs>({
    nombreEleves: 10,
    sessionsParSemaine: 4,
    dureeMoyenne: 1.5,
    tarifHoraire: 60,
    tempsAdminSemaine: 5,
  });

  const updateInput = (key: keyof CalculateurInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  // Calculs avec useMemo
  const resultats = useMemo(() => {
    const { nombreEleves, sessionsParSemaine, dureeMoyenne, tarifHoraire, tempsAdminSemaine } = inputs;

    // 1. Revenu mensuel actuel
    const revenuMensuel = sessionsParSemaine * dureeMoyenne * tarifHoraire * 4;

    // 2. Temps admin perdu par mois
    // = Temps de base (organisation, planning, paiements)
    //   + Temps par élève (suivi individuel, facturation, communication)
    // Exclut : replays, génération automatique de liens (fonctionnalités futures)
    const tempsAdminBase = tempsAdminSemaine * 4; // Temps hebdo × 4 semaines
    const tempsAdminParEleve = nombreEleves * 0.25; // 15 min (0.25h) par élève/mois
    const tempsPerduParMois = tempsAdminBase + tempsAdminParEleve;

    // 3. Valeur du temps admin perdu (ce temps pourrait être utilisé pour coacher)
    const revenuVirtuelPerdu = tempsPerduParMois * tarifHoraire;

    // 4. Temps récupéré grâce à Edgemy
    // Taux de récupération réaliste : 55% (simplification organisation, planning, paiements)
    // Note : N'inclut pas encore la gestion automatique des replays/liens (futures fonctionnalités)
    const tauxRecuperation = 0.55;
    const tempsRecupere = tempsPerduParMois * tauxRecuperation;

    // 5. Gain économique Edgemy (valeur du temps récupéré)
    const gainMensuel = tempsRecupere * tarifHoraire;

    // 6. ROI estimé (prix Edgemy = 39 €/mois)
    const prixEdgemy = 39;
    const roi = gainMensuel > 0 ? gainMensuel / prixEdgemy : 0;
    const moisPourRentabiliser = gainMensuel > 0 ? prixEdgemy / gainMensuel : 0;

    return {
      revenuMensuel,
      tempsAdminBase,
      tempsAdminParEleve,
      tempsPerduParMois,
      tempsRecupere,
      revenuVirtuelPerdu,
      gainMensuel,
      roi,
      moisPourRentabiliser,
      prixEdgemy,
      tauxRecuperation,
    };
  }, [inputs]);

  return (
    <section className="relative py-24 bg-slate-950">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
          >
            {t('title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            {t('subtitle')}
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Formulaire d'inputs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex"
          >
            <Card className="bg-slate-900/50 backdrop-blur-sm border-white/10 shadow-2xl w-full">
              <CardHeader>
                <CardTitle className="text-2xl text-white">{t('formTitle')}</CardTitle>
                <CardDescription className="text-gray-400">
                  {t('formDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nombre d'élèves */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="nombreEleves" className="text-gray-300 text-base">
                      {t('inputs.students')}
                    </Label>
                    <span className="text-green-400 font-bold text-lg">{inputs.nombreEleves}</span>
                  </div>
                  <input
                    id="nombreEleves"
                    type="range"
                    min="0"
                    max="50"
                    value={inputs.nombreEleves}
                    onChange={(e) => updateInput('nombreEleves', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>50</span>
                  </div>
                </div>

                {/* Sessions par semaine */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="sessionsParSemaine" className="text-gray-300 text-base">
                      {t('inputs.sessions')}
                    </Label>
                    <span className="text-green-400 font-bold text-lg">{inputs.sessionsParSemaine}</span>
                  </div>
                  <input
                    id="sessionsParSemaine"
                    type="range"
                    min="0"
                    max="30"
                    value={inputs.sessionsParSemaine}
                    onChange={(e) => updateInput('sessionsParSemaine', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>30</span>
                  </div>
                </div>

                {/* Durée moyenne */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="dureeMoyenne" className="text-gray-300 text-base">
                      {t('inputs.duration')}
                    </Label>
                    <span className="text-green-400 font-bold text-lg">{inputs.dureeMoyenne}h</span>
                  </div>
                  <input
                    id="dureeMoyenne"
                    type="range"
                    min="0.5"
                    max="4"
                    step="0.5"
                    value={inputs.dureeMoyenne}
                    onChange={(e) => updateInput('dureeMoyenne', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0.5h</span>
                    <span>4h</span>
                  </div>
                </div>

                {/* Tarif horaire */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="tarifHoraire" className="text-gray-300 text-base">
                      {t('inputs.rate')}
                    </Label>
                    <span className="text-green-400 font-bold text-lg">{inputs.tarifHoraire}€</span>
                  </div>
                  <input
                    id="tarifHoraire"
                    type="range"
                    min="10"
                    max="200"
                    value={inputs.tarifHoraire}
                    onChange={(e) => updateInput('tarifHoraire', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10€</span>
                    <span>200€</span>
                  </div>
                </div>

                {/* Temps administratif */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="tempsAdminSemaine" className="text-gray-300 text-base">
                      {t('inputs.adminTime')}
                    </Label>
                    <span className="text-green-400 font-bold text-lg">{inputs.tempsAdminSemaine}h</span>
                  </div>
                  <input
                    id="tempsAdminSemaine"
                    type="range"
                    min="0"
                    max="30"
                    value={inputs.tempsAdminSemaine}
                    onChange={(e) => updateInput('tempsAdminSemaine', Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0h</span>
                    <span>30h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Résultats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex"
          >
            <Card className="bg-gradient-to-br from-green-900/30 to-green-950/30 backdrop-blur-sm border-green-500/20 shadow-2xl w-full">
              <CardHeader>
                <CardTitle className="text-2xl text-white">{t('resultsTitle')}</CardTitle>
                <CardDescription className="text-gray-300">
                  {t('resultsDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Gain mensuel */}
                <motion.div
                  className="p-6 bg-gradient-to-br from-green-600/20 to-green-700/20 rounded-xl border border-green-500/30"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-sm text-green-300 mb-2">{t('results.valueRecovered')}</div>
                  <div className="text-4xl font-bold text-green-400">
                    +<AnimatedNumber value={Math.round(resultats.gainMensuel)} /> €
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {t('results.perMonth')}
                  </div>
                </motion.div>

                {/* Heures économisées */}
                <motion.div
                  className="p-6 bg-gradient-to-br from-blue-600/20 to-blue-700/20 rounded-xl border border-blue-500/30"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-sm text-blue-300 mb-2">{t('results.timeRecovered')}</div>
                  <div className="text-4xl font-bold text-blue-400">
                    <AnimatedNumber value={Math.round(resultats.tempsRecupere * 10) / 10} suffix="h" />
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {t('results.timeUse')}
                  </div>
                </motion.div>

                {/* ROI */}
                <motion.div
                  className="p-6 bg-gradient-to-br from-amber-600/20 to-amber-700/20 rounded-xl border border-amber-500/30"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-sm text-amber-300 mb-2">{t('results.roi')}</div>
                  <div className="text-4xl font-bold text-amber-400">
                    <AnimatedNumber value={Math.round(resultats.roi * 10) / 10} suffix="x" />
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {t('results.roiDescription', { price: resultats.prixEdgemy })}
                  </div>
                </motion.div>

                {/* Phrase personnalisée - keeping dynamic values inline */}
                <div className="p-6 bg-slate-800/50 rounded-xl border border-white/10">
                  <p className="text-gray-300 leading-relaxed">
                    {t.rich('results.summary', {
                      hours: Math.round(resultats.tempsRecupere * 10) / 10,
                      value: Math.round(resultats.gainMensuel),
                      roi: Math.round(resultats.roi * 10) / 10
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 max-w-4xl mx-auto"
        >
          <div className="p-6 bg-slate-900/50 border border-amber-500/20 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-amber-400 font-semibold text-lg mb-2">
                  {t('disclaimer.title')}
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {t('disclaimer.text')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA séparé en dessous */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 max-w-2xl mx-auto"
        >
          <button
            onClick={() => {
              const event = new CustomEvent('openCoachModal');
              window.dispatchEvent(event);
            }}
            className="w-full px-8 py-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-amber-500/20"
          >
            {t('cta')}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
