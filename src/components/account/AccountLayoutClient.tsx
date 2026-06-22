'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, CalendarDays, MessageSquare, UserCircle, LogOut, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PatientMe {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
}

const NAV_ITEMS = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/account/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/account/chats', label: 'Consultations', icon: MessageSquare },
  { href: '/account/profile', label: 'Profile', icon: UserCircle },
]

export function AccountLayoutClient({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [patient, setPatient] = useState<PatientMe | null>(null)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const isLoginPage = pathname.endsWith('/account/login') || pathname.endsWith('/account/login/')

  useEffect(() => {
    if (isLoginPage) return
    fetch('/directory/api/patient/me', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) { router.push('/account/login'); return }
        setPatient(data)
      })
      .catch(() => router.push('/account/login'))
  }, [router, isLoginPage])

  async function handleLogout() {
    await fetch('/directory/api/patient/auth/logout', { method: 'POST' })
    router.push('/account/login')
    router.refresh()
  }

  const displayName = patient
    ? [patient.firstName, patient.lastName].filter(Boolean).join(' ') || patient.email
    : ''

  const bare = pathname.replace(/^\/directory/, '')

  if (isLoginPage) return <>{children}</>

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile topbar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
        <span className="text-sm font-semibold text-black truncate">My Account</span>
        <button
          type="button"
          onClick={() => setIsMobileNavOpen((o) => !o)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600"
          aria-label={isMobileNavOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileNavOpen}
        >
          {isMobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
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
            'fixed inset-y-0 left-0 z-30 flex w-64 flex-col overflow-hidden bg-[#262422] border-r border-[#D4CFC5] transition-transform duration-200 lg:sticky lg:top-0 lg:w-56 lg:translate-x-0',
            isMobileNavOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          {/* Brand */}
          <div className="shrink-0 border-b border-[#D4CFC5] px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-300">My Account</p>
            <p className="mt-1 text-sm font-bold text-white truncate">{displayName || '…'}</p>
          </div>

          {/* Nav */}
          <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? bare === href : bare.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-black text-white'
                      : 'text-white hover:bg-[#E8E3D8] hover:text-gray-900',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              )
            })}

            <div className="my-2 mx-1 border-t border-[#D4CFC5]" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </button>
          </nav>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1 flex flex-col bg-white">
          <main className="flex-1 p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
