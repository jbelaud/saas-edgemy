import {setRequestLocale} from 'next-intl/server'
import {routing} from '@/i18n/routing'
import { HeroSection } from '@/components/home/HeroSection'
import { HowItWorksSection } from '@/components/home/HowItWorksSection'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { DualSection } from '@/components/home/DualSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { MissionSection } from '@/components/home/MissionSection'
import { CTASection } from '@/components/home/CTASection'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}))
}

export default async function Home({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)
  
  return (
    <div className="min-h-screen bg-slate-950">
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <DualSection />
        <TestimonialsSection />
        <MissionSection />
        <CTASection />
      </main>
    </div>
  )
}
