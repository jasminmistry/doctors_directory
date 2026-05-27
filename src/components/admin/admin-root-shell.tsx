'use client'

import { Suspense, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import Header from '@/components/header'
import { Footer } from '@/components/footer'
import { ScrollToTop } from '@/components/scroll-to-top'
import { CtaClickTracker } from '@/components/tracking/cta-click-tracker'

function stripDirectoryBasePath(pathname: string) {
  if (pathname === '/directory' || pathname.startsWith('/directory/')) {
    const rest = pathname.slice('/directory'.length)
    return rest ? (rest.startsWith('/') ? rest : `/${rest}`) : '/'
  }
  return pathname || '/'
}

function isUnderAdminConsole(pathname: string) {
  const p = stripDirectoryBasePath(pathname)
  return /^\/admin(?:\/|$)/.test(p)
}

export function AdminRootShell({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const pathname = usePathname() ?? ''
  const plainAdmin = isUnderAdminConsole(pathname)

  if (plainAdmin) {
    return (
      <>
        <Suspense fallback={null}>{children}</Suspense>
        <Toaster position="top-right" richColors className="site-toaster" />
        <Analytics />
      </>
    )
  }

  return (
    <div className="overflow-hidden">
      <Header />
      <Suspense fallback={null}>{children}</Suspense>
      <Footer />
      <Toaster position="top-right" richColors className="site-toaster" />
      <ScrollToTop />
      <CtaClickTracker />
      <Analytics />
    </div>
  )
}
