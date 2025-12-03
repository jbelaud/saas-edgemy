'use client';

import { useTranslations } from 'next-intl';

export function MissionSection() {
  const t = useTranslations('home.mission');

  const valueIcons = [
    <svg key="community" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>,
    <svg key="quality" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>,
    <svg key="simplicity" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ];

  const values = [
    { key: 'community', icon: valueIcons[0] },
    { key: 'quality', icon: valueIcons[1] },
    { key: 'simplicity', icon: valueIcons[2] }
  ];

  return (
    <section id="about" className="relative py-32 bg-slate-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/5 via-emerald-500/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-block px-6 py-2 mb-8 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
            <span className="text-gray-300 text-sm font-semibold">{t('badge')}</span>
          </div>

          {/* Main Title */}
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              {t('title1')}
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-400 bg-clip-text text-transparent">
              {t('title2')}
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed max-w-3xl mx-auto">
            {t('subtitle')}
          </p>

          {/* Values Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {values.map((value) => (
              <div
                key={value.key}
                className="group p-6 bg-slate-950/30 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="w-14 h-14 mb-4 bg-gradient-to-br from-amber-500/10 to-emerald-500/10 rounded-xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform mx-auto">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{t(`values.${value.key}.title`)}</h3>
                <p className="text-gray-400 text-sm">{t(`values.${value.key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
