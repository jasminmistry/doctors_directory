"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  User,
  Globe,
  LogOut,
  Menu,
  X,
  Inbox,
  CalendarDays,
  CalendarClock,
  MessageSquare,
  MessageSquareText,
  Presentation,
  Lock,
  ExternalLink,
  Clock,
  CalendarCheck,
  PoundSterling,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LeadBadge } from "@/components/portal/lead-badge";
import { ChatBadge } from "@/components/portal/chat-badge";
import { WelcomeWizard } from "@/components/portal/welcome-wizard";
import { HeaderIconLink } from "@/components/portal/header-icon-link";
import { HeaderProfileMenu } from "@/components/portal/header-profile-menu";

const PRESENCE_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

interface PortalLayoutClientProps {
  children: ReactNode;
  entityType: "clinic" | "practitioner" | null;
  entityName: string;
  plan?: string | null;
  hasCoreClinic?: boolean;
}

export function PortalLayoutClient({
  children,
  entityType,
  entityName,
  plan,
  hasCoreClinic = false,
}: PortalLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [wizardVisible, setWizardVisible] = useState(false);
  const [wizardHasConsentzId, setWizardHasConsentzId] = useState(false);

  // Check whether to show the welcome wizard on first visit
  useEffect(() => {
    fetch("/directory/api/portal/wizard")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (!data.done) {
          setWizardHasConsentzId(data.hasConsentzId ?? false);
          setWizardVisible(true);
        }
      })
      .catch(() => {});
  }, []);

  // Keep clinic presence alive while portal is open
  useEffect(() => {
    if (entityType !== "clinic") return;
    function ping() {
      fetch("/directory/api/portal/presence", { method: "POST" }).catch(
        () => {},
      );
    }
    ping();
    const id = setInterval(ping, PRESENCE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [entityType]);

  // Force a fresh server auth check when this page is restored from the
  // browser's back-forward cache (e.g. hitting Back after logging out) —
  // bfcache restores the last-rendered DOM without re-running the layout's
  // server-side redirect() check.
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        window.location.reload();
      }
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const baseNav =
    entityType === "clinic"
      ? [{ href: "/portal/clinic", label: "My Clinic", icon: Building2 }]
      : entityType === "practitioner"
        ? [{ href: "/portal/practitioner", label: "My Profile", icon: User }]
        : [];

  async function handleLogout() {
    await fetch("/directory/api/auth/logout", { method: "POST" });
    window.location.href = "/directory/portal/login";
  }

  return (
    <div className="min-h-screen bg-[#fbfbfb]">
      {/* Mobile topbar */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-[var(--primary-bg-color)] px-4 py-3 shadow-[0_0_2px_0_rgba(0,0,0,0.2)] lg:hidden">
        <span className="text-sm font-semibold text-gray-900 truncate">
          {entityName || "My Portal"}
        </span>
        <div className="flex items-center gap-2">
          {entityType === "clinic" && (
            <>
              <Link href="/portal/clinic/chat" className="relative inline-flex">
                <MessageSquareText
                  className="h-6 w-6 text-black"
                  strokeWidth={1.5}
                />
                <ChatBadge mobile />
              </Link>
              <Link
                href="/portal/clinic/prospects"
                className="relative inline-flex"
              >
                <Presentation
                  className="h-6 w-6 text-black"
                  strokeWidth={1.5}
                />
                <LeadBadge mobile />
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen((o) => !o)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-black/20 text-black"
            aria-label={isMobileNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileNavOpen}
          >
            {isMobileNavOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
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

      <div className="flex mx-auto lg:min-h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 flex w-64 flex-col overflow-y-auto bg-white border-r border-gray-200 transition-transform duration-200 rounded-none lg:sticky lg:top-0 lg:h-[100svh] lg:w-[56px] lg:translate-x-0",
            isMobileNavOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {/* Brand NOT is use */}
          {/* <div className="shrink-0 border-b border-gray-200 px-4 py-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
                Consentz Portal
              </p>

              {plan && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border",
                    plan === "subscription" &&
                      "border-cyan-300 bg-cyan-50 text-cyan-700",
                    plan === "pay_per_lead" &&
                      "border-violet-300 bg-violet-50 text-violet-700",
                    plan === "free" &&
                      "border-gray-200 bg-gray-50 text-gray-600",
                  )}
                >
                  {plan === "subscription"
                    ? "Sub"
                    : plan === "pay_per_lead"
                      ? "PPL"
                      : "Free"}
                </span>
              )}
            </div>

            <p className="mt-1 text-sm font-medium text-gray-900 truncate">
              {entityName || "My Portal"}
            </p>
          </div> */}

          {/* Nav */}
          <nav className="min-h-0 flex-1 px-0 py-3">
            <div className="font-medium text-xl">
              <img
                src="/directory/images/logo-sm.jpg"
                alt="Logo"
                className="rounded-full m-auto mb-[30px] w-[40px] md:w-[40px] h-auto cursor-pointer"
              />
            </div>
            <ul className="space-y-0.5">
              {baseNav.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <li
                    key={href}
                    className="group relative flex items-center lg:h-11 lg:w-14 lg:justify-center my-2"
                  >
                    <Link
                      href={href}
                      onClick={() => setIsMobileNavOpen(false)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:h-11 lg:w-11 lg:justify-center lg:gap-0 lg:px-0 lg:py-0",
                        active
                          ? "bg-[#f3f3f3] text-gray-900"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      )}
                    >
                      <Icon strokeWidth={1.5} className="w-6 h-6 shrink-0" />
                      <span className="lg:hidden">{label}</span>
                    </Link>
                    <span className="hidden lg:block pointer-events-none invisible absolute left-full top-1/2 z-50 -translate-y-1/2 scale-95 whitespace-nowrap rounded bg-black p-2 text-sm text-white opacity-0 transition-all duration-[0.4s] group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                      {label}
                    </span>
                  </li>
                );
              })}

              {entityType === "clinic" && (
                <>
                  <li className="group relative flex items-center lg:h-11 lg:w-14 lg:justify-center my-2">
                    <Link
                      href="/portal/clinic/prospects"
                      onClick={() => setIsMobileNavOpen(false)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:h-11 lg:w-11 lg:justify-center lg:gap-0 lg:px-0 lg:py-0",
                        pathname.startsWith("/portal/clinic/prospects")
                          ? "bg-[#f3f3f3] text-gray-900"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      )}
                    >
                      <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center">
                        <Inbox className="h-6 w-6" />
                        <span className="absolute -top-1 -right-1">
                          <LeadBadge />
                        </span>
                      </span>
                      <span className="lg:hidden">Prospects</span>
                    </Link>
                    <span className="hidden lg:block pointer-events-none invisible absolute left-full top-1/2 z-50 -translate-y-1/2 scale-95 whitespace-nowrap rounded bg-black p-2 text-sm text-white opacity-0 transition-all duration-[0.4s] group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                      Prospects
                    </span>
                  </li>

                  {plan === "free" ? (
                    <li className="group relative flex items-center lg:h-11 lg:w-14 lg:justify-center my-2">
                      <Link
                        href="/portal/clinic/calendar"
                        onClick={() => setIsMobileNavOpen(false)}
                        className="flex w-full cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 lg:h-11 lg:w-11 lg:justify-center lg:gap-0 lg:px-0 lg:py-0"
                        title="Upgrade to access Calendar"
                      >
                        <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center">
                          <CalendarDays className="h-6 w-6" />
                          <Lock className="absolute -bottom-1 -right-1 h-3 w-3 shrink-0" />
                        </span>
                        <span className="lg:hidden">Calendar</span>
                      </Link>
                      <span className="hidden lg:block pointer-events-none invisible absolute left-full top-1/2 z-50 -translate-y-1/2 scale-95 whitespace-nowrap rounded bg-black p-2 text-sm text-white opacity-0 transition-all duration-[0.4s] group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                        Calendar
                      </span>
                    </li>
                  ) : (
                    <li className="group relative flex items-center lg:h-11 lg:w-14 lg:justify-center my-2">
                      <Link
                        href="/portal/clinic/calendar"
                        onClick={() => setIsMobileNavOpen(false)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:h-11 lg:w-11 lg:justify-center lg:gap-0 lg:px-0 lg:py-0",
                          pathname.startsWith("/portal/clinic/calendar")
                            ? "bg-[#f3f3f3] text-gray-900"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                        )}
                      >
                        <CalendarDays strokeWidth={1.5} className="w-6 h-6 shrink-0" />
                        <span className="lg:hidden">Calendar</span>
                      </Link>
                      <span className="hidden lg:block pointer-events-none invisible absolute left-full top-1/2 z-50 -translate-y-1/2 scale-95 whitespace-nowrap rounded bg-black p-2 text-sm text-white opacity-0 transition-all duration-[0.4s] group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                        Calendar
                      </span>
                    </li>
                  )}

                  <li className="group relative flex items-center lg:h-11 lg:w-14 lg:justify-center my-2">
                    <Link
                      href="/portal/clinic/chat"
                      onClick={() => setIsMobileNavOpen(false)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:h-11 lg:w-11 lg:justify-center lg:gap-0 lg:px-0 lg:py-0",
                        pathname.startsWith("/portal/clinic/chat")
                          ? "bg-[#f3f3f3] text-gray-900"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      )}
                    >
                      <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center">
                        <MessageSquare className="h-6 w-6" />
                        <span className="absolute -top-1 -right-1">
                          <ChatBadge />
                        </span>
                      </span>
                      <span className="lg:hidden">Chat</span>
                    </Link>
                    <span className="hidden lg:block pointer-events-none invisible absolute left-full top-1/2 z-50 -translate-y-1/2 scale-95 whitespace-nowrap rounded bg-black p-2 text-sm text-white opacity-0 transition-all duration-[0.4s] group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                      Chat
                    </span>
                  </li>

                  {hasCoreClinic ? (
                    <li className="group relative flex items-center lg:h-11 lg:w-14 lg:justify-center my-2">
                      <Link
                        href="/portal/practitioner/events"
                        onClick={() => setIsMobileNavOpen(false)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:h-11 lg:w-11 lg:justify-center lg:gap-0 lg:px-0 lg:py-0",
                          pathname.startsWith("/portal/practitioner/events")
                            ? "bg-[#f3f3f3] text-gray-900"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                        )}
                      >
                        <CalendarCheck strokeWidth={1.5} className="w-6 h-6 shrink-0" />
                        <span className="lg:hidden">My Events</span>
                      </Link>
                      <span className="hidden lg:block pointer-events-none invisible absolute left-full top-1/2 z-50 -translate-y-1/2 scale-95 whitespace-nowrap rounded bg-black p-2 text-sm text-white opacity-0 transition-all duration-[0.4s] group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                        My Events
                      </span>
                    </li>
                  ) : (
                    <li className="group relative flex items-center lg:h-11 lg:w-14 lg:justify-center my-2">
                      <span
                        className="flex w-full cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 lg:h-11 lg:w-11 lg:justify-center lg:gap-0 lg:px-0 lg:py-0"
                        title="Link your Consentz Core clinic to unlock Events"
                      >
                        <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center">
                          <CalendarCheck className="h-6 w-6" />
                          <Lock className="absolute -bottom-1 -right-1 h-3 w-3 shrink-0" />
                        </span>
                        <span className="lg:hidden">My Events</span>
                      </span>
                      <span className="hidden lg:block pointer-events-none invisible absolute left-full top-1/2 z-50 -translate-y-1/2 scale-95 whitespace-nowrap rounded bg-black p-2 text-sm text-white opacity-0 transition-all duration-[0.4s] group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                        Link Core to unlock Events
                      </span>
                    </li>
                  )}

                  <li className="group relative flex items-center lg:h-11 lg:w-14 lg:justify-center my-2">
                    <Link
                      href="/portal/practitioner/earnings"
                      onClick={() => setIsMobileNavOpen(false)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:h-11 lg:w-11 lg:justify-center lg:gap-0 lg:px-0 lg:py-0",
                        pathname.startsWith("/portal/practitioner/earnings")
                          ? "bg-[#f3f3f3] text-gray-900"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      )}
                    >
                      <PoundSterling strokeWidth={1.5} className="w-6 h-6 shrink-0" />
                      <span className="lg:hidden">Earnings</span>
                    </Link>
                    <span className="hidden lg:block pointer-events-none invisible absolute left-full top-1/2 z-50 -translate-y-1/2 scale-95 whitespace-nowrap rounded bg-black p-2 text-sm text-white opacity-0 transition-all duration-[0.4s] group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                      Earnings
                    </span>
                  </li>

                  <li className="group relative flex items-center lg:h-11 lg:w-14 lg:justify-center my-2">
                    <Link
                      href="/portal/clinic/schedule"
                      onClick={() => setIsMobileNavOpen(false)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:h-11 lg:w-11 lg:justify-center lg:gap-0 lg:px-0 lg:py-0",
                        pathname.startsWith("/portal/clinic/schedule")
                          ? "bg-[#f3f3f3] text-gray-900"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      )}
                    >
                      <Clock strokeWidth={1.5} className="w-6 h-6 shrink-0" />
                      <span className="lg:hidden">Schedule</span>
                    </Link>
                    <span className="hidden lg:block pointer-events-none invisible absolute left-full top-1/2 z-50 -translate-y-1/2 scale-95 whitespace-nowrap rounded bg-black p-2 text-sm text-white opacity-0 transition-all duration-[0.4s] group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                      Schedule
                    </span>
                  </li>
                </>
              )}

              {entityType === "practitioner" && (
                <>
                  {hasCoreClinic ? (
                    <li className="group relative flex items-center lg:h-11 lg:w-14 lg:justify-center my-2">
                      <Link
                        href="/portal/practitioner/events"
                        onClick={() => setIsMobileNavOpen(false)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:h-11 lg:w-11 lg:justify-center lg:gap-0 lg:px-0 lg:py-0",
                          pathname.startsWith("/portal/practitioner/events")
                            ? "bg-[#f3f3f3] text-gray-900"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                        )}
                      >
                        <CalendarCheck strokeWidth={1.5} className="w-6 h-6 shrink-0" />
                        <span className="lg:hidden">My Events</span>
                      </Link>
                      <span className="hidden lg:block pointer-events-none invisible absolute left-full top-1/2 z-50 -translate-y-1/2 scale-95 whitespace-nowrap rounded bg-black p-2 text-sm text-white opacity-0 transition-all duration-[0.4s] group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                        My Events
                      </span>
                    </li>
                  ) : (
                    <li className="group relative flex items-center lg:h-11 lg:w-14 lg:justify-center my-2">
                      <span
                        className="flex w-full cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 lg:h-11 lg:w-11 lg:justify-center lg:gap-0 lg:px-0 lg:py-0"
                        title="Link your Consentz Core clinic to unlock Events"
                      >
                        <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center">
                          <CalendarCheck className="h-6 w-6" />
                          <Lock className="absolute -bottom-1 -right-1 h-3 w-3 shrink-0" />
                        </span>
                        <span className="lg:hidden">My Events</span>
                      </span>
                      <span className="hidden lg:block pointer-events-none invisible absolute left-full top-1/2 z-50 -translate-y-1/2 scale-95 whitespace-nowrap rounded bg-black p-2 text-sm text-white opacity-0 transition-all duration-[0.4s] group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                        Link Core to unlock Events
                      </span>
                    </li>
                  )}

                  <li className="group relative flex items-center lg:h-11 lg:w-14 lg:justify-center my-2">
                    <Link
                      href="/portal/practitioner/earnings"
                      onClick={() => setIsMobileNavOpen(false)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:h-11 lg:w-11 lg:justify-center lg:gap-0 lg:px-0 lg:py-0",
                        pathname.startsWith("/portal/practitioner/earnings")
                          ? "bg-[#f3f3f3] text-gray-900"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      )}
                    >
                      <PoundSterling strokeWidth={1.5} className="w-6 h-6 shrink-0" />
                      <span className="lg:hidden">Earnings</span>
                    </Link>
                    <span className="hidden lg:block pointer-events-none invisible absolute left-full top-1/2 z-50 -translate-y-1/2 scale-95 whitespace-nowrap rounded bg-black p-2 text-sm text-white opacity-0 transition-all duration-[0.4s] group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                      Earnings
                    </span>
                  </li>

                  <li className="group relative flex items-center lg:h-11 lg:w-14 lg:justify-center my-2">
                    <Link
                      href="/portal/practitioner/schedule"
                      onClick={() => setIsMobileNavOpen(false)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:h-11 lg:w-11 lg:justify-center lg:gap-0 lg:px-0 lg:py-0",
                        pathname.startsWith("/portal/practitioner/schedule")
                          ? "bg-[#f3f3f3] text-gray-900"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      )}
                    >
                      <Clock strokeWidth={1.5} className="w-6 h-6 shrink-0" />
                      <span className="lg:hidden">Schedule</span>
                    </Link>
                    <span className="hidden lg:block pointer-events-none invisible absolute left-full top-1/2 z-50 -translate-y-1/2 scale-95 whitespace-nowrap rounded bg-black p-2 text-sm text-white opacity-0 transition-all duration-[0.4s] group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                      Schedule
                    </span>
                  </li>
                </>
              )}

              <li className="group relative flex items-center lg:h-11 lg:w-14 lg:justify-center my-2">
                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:h-11 lg:w-11 lg:justify-center lg:gap-0 lg:px-0 lg:py-0"
                >
                  <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center">
                    <Globe strokeWidth={1.5} className="h-6 w-6" />
                    <ExternalLink className="absolute -bottom-1 -right-1 h-3 w-3 opacity-80" />
                  </span>
                  <span className="lg:hidden">View Directory</span>
                </Link>
                <span className="hidden lg:block pointer-events-none invisible absolute left-full top-1/2 z-50 -translate-y-1/2 scale-95 whitespace-nowrap rounded bg-black p-2 text-sm text-white opacity-0 transition-all duration-[0.4s] group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                  View Directory
                </span>
              </li>

              <li className="group relative flex items-center lg:h-11 lg:w-14 lg:justify-center my-2">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600 lg:h-11 lg:w-11 lg:justify-center lg:gap-0 lg:px-0 lg:py-0"
                >
                  <LogOut className="h-6 w-6 shrink-0" />
                  <span className="lg:hidden">Sign out</span>
                </button>
                <span className="hidden lg:block pointer-events-none invisible absolute left-full top-1/2 z-50 -translate-y-1/2 scale-95 whitespace-nowrap rounded bg-black p-2 text-sm text-white opacity-0 transition-all duration-[0.4s] group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                  Sign out
                </span>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1 flex flex-col">
          <div className="hidden items-center justify-between gap-1 bg-[var(--primary-bg-color)] px-6 py-2.5 shadow-[0_0_2px_0_rgba(0,0,0,0.2)] lg:flex">
            <div className="shrink-0">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
                  Consentz Portal
                </p>

                {plan && (
                  <span
                    className={cn(
                      "rounded-full ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border",
                      plan === "subscription" &&
                        "border-cyan-300 bg-cyan-50 text-cyan-700",
                      plan === "pay_per_lead" &&
                        "border-violet-300 bg-violet-50 text-violet-700",
                      plan === "free" &&
                        "border-gray-200 bg-gray-50 text-gray-600",
                    )}
                  >
                    {plan === "subscription"
                      ? "Sub"
                      : plan === "pay_per_lead"
                        ? "PPL"
                        : "Free"}
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm font-medium text-gray-900 truncate">
                {entityName || "My Portal"}
              </p>
            </div>
            <div className="flex">
              {entityType === "clinic" && (
                <>
                  <HeaderIconLink
                    href="/portal/clinic/calendar"
                    label="Calendar"
                    icon={CalendarClock}
                    locked={plan === "free"}
                  />
                  <HeaderIconLink
                    href="/portal/clinic/prospects"
                    label="Prospects"
                    icon={Presentation}
                    badge={<LeadBadge mobile />}
                  />
                  <HeaderIconLink
                    href="/portal/clinic/chat"
                    label="Messages"
                    icon={MessageSquareText}
                    badge={<ChatBadge mobile />}
                  />
                </>
              )}
              <HeaderProfileMenu
                name={entityName || "My Portal"}
                onLogout={handleLogout}
              />
            </div>
          </div>
          <div className="flex-1 p-10 flex flex-col">
            <main className="flex-1 px-4 pt-0 pb-0">{children}</main>
          </div>
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
  );
}
