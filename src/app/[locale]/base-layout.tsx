import {NextIntlClientProvider} from 'next-intl'
import {setRequestLocale} from 'next-intl/server'
import React, {ReactNode} from 'react'
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
        {children}
      </LanguageProvider>
    </NextIntlClientProvider>
  )
}
