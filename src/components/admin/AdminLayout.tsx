"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  Stethoscope,
  FlaskConical,
  LogOut,
  Globe,
  Menu,
  X,
  ShieldCheck,
  Star,
  BarChart3,
  Globe2,
  ExternalLink,
  Sparkles,
  Link2Off,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AdminCountsContext = createContext<{ refreshCounts: () => void }>({
  refreshCounts: () => {},
});
export function useAdminCounts() {
  return useContext(AdminCountsContext);
}

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

interface PendingCounts {
  pendingClaims: number;
  pendingVerifications: number;
  pendingUnlinkRequests: number;
}

function NavBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/clinics", label: "Clinics", icon: Building2 },
  { href: "/admin/clinics/claim-invites", label: "Claim Invites", icon: Mail },
  {
    href: "/admin/featured-profiles",
    label: "Featured Profiles",
    icon: Sparkles,
  },
  { href: "/admin/practitioners", label: "Practitioners", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/treatments", label: "Treatments", icon: Stethoscope },
  { href: "/admin/unlink-requests", label: "Unlink Requests", icon: Link2Off },
  { href: "/admin/claims", label: "Claims", icon: ShieldCheck },
  { href: "/admin/verification", label: "ID Verification", icon: ShieldCheck },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/qa", label: "QA Report", icon: FlaskConical },
  { href: "/admin/tracking", label: "Directory tracking", icon: BarChart3 },
  {
    href: "/admin/main-site-tracking",
    label: "Main site tracking",
    icon: Globe2,
  },
] as const;

export function AdminLayout({ children, title }: Readonly<AdminLayoutProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [counts, setCounts] = useState<PendingCounts>({
    pendingClaims: 0,
    pendingVerifications: 0,
    pendingUnlinkRequests: 0,
  });

  function refreshCounts() {
    fetch("/directory/api/admin/pending-counts")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setCounts(data);
      })
      .catch(() => {});
  }

  useEffect(() => {
    refreshCounts();
  }, [pathname]);

  async function handleLogout() {
    await fetch("/directory/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  // When multiple non-exact hrefs prefix-match (e.g. /admin/clinics and
  // /admin/clinics/claim-invites), only the longest (most specific) one lights up.
  const bestPrefixMatch = NAV
    .filter((item) => !("exact" in item && item.exact) && pathname.startsWith(item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <AdminCountsContext.Provider value={{ refreshCounts }}>
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <h1 className="text-base font-semibold text-white">{title}</h1>
          <button
            type="button"
            onClick={() => setIsMobileNavOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e0e0e0]  text-gray-600"
            aria-label={isMobileNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileNavOpen}
          >
            {isMobileNavOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>

        {isMobileNavOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-20 bg-black/30 lg:hidden"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Close navigation"
          />
        ) : null}

        <div className="flex w-full lg:min-h-screen">
          {/* Sidebar */}
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-30 flex w-64 flex-col overflow-hidden bg-white border-r border-gray-200 transition-transform duration-200 lg:sticky lg:top-0 lg:h-[100svh] lg:w-56 lg:translate-x-0",
              isMobileNavOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            {/* Brand */}
            <div className="shrink-0 border-b border-gray-200 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                Consentz
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                Admin Console
              </p>
            </div>

            {/* Nav */}
            <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active =
                  "exact" in item && item.exact
                    ? pathname === item.href
                    : item.href === bestPrefixMatch;

                const topCount =
                  item.href === "/admin/unlink-requests"
                    ? counts.pendingUnlinkRequests
                    : item.href === "/admin/claims"
                      ? counts.pendingClaims
                      : item.href === "/admin/verification"
                        ? counts.pendingVerifications
                        : 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                    <NavBadge count={topCount} />
                  </Link>
                );
              })}

              <div className="my-2 mx-1 border-t border-gray-200" />

              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Globe className="h-4 w-4 shrink-0" />
                <span className="flex-1">View Directory</span>
                <ExternalLink className="h-3 w-3 opacity-80" />
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Sign out
              </button>
            </nav>
          </aside>

          {/* Main */}
          <div className="min-w-0 flex-1 flex flex-col bg-white">
            <div
              role="banner"
              className="sticky top-0 z-10 hidden bg-[var(--primary-bg-color)] border-b border-gray-200 px-6 py-3.5 lg:block"
            >
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            </div>
            <main className="flex-1 p-4 sm:p-6">{children}</main>
          </div>
        </div>
      </div>
    </AdminCountsContext.Provider>
  );
}
