import {NextIntlClientProvider} from 'next-intl'
import {setRequestLocale} from 'next-intl/server'
import React, {ReactNode} from 'react'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppFooter } from '@/components/layout/AppFooter'
import { LanguageProvider } from '@/contexts/LanguageContext'

type Props = {
  children: ReactNode
  locale: string
}

export default async function BaseLayout({children, locale}: Props) {
  setRequestLocale(locale)

  return (
    <NextIntlClientProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <AppHeader />
          <main className="flex-1">
            {children}
          </main>
          <AppFooter />
        </div>
      </LanguageProvider>
    </NextIntlClientProvider>
  )
}
