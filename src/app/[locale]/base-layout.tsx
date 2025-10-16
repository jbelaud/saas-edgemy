import {NextIntlClientProvider} from 'next-intl'
import {setRequestLocale} from 'next-intl/server'
import React, {ReactNode} from 'react'

type Props = {
  children: ReactNode
  locale: string
}

export default async function BaseLayout({children, locale}: Props) {
  setRequestLocale(locale)

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
