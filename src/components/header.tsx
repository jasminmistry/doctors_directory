"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchBar } from "@/components/search/search-bar";
import { b2bBookDemoHref } from "@/lib/b2b-hub/seo";

type PatientInfo = { firstName: string; lastName: string; email: string };
type PortalInfo = {
  entityType: "clinic" | "practitioner";
  entityName: string;
  claimerEmail: string;
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [patient, setPatient] = useState<PatientInfo | null | undefined>(
    undefined,
  );
  const [portalUser, setPortalUser] = useState<PortalInfo | null | undefined>(
    undefined,
  );
  const pathname = usePathname();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountMenuOpen]);

  async function signOut() {
    setPatient(null);
    await fetch("/directory/api/patient/auth/logout/", { method: "POST" }).catch(
      () => {},
    );
    window.location.replace("/directory");
  }

  async function portalSignOut() {
    setPortalUser(null);
    await fetch("/directory/api/auth/logout/", { method: "POST" }).catch(
      () => {},
    );
    window.location.replace("/directory");
  }

  useEffect(() => {
    fetch("/directory/api/patient/me/", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setPatient(data))
      .catch(() => setPatient(null));
    fetch("/directory/api/portal/me/", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setPortalUser(data))
      .catch(() => setPortalUser(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
  }, [menuOpen]);

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://staging.consentz.com";
  const marketingBaseUrl =
    process.env.NEXT_PUBLIC_MARKETING_BASE_URL || "https://www.consentz.com";
  const bookDemoHref = b2bBookDemoHref();

  const normalizedPath = pathname.replace(/\/$/, "") || "/";
  const pathWithoutDirectoryBase = normalizedPath.startsWith("/directory")
    ? normalizedPath.slice("/directory".length) || "/"
    : normalizedPath;
  const isBusinessHub =
    pathWithoutDirectoryBase === "/business" ||
    pathWithoutDirectoryBase.startsWith("/business/");
  
  const hideSearchPages = [ 
    "/features/the-consentz-academy",
    "/features/healthcare-marketing-software",
    "/features/stock-and-billing",
    "/features/analytics",
    "/features/personalise",
    "/features/photos-records",
    "/features/clinic-management-software",
  ];

  const showSearch =
  normalizedPath !== "/" &&
  !hideSearchPages.includes(normalizedPath) &&
  !normalizedPath.startsWith("/admin") &&
  !normalizedPath.startsWith("/portal") &&
  !normalizedPath.startsWith("/account") &&
  !normalizedPath.includes("/search") &&
  normalizedPath !== "/clinics" &&
  normalizedPath !== "/practitioners" &&
  normalizedPath !== "/products" &&
  normalizedPath !== "/treatments" &&
  !normalizedPath.startsWith("/accredited") &&
  !isBusinessHub;

  return (
    <header className="bg-[var(--primary-bg-color)] sticky top-0 z-40 border border-b-[#e0e0e0]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-start md:justify-between">
        <div className="font-medium text-xl">
          <Link
            href="/"
            className="inline-block cursor-pointer"
            aria-label="Go to directory home"
          >
            <img
              src="/directory/images/Consentz Logo.webp"
              alt="Logo"
              className="w-[120px] md:w-[180px] h-auto cursor-pointer"
            />
          </Link>
        </div>

        <div className="nav-drop hidden md:flex gap-8 items-center w-full justify-between">
          <nav className="flex gap-8 items-center mx-auto">
            <a
              href={`${baseUrl}/directory`}
              className="font-medium hover:text-black uppercase"
            >
              Home
            </a>
            <div className="relative group">
              <button
                type="button"
                className="font-medium hover:text-black flex items-center gap-1 uppercase"
                aria-haspopup="true"
              >
                Features
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link
                  href="/features/clinic-management-software"
                  className="block px-4 py-3 text-sm font-normal hover:bg-gray-50 border-t border-gray-100 rounded-t-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  Clinic Management Software
                </Link>
                <Link
                  href="/features/photos-records"
                  className="block px-4 py-3 text-sm font-normal hover:bg-gray-50 border-t border-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Photos Records
                </Link>
                <Link
                  href="/features/personalise"
                  className="block px-4 py-3 text-sm font-normal hover:bg-gray-50 border-t border-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Personalise
                </Link>
                <Link
                  href="/features/analytics"
                  className="block px-4 py-3 text-sm font-normal hover:bg-gray-50 border-t border-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Analytics
                </Link>
                <Link
                  href="/features/stock-and-billing"
                  className="block px-4 py-3 text-sm font-normal hover:bg-gray-50 border-t border-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Stock And Billing
                </Link> 
                <Link
                  href="/features/healthcare-marketing-software"
                  className="block px-4 py-3 text-sm font-normal hover:bg-gray-50 border-t border-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Healthcare Marketing Software
                </Link>
                <Link
                  href="/features/the-consentz-academy"
                  className="block px-4 py-3 text-sm font-normal hover:bg-gray-50 border-t border-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  The Consentz Academy
                </Link>
                <a
                  href={`${marketingBaseUrl}/hipaa-compliant-medical-spa-software/`}
                  className="block px-4 py-3 text-sm font-normal hover:bg-gray-50 border-t border-gray-100 rounded-b-lg"
                >
                  HIPAA Compliant Medical Spa Software
                </a>
              </div>
            </div>
            <a
              href={`${marketingBaseUrl}/blog`}
              className="font-medium hover:text-black uppercase"
            >
              Blog
            </a>
            {/* <a href={`${marketingBaseUrl}/faqs`} className="font-medium hover:text-black">
              Faq's
            </a> */}
            <div className="relative group">
              <button
                type="button"
                className="font-medium hover:text-black flex items-center gap-1 uppercase"
              >
                List Your Practice
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link
                  href="/register/clinic"
                  className="block px-4 py-3 text-sm font-normal hover:bg-gray-50 rounded-t-lg"
                >
                  Register a Clinic
                </Link>
                <Link
                  href="/register/practitioner"
                  className="block px-4 py-3 text-sm font-normal hover:bg-gray-50 rounded-b-lg border-t border-gray-100"
                >
                  Register as a Practitioner
                </Link>
              </div>
            </div>
          </nav>
          {patient ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={accountMenuOpen}
                className="font-medium rounded-lg border-1 py-2 px-5 border-black bg-transparent text-black hover:bg-black hover:text-white flex items-center gap-1"
              >
                {patient.firstName || patient.email}
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {accountMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg transition-all z-50">
                  <Link
                    href="/account"
                    onClick={() => setAccountMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-medium hover:bg-gray-50 rounded-t-lg"
                  >
                    My Account
                  </Link>
                  <Link
                    href="/account/bookings"
                    onClick={() => setAccountMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-medium hover:bg-gray-50 border-t border-gray-100"
                  >
                    Bookings
                  </Link>
                  <Link
                    href="/account/chats"
                    onClick={() => setAccountMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-medium hover:bg-gray-50 border-t border-gray-100"
                  >
                    Chats
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      signOut();
                    }}
                    className="block w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 border-t border-gray-100 rounded-b-lg text-red-600"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : portalUser ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={accountMenuOpen}
                className="font-medium rounded-lg border-1 py-2 px-5 border-black bg-transparent text-black hover:bg-black hover:text-white flex items-center gap-1"
              >
                {portalUser.entityName}
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {accountMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg transition-all z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs text-black capitalize">
                      {portalUser.entityType} portal
                    </p>
                  </div>
                  <Link
                    href="/portal/clinic"
                    onClick={() => setAccountMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-medium hover:bg-gray-50 rounded-t-lg"
                  >
                    My Portal
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      portalSignOut();
                    }}
                    className="block w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 border-t border-gray-100 rounded-b-lg text-red-600"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={accountMenuOpen}
                className="font-medium rounded-lg border-1 py-2 px-5 border-black bg-transparent text-black hover:bg-black caplized hover:text-white flex items-center gap-1"
              >
                Log In
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {accountMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg transition-all z-50">
                  <Link
                    href="/account/login"
                    onClick={() => setAccountMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-normal hover:bg-gray-50 rounded-t-lg"
                  >
                    Patient
                  </Link>
                  <Link
                    href="/portal/login"
                    onClick={() => setAccountMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-normal hover:bg-gray-50 border-t border-gray-100 rounded-b-lg"
                  >
                    Clinic / Practitioner
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="md:hidden">
          <button
            className="absolute top-1 right-2 mt-2 ml-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg
                className="w-8 h-8 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="bg-white px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <SearchBar />
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="md:hidden px-6 py-4">
          <nav className="flex flex-col gap-4">
            <button
              type="button"
              className="text-left font-medium hover:text-black"
            >
              HOME
            </button>
            <div className="border-t border-gray-400 pt-3 flex flex-col gap-2">
              <p className="text-left font-medium uppercase hover:text-black">
                Features
              </p>
              
                <Link
                  href="/features/clinic-management-software"
                  className="text-sm font-medium hover:text-black"
                  onClick={() => setMenuOpen(false)}
                >
                  Clinic Management Software
                </Link>
                <Link
                  href="/features/photos-records"
                  className="text-sm font-medium hover:text-black"
                  onClick={() => setMenuOpen(false)}
                >
                  Photos Records
                </Link>
                <Link
                  href="/features/personalise"
                  className="text-sm font-medium hover:text-black"
                  onClick={() => setMenuOpen(false)}
                >
                  Personalise
                </Link>
                <Link
                  href="/features/analytics"
                  className="text-sm font-medium hover:text-black"
                  onClick={() => setMenuOpen(false)}
                >
                  Analytics
                </Link>
                <Link
                  href="/features/stock-and-billing"
                  className="text-sm font-medium hover:text-black"
                  onClick={() => setMenuOpen(false)}
                >
                  Stock And Billing
                </Link> 
                <Link
                  href="/features/healthcare-marketing-software"
                  className="text-sm font-medium hover:text-black"
                  onClick={() => setMenuOpen(false)}
                >
                  Healthcare Marketing Software
                </Link>
                <Link
                  href="/features/the-consentz-academy"
                  className="text-sm font-medium hover:text-black"
                  onClick={() => setMenuOpen(false)}
                >
                  The Consentz Academy
                </Link>
                <a
                  href={`${marketingBaseUrl}/hipaa-compliant-medical-spa-software/`}
                  className="text-sm font-medium hover:text-black"
                >
                  HIPAA Compliant Medical Spa Software
                </a>
           
            </div>
            <div className="border-t border-gray-400 pt-3 flex flex-col gap-2 mt-4">
              <a
                href={`${marketingBaseUrl}/blog`}
                className="text-left font-medium hover:text-black"
                onClick={() => setMenuOpen(false)}
              >
                BLOG
              </a>
            </div>
            <div className="border-t border-gray-400 pt-3 flex flex-col gap-2">
              <p className="text-left font-medium uppercase hover:text-black">
                List Your Practice
              </p>
              <Link
                href="/register/clinic"
                className="text-sm font-medium hover:text-black"
                onClick={() => setMenuOpen(false)}
              >
                Register a Clinic
              </Link>
              <Link
                href="/register/practitioner"
                className="text-sm font-medium hover:text-black"
                onClick={() => setMenuOpen(false)}
              >
                Register as a Practitioner
              </Link>
            </div>
          </nav>
          {patient ? (
            <div className="border-t border-gray-400 pt-3 flex flex-col gap-2 mt-4">
              <span className="text-sm font-semibold text-black">
                {patient.firstName || patient.email}
              </span>
              <Link
                href="/account"
                className="text-sm font-medium hover:text-black"
                onClick={() => setMenuOpen(false)}
              >
                My Account
              </Link>
              <Link
                href="/account/bookings"
                className="text-sm font-medium hover:text-black"
                onClick={() => setMenuOpen(false)}
              >
                Bookings
              </Link>
              <Link
                href="/account/chats"
                className="text-sm font-medium hover:text-black"
                onClick={() => setMenuOpen(false)}
              >
                Chats
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
                className="text-sm font-medium text-red-600 hover:text-red-800 text-left"
              >
                Sign out
              </button>
            </div>
          ) : portalUser ? (
            <div className="border-t border-gray-400 pt-3 flex flex-col gap-2 mt-4">
              <span className="text-left uppercase font-medium hover:text-black">
                {portalUser.entityName}
              </span>
              <span className="text-sm font-medium hover:text-black capitalize">
                {portalUser.entityType} portal
              </span>
              <Link
                href="/portal/clinic"
                className="text-sm font-medium hover:text-black"
                onClick={() => setMenuOpen(false)}
              >
                My Portal
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  portalSignOut();
                }}
                className="text-sm font-medium text-red-600 hover:text-red-800 text-left"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="mt-4 border-t border-gray-100 pt-3 flex flex-col gap-2">
              <p className="text-left font-medium hover:text-black">
                Log In
              </p>
              <Link
                href="/account/login"
                className="text-sm font-medium hover:text-black"
                onClick={() => setMenuOpen(false)}
              >
                Patient
              </Link>
              <Link
                href="/portal/login"
                className="text-sm font-medium hover:text-black"
                onClick={() => setMenuOpen(false)}
              >
                Clinic / Practitioner
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
