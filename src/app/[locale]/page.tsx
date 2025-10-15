import { redirect } from 'next/navigation'
import {setRequestLocale} from 'next-intl/server'
import {routing} from '@/i18n/routing'

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
  
  // Rediriger vers /app
  redirect(`/${locale}/app`)
}
