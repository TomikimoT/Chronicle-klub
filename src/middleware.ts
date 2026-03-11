import { updateSession } from '@/utils/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextRequest } from 'next/server'

const handleI18nRouting = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  // 1. Update Supabase Session
  const response = await updateSession(request)

  // 2. Handle i18n routing
  return handleI18nRouting(request)
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(cs|en)/:path*', '/((?!_next|_vercel|.*\\..*).*)']
}
