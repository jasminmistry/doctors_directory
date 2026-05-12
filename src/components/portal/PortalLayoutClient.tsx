'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Building2, User, Globe, LogOut, Menu, X, Inbox, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LeadBadge } from '@/components/portal/lead-badge'

interface PortalLayoutClientProps {
  children: ReactNode
  entityType: 'clinic' | 'practitioner' | null
  entityName: string
  plan?: string | null
}

export function PortalLayoutClient({ children, entityType, entityName, plan }: PortalLayoutClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const baseNav =
    entityType === 'clinic'
      ? [{ href: '/portal/clinic', label: 'My Clinic', icon: Building2 }]
      : entityType === 'practitioner'
        ? [{ href: '/portal/practitioner', label: 'My Profile', icon: User }]
        : []

  async function handleLogout() {
    await fetch('/directory/api/auth/logout', { method: 'POST' })
    router.push('/portal/login')
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile topbar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-gray-950 px-4 py-3 lg:hidden">
        <span className="text-sm font-semibold text-white truncate">{entityName || 'My Portal'}</span>
        <div className="flex items-center gap-2">
          {entityType === 'clinic' && (
            <Link href="/portal/clinic/prospects" className="relative inline-flex">
              <Inbox className="h-5 w-5 text-gray-400" />
              <LeadBadge mobile />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-gray-200"
            aria-label={isMobileNavOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileNavOpen}
          >
            {isMobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isMobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <div className="flex w-full lg:min-h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-30 flex w-64 flex-col overflow-hidden bg-gray-950 text-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-[100svh] lg:w-56 lg:translate-x-0',
            isMobileNavOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          {/* Brand */}
          <div className="shrink-0 border-b border-white/10 px-4 py-4">
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
                  Consentz
                </span>
                <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-medium text-cyan-100">
                  Portal
                </span>
              </div>
              <div className="mt-1.5 text-sm font-semibold leading-tight text-white truncate">{entityName || 'My Portal'}</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
            {baseNav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              )
            })}

            {entityType === 'clinic' && (
              <>
                <p className="mt-3 mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                  Marketing
                </p>
                <Link
                  href="/portal/clinic/prospects"
                  onClick={() => setIsMobileNavOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith('/portal/clinic/prospects')
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5',
                  )}
                >
                  <Inbox className="h-4 w-4 shrink-0" />
                  <span className="flex-1">Prospects</span>
                  <LeadBadge />
                </Link>

                <Link
                  href="/portal/clinic/calendar"
                  onClick={() => setIsMobileNavOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith('/portal/clinic/calendar')
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5',
                  )}
                >
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  Calendar
                </Link>
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="mt-auto shrink-0 border-t border-white/10 bg-gray-950 p-2 pb-2 space-y-0.5">
            <Link
              href="/"
              onClick={() => setIsMobileNavOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Globe className="h-4 w-4" />
              View Directory
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1 flex flex-col bg-gray-50">
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
