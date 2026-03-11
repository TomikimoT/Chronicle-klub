'use client'

import { useRouter, usePathname } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const toggleLocale = () => {
    const nextLocale = locale === 'cs' ? 'en' : 'cs'
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <Button variant="ghost" onClick={toggleLocale} className="uppercase font-bold">
      {locale}
    </Button>
  )
}
