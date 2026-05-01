'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Building2, Users, Package,
  Stethoscope, Clock, FlaskConical, LogOut, Globe,
  Menu, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminLayoutProps {
  children: ReactNode
  title: string
}

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/clinics', label: 'Clinics', icon: Building2 },
  { href: '/admin/practitioners', label: 'Practitioners', icon: Users },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/treatments', label: 'Treatments', icon: Stethoscope },
  {
    label: 'Pending',
    icon: Clock,
    children: [
      { href: '/admin/pending/clinics', label: 'Clinics' },
      { href: '/admin/pending/practitioners', label: 'Practitioners' },
    ],
  },
  { href: '/admin/qa', label: 'QA Report', icon: FlaskConical },
] as const

export function AdminLayout({ children, title }: Readonly<AdminLayoutProps>) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  async function handleLogout() {
    await fetch('/directory/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-gray-950 px-4 py-3 lg:hidden">
        <h1 className="text-base font-semibold text-white">{title}</h1>
        <button
          type="button"
          onClick={() => setIsMobileNavOpen((open) => !open)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-gray-200"
          aria-label={isMobileNavOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileNavOpen}
        >
          {isMobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {isMobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
          aria-label="Close navigation"
        />
      ) : null}

      <div className="flex w-full lg:min-h-screen">
      {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-30 flex w-64 flex-col overflow-hidden bg-gray-950 text-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-[100svh] lg:w-56 lg:translate-x-0',
            isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
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
                  v2
                </span>
              </div>
              <div className="mt-1.5 text-lg font-semibold leading-tight text-white">Admin Console</div>
            </div>
          </div>

        {/* Nav */}
          <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
            {NAV.map((item) => {
              if ('children' in item) {
                const isGroupActive = item.children.some(c => pathname.startsWith(c.href))
                const Icon = item.icon
                return (
                  <div key={item.label}>
                    <div className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider',
                      isGroupActive ? 'text-white' : 'text-gray-500'
                    )}>
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      {item.label}
                    </div>
                    <div className="ml-6 space-y-0.5">
                      {item.children.map(child => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setIsMobileNavOpen(false)}
                          className={cn(
                            'block px-3 py-1.5 rounded-lg text-sm transition-colors',
                            pathname.startsWith(child.href)
                              ? 'bg-white/10 text-white font-medium'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              }

              const Icon = item.icon
              const active = ('exact' in item && item.exact) ? pathname === item.href : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

        {/* Footer */}
          <div className="mt-auto shrink-0 border-t border-white/10 bg-gray-950 p-2 pb-2 space-y-0.5">
            <Link
              href="/"
              onClick={() => setIsMobileNavOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Globe className="h-4 w-4" />
              View Site
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
          <header className="sticky top-0 z-10 hidden border-b border-gray-200 bg-white px-6 py-3.5 lg:block">
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          </header>
          <main className="flex-1 p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
