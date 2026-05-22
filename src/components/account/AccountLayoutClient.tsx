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
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    fetch('/directory/api/patient/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) { router.push('/directory/account/login'); return }
        setPatient(data)
      })
      .catch(() => router.push('/directory/account/login'))
  }, [router])

  async function handleLogout() {
    await fetch('/directory/api/patient/auth/logout', { method: 'POST' })
    router.push('/directory/account/login')
    router.refresh()
  }

  const displayName = patient
    ? [patient.firstName, patient.lastName].filter(Boolean).join(' ') || patient.email
    : ''

  // Normalize pathname for comparison (strip basePath prefix)
  const bare = pathname.replace(/^\/directory/, '')

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-slate-900 border-r border-white/5 transition-transform duration-200',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">My Account</p>
            <p className="text-sm font-semibold text-white truncate max-w-[160px]">{displayName}</p>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? bare === href : bare.startsWith(href)
            return (
              <Link
                key={href}
                href={`/directory${href}`}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-slate-900">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-slate-400 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold text-white">My Account</p>
        </div>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
