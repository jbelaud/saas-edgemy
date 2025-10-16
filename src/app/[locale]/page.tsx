import {setRequestLocale} from 'next-intl/server'
import {routing} from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Bienvenue sur Edgemy</h1>
      <p className="text-muted-foreground">
        Votre plateforme de coaching poker
      </p>
    </div>
  )
}
