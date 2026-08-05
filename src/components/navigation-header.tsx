"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, Menu, Home, User, ChevronDown, Building2, Tag, Briefcase, LogOut, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface PatientUser {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
}

interface PortalUser {
  entityType: 'clinic' | 'practitioner'
  entityName: string
  entitySlug: string
  claimerName: string
  claimerEmail: string
}

export function NavigationHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProviderOpen, setIsProviderOpen] = useState(false)
  const [isPatientOpen, setIsPatientOpen] = useState(false)
  const [isPortalOpen, setIsPortalOpen] = useState(false)
  const providerRef = useRef<HTMLDivElement>(null)
  const patientRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  const [patientUser, setPatientUser] = useState<PatientUser | null | undefined>(undefined)
  const [portalUser, setPortalUser] = useState<PortalUser | null | undefined>(undefined)

  useEffect(() => {
    fetch('/directory/api/patient/me/').then((r) => r.ok ? r.json() : null).then(setPatientUser)
    fetch('/directory/api/portal/me/').then((r) => r.ok ? r.json() : null).then(setPortalUser)
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (providerRef.current && !providerRef.current.contains(e.target as Node)) setIsProviderOpen(false)
      if (patientRef.current && !patientRef.current.contains(e.target as Node)) setIsPatientOpen(false)
      if (portalRef.current && !portalRef.current.contains(e.target as Node)) setIsPortalOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function handlePatientLogout() {
    await fetch('/directory/api/patient/auth/logout/', { method: 'POST' })
    setPatientUser(null)
    setIsPatientOpen(false)
    router.push('/')
    router.refresh()
  }

  async function handlePortalLogout() {
    await fetch('/directory/api/auth/logout/', { method: 'POST' })
    setPortalUser(null)
    setIsPortalOpen(false)
    router.push('/')
    router.refresh()
  }

  const isHomePage = pathname === "/"
  const patientDisplayName = patientUser?.firstName
    ? patientUser.firstName
    : patientUser?.email?.split('@')[0] ?? ''

  const portalDisplayName = portalUser?.entityName ?? portalUser?.claimerName ?? ''

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled || !isHomePage
          ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-medium text-xl text-foreground hover:text-accent transition-colors"
          >
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Search className="h-4 w-4 text-accent-foreground" />
            </div>
            HealthDirectory
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-accent",
                pathname === "/" ? "text-accent" : "text-muted-foreground",
              )}
            >
              <Home className="h-4 w-4" />
              Directory
            </Link>

            {/* Patient auth state */}
            {patientUser ? (
              <div className="relative" ref={patientRef}>
                <button
                  onClick={() => setIsPatientOpen((o) => !o)}
                  className="flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-accent"
                  aria-expanded={isPatientOpen}
                >
                  <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent">
                    {patientDisplayName.charAt(0).toUpperCase()}
                  </div>
                  {patientDisplayName}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isPatientOpen && "rotate-180")} />
                </button>
                {isPatientOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 rounded-lg border border-border bg-background py-1 z-50">
                    <div className="px-4 py-2.5 border-b border-border">
                      <p className="text-xs font-medium text-foreground truncate">{patientUser.email}</p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setIsPatientOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-accent/10 transition-colors"
                    >
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      My account
                    </Link>
                    <button
                      onClick={handlePatientLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-accent/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4 text-muted-foreground shrink-0" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : patientUser === null ? (
              <Link
                href="/account/login"
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
              >
                <User className="h-4 w-4" />
                Patient sign in
              </Link>
            ) : null /* loading */}

            {/* Portal auth state */}
            {portalUser ? (
              <div className="relative" ref={portalRef}>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 bg-transparent"
                  onClick={() => setIsPortalOpen((o) => !o)}
                  aria-expanded={isPortalOpen}
                >
                  <Building2 className="h-4 w-4" />
                  {portalDisplayName}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isPortalOpen && "rotate-180")} />
                </Button>
                {isPortalOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 rounded-lg border border-border bg-background py-1 z-50">
                    <div className="px-4 py-2.5 border-b border-border">
                      <p className="text-xs font-medium text-foreground truncate">{portalUser.claimerEmail}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">{portalUser.entityType} portal</p>
                    </div>
                    <Link
                      href="/portal/clinic"
                      onClick={() => setIsPortalOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-accent/10 transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground shrink-0" />
                      Go to portal
                    </Link>
                    <button
                      onClick={handlePortalLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-accent/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4 text-muted-foreground shrink-0" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : portalUser === null ? (
              /* Provider dropdown — only shown when no portal user logged in */
              <div className="relative" ref={providerRef}>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 bg-transparent"
                  onClick={() => setIsProviderOpen((o) => !o)}
                  aria-expanded={isProviderOpen}
                >
                  <Building2 className="h-4 w-4" />
                  For providers
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isProviderOpen && "rotate-180")} />
                </Button>
                {isProviderOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 rounded-lg border border-border bg-background py-1 z-50">
                    <Link
                      href="/register/clinic"
                      onClick={() => setIsProviderOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-accent/10 transition-colors"
                    >
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      List your practice
                    </Link>
                    <Link
                      href="/register/clinic"
                      onClick={() => setIsProviderOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-accent/10 transition-colors"
                    >
                      <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                      Claim your profile
                    </Link>
                    <Link
                      href="/register/practitioner"
                      onClick={() => setIsProviderOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-accent/10 transition-colors"
                    >
                      <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                      Register as practitioner
                    </Link>
                  </div>
                )}
              </div>
            ) : null /* loading */}
          </nav>

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-1 mt-6">
                <Link
                  href="/"
                  className={cn(
                    "flex items-center gap-3 px-2 py-2.5 rounded-lg text-base font-medium transition-colors hover:bg-accent/10",
                    pathname === "/" ? "text-accent" : "text-foreground",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  Directory
                </Link>

                <div className="my-2 border-t border-border" />
                <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Patient</p>

                {patientUser ? (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-foreground">{patientDisplayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{patientUser.email}</p>
                    </div>
                    <Link
                      href="/account"
                      className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-base font-medium transition-colors hover:bg-accent/10"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      My account
                    </Link>
                    <button
                      onClick={() => { handlePatientLogout(); setIsMobileMenuOpen(false) }}
                      className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-base font-medium transition-colors hover:bg-accent/10 text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/account/login"
                    className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-base font-medium transition-colors hover:bg-accent/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    Sign in / Create account
                  </Link>
                )}

                <div className="my-2 border-t border-border" />
                <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {portalUser ? 'Portal' : 'Providers'}
                </p>

                {portalUser ? (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-foreground">{portalDisplayName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{portalUser.entityType} portal</p>
                    </div>
                    <Link
                      href="/portal/clinic"
                      className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-base font-medium transition-colors hover:bg-accent/10"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Go to portal
                    </Link>
                    <button
                      onClick={() => { handlePortalLogout(); setIsMobileMenuOpen(false) }}
                      className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-base font-medium transition-colors hover:bg-accent/10 text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register/clinic"
                      className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-base font-medium transition-colors hover:bg-accent/10"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Building2 className="h-5 w-5" />
                      List your practice
                    </Link>
                    <Link
                      href="/register/clinic"
                      className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-base font-medium transition-colors hover:bg-accent/10"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Tag className="h-5 w-5" />
                      Claim your profile
                    </Link>
                    <Link
                      href="/register/practitioner"
                      className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-base font-medium transition-colors hover:bg-accent/10"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Briefcase className="h-5 w-5" />
                      Register as practitioner
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
