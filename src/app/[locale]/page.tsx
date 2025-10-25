import {setRequestLocale} from 'next-intl/server'
import {routing} from '@/i18n/routing'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { HeroSection } from '@/components/landing/HeroSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { WhyEdgemySection } from '@/components/landing/WhyEdgemySection'
import { DualSection } from '@/components/landing/DualSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { MissionSection } from '@/components/landing/MissionSection'
import { FinalCTASection } from '@/components/landing/FinalCTASection'
import { LandingFooter } from '@/components/landing/LandingFooter'

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
      <LandingHeader />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <WhyEdgemySection />
        <DualSection />
        <TestimonialsSection />
        <MissionSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
