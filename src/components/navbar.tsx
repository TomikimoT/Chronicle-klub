import { Link } from '@/i18n/routing'
import { ThemeSwitcher } from './theme-switcher'
import { LocaleSwitcher } from './locale-switcher'
import { Button } from './ui/button'
import { ScrollText, LogOut, User as UserIcon } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { logout } from '@/app/actions/auth'

export async function Navbar() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <ScrollText className="h-6 w-6" />
          <span>Chronicle</span>
        </Link>

        {/* Navigation and Tools */}
        <div className="flex items-center gap-4">
          <Link href="/calendar" className="text-sm font-medium hover:text-primary transition-colors">
            Calendar
          </Link>

          <div className="flex items-center space-x-2 border-l border-border pl-4">
            <LocaleSwitcher />
            <ThemeSwitcher />
            
            {user ? (
              <>
                <Link href="/profile" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9">
                  <UserIcon className="h-5 w-5" />
                  <span className="sr-only">Profile</span>
                </Link>
                <form action={logout}>
                  <Button variant="ghost" size="icon" type="submit" title="Logout">
                    <LogOut className="h-5 w-5 text-destructive" />
                    <span className="sr-only">Logout</span>
                  </Button>
                </form>
              </>
            ) : (
              <Link href="/login" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 rounded-md px-3 text-xs">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
