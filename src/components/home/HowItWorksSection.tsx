'use client';

import { useTranslations } from 'next-intl';

export function HowItWorksSection() {
  const t = useTranslations('home.howItWorks');

  const stepIcons = [
    <svg key="search" className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>,
    <svg key="calendar" className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>,
    <svg key="progress" className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ];

  const steps = [
    { key: 'step1', icon: stepIcons[0] },
    { key: 'step2', icon: stepIcons[1] },
    { key: 'step3', icon: stepIcons[2] }
  ];

  return (
    <section className="relative py-24 bg-slate-900">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className="relative group"
            >
              {/* Connector Line (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-amber-500/50 to-transparent"></div>
              )}

              {/* Card */}
              <div className="relative p-8 bg-slate-950/50 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-amber-500/20 transition-all duration-300 hover:-translate-y-2">
                {/* Number Badge */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-slate-950 font-bold text-lg shadow-lg shadow-amber-500/20">
                  {t(`${step.key}.number`)}
                </div>

                {/* Icon */}
                <div className="w-20 h-20 mb-6 bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-2xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-3 text-white">
                  {t(`${step.key}.title`)}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {t(`${step.key}.description`)}
                </p>

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
