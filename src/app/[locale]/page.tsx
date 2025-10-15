import Link from 'next/link'
import {Metadata} from 'next/types'
import {getTranslations, setRequestLocale} from 'next-intl/server'

import ButtonConnexionDashboardModal from '@/components/features/auth/button-connexion-dashboard-modal'
import ButtonDevenirCoachWrapper from '@/components/features/auth/button-devenir-coach-wrapper'
import EdgemyFooter from '@/components/features/home/edgemy-footer'
import FeaturedCoaches from '@/components/features/home/featured-coaches'
import FinalCTA from '@/components/features/home/final-cta'
import ForPlayersAndCoaches from '@/components/features/home/for-players-and-coaches'
import HeroSection from '@/components/features/home/hero-section'
import HowItWorks from '@/components/features/home/how-it-works'
import Testimonials from '@/components/features/home/testimonials'
import ImageTheme from '@/components/image-theme'
import {LangToggle} from '@/components/lang-toggle'
import {ModeToggle} from '@/components/theme-toggle'
import {routing} from '@/i18n/routing'
import {APP_NAME} from '@/lib/constants'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>
}): Promise<Metadata> {
  const {locale} = await params
  setRequestLocale(locale)
  const t = await getTranslations({locale, namespace: 'HomePage'})

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)
  const t = await getTranslations('HomePage')
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-border bg-background/80 sticky top-0 z-50 flex w-full items-center border-b px-4 py-4 backdrop-blur sm:px-6 md:px-8">
        <div className="flex items-center gap-2">
          <ImageTheme
            className="relative z-10"
            src="/next.svg"
            srcDark="/next-inverted.svg"
            alt="App Logo"
            width={32}
            height={32}
            priority
          />
          <span className="hidden text-xl font-bold tracking-tight sm:inline">
            {APP_NAME}
          </span>
        </div>
        <nav className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 gap-8 text-sm font-medium md:flex">
          <Link href="#how-it-works" className="hover:text-primary transition">
            {t('navigation.howItWorks')}
          </Link>
          <Link href="#coaches" className="hover:text-primary transition">
            {t('navigation.coaches')}
          </Link>
          <Link href="#testimonials" className="hover:text-primary transition">
            {t('navigation.testimonials')}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ButtonDevenirCoachWrapper />
          <LangToggle />
          <ButtonConnexionDashboardModal />
          <ModeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* How It Works */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* Featured Coaches */}
      <div id="coaches">
        <FeaturedCoaches />
      </div>

      {/* For Players and Coaches */}
      <ForPlayersAndCoaches />

      {/* Testimonials */}
      <div id="testimonials">
        <Testimonials />
      </div>

      {/* Final CTA */}
      <FinalCTA />

      {/* Footer */}
      <EdgemyFooter />
    </div>
  )
}
