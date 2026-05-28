'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Building2, User, Globe, LogOut, Menu, X, Inbox, CalendarDays, MessageSquare, Lock, ExternalLink, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LeadBadge } from '@/components/portal/lead-badge'
import { ChatBadge } from '@/components/portal/chat-badge'
import { WelcomeWizard } from '@/components/portal/welcome-wizard'

const PRESENCE_INTERVAL_MS = 2 * 60 * 1000 // 2 minutes

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
  const [wizardVisible, setWizardVisible] = useState(false)
  const [wizardHasConsentzId, setWizardHasConsentzId] = useState(false)

  // Check whether to show the welcome wizard on first visit
  useEffect(() => {
    fetch('/directory/api/portal/wizard')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return
        if (!data.done) {
          setWizardHasConsentzId(data.hasConsentzId ?? false)
          setWizardVisible(true)
        }
      })
      .catch(() => {})
  }, [])

  // Keep clinic presence alive while portal is open
  useEffect(() => {
    if (entityType !== 'clinic') return
    function ping() {
      fetch('/directory/api/portal/presence', { method: 'POST' }).catch(() => {})
    }
    ping()
    const id = setInterval(ping, PRESENCE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [entityType])

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
    <div className="min-h-screen bg-[var(--primary-bg-color)]">
      {/* Mobile topbar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
        <span className="text-sm font-semibold text-gray-900 truncate">{entityName || 'My Portal'}</span>
        <div className="flex items-center gap-2">
          {entityType === 'clinic' && (
            <>
              <Link href="/portal/clinic/chat" className="relative inline-flex">
                <MessageSquare className="h-5 w-5 text-gray-500" />
                <ChatBadge mobile />
              </Link>
              <Link href="/portal/clinic/prospects" className="relative inline-flex">
                <Inbox className="h-5 w-5 text-gray-500" />
                <LeadBadge mobile />
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600"
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
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <div className="flex w-full lg:min-h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-30 flex w-64 flex-col overflow-hidden bg-[var(--primary-bg-color)] border-r border-[#D4CFC5] transition-transform duration-200 lg:sticky lg:top-0 lg:h-[100svh] lg:w-56 lg:translate-x-0',
            isMobileNavOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          {/* Brand */}
          <div className="shrink-0 border-b border-[#D4CFC5] px-4 py-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Consentz Portal</p>
              {plan && (
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border',
                  plan === 'subscription' && 'border-cyan-300 bg-cyan-50 text-cyan-700',
                  plan === 'pay_per_lead' && 'border-violet-300 bg-violet-50 text-violet-700',
                  plan === 'free' && 'border-gray-200 bg-gray-50 text-gray-500',
                )}>
                  {plan === 'subscription' ? 'Sub' : plan === 'pay_per_lead' ? 'PPL' : 'Free'}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-bold text-gray-900 truncate">{entityName || 'My Portal'}</p>
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
                    active ? 'bg-black text-white' : 'text-gray-600 hover:bg-[#E8E3D8] hover:text-gray-900',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              )
            })}

            {entityType === 'clinic' && (
              <>
                <p className="mt-3 mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                  Marketing
                </p>
                <Link
                  href="/portal/clinic/prospects"
                  onClick={() => setIsMobileNavOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith('/portal/clinic/prospects')
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:bg-[#E8E3D8] hover:text-gray-900',
                  )}
                >
                  <Inbox className="h-4 w-4 shrink-0" />
                  <span className="flex-1">Prospects</span>
                  <LeadBadge />
                </Link>

                {plan === 'free' ? (
                  <Link
                    href="/portal/clinic/calendar"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 cursor-not-allowed"
                    title="Upgrade to access Calendar"
                  >
                    <CalendarDays className="h-4 w-4 shrink-0" />
                    <span className="flex-1">Calendar</span>
                    <Lock className="h-3 w-3 shrink-0" />
                  </Link>
                ) : (
                  <Link
                    href="/portal/clinic/calendar"
                    onClick={() => setIsMobileNavOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname.startsWith('/portal/clinic/calendar')
                        ? 'bg-black text-white'
                        : 'text-gray-600 hover:bg-[#E8E3D8] hover:text-gray-900',
                    )}
                  >
                    <CalendarDays className="h-4 w-4 shrink-0" />
                    Calendar
                  </Link>
                )}

                <Link
                  href="/portal/clinic/chat"
                  onClick={() => setIsMobileNavOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith('/portal/clinic/chat')
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:bg-[#E8E3D8] hover:text-gray-900',
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="flex-1">Chat</span>
                  <ChatBadge />
                </Link>

                <p className="mt-3 mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                  Settings
                </p>
                <Link
                  href="/portal/clinic/schedule"
                  onClick={() => setIsMobileNavOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith('/portal/clinic/schedule')
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:bg-[#E8E3D8] hover:text-gray-900',
                  )}
                >
                  <Clock className="h-4 w-4 shrink-0" />
                  Schedule
                </Link>
              </>
            )}

            {entityType === 'practitioner' && (
              <>
                <p className="mt-3 mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                  Settings
                </p>
                <Link
                  href="/portal/practitioner/schedule"
                  onClick={() => setIsMobileNavOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith('/portal/practitioner/schedule')
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:bg-[#E8E3D8] hover:text-gray-900',
                  )}
                >
                  <Clock className="h-4 w-4 shrink-0" />
                  Schedule
                </Link>
              </>
            )}

            <div className="my-2 mx-1 border-t border-[#D4CFC5]" />
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileNavOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-[#E8E3D8] hover:text-gray-900 transition-colors"
            >
              <Globe className="h-4 w-4 shrink-0" />
              <span className="flex-1">View Directory</span>
              <ExternalLink className="h-3 w-3 opacity-40" />
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </button>
          </nav>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1 flex flex-col bg-[var(--primary-bg-color)]">
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>

      {wizardVisible && (
        <WelcomeWizard
          entityName={entityName}
          hasConsentzId={wizardHasConsentzId}
          onDone={() => setWizardVisible(false)}
        />
      )}
    </div>
  )
}
