import {setRequestLocale} from 'next-intl/server'
import {routing} from '@/i18n/routing'
import { HeroSection } from '@/components/home/HeroSection'

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
        {/* Autres sections à venir */}
      </main>
    </div>
  )
}
