"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search/search-bar";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
  }, [menuOpen]);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://staging.consentz.com';

  const normalizedPath = pathname.replace(/\/$/, "") || "/";
  const showSearch =
    normalizedPath !== "/" &&
    !normalizedPath.startsWith("/admin") &&
    !normalizedPath.includes("/search") &&
    normalizedPath !== "/clinics" &&
    normalizedPath !== "/practitioners" &&
    normalizedPath !== "/products" &&
    normalizedPath !== "/treatments" &&
    !normalizedPath.startsWith("/accredited");

  return (
    <header className="bg-[var(--primary-bg-color)] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center md:justify-between">
        <div className="font-bold text-xl">
          <Link href="/" className="inline-block cursor-pointer" aria-label="Go to directory home">
            <img
              src="/directory/images/Consentz Logo.webp"
              alt="Logo"
              width={180}
              className="cursor-pointer"
            />
          </Link>
        </div>

        <div className="nav-drop hidden md:flex gap-8 items-center w-full justify-between">
          <nav className="flex gap-8 items-center mx-auto">
            <a href={`${baseUrl}/directory`} className="font-medium hover:text-black">
              HOME
            </a>
            <a href={`${baseUrl}/features`} className="font-medium hover:text-black">
              FEATURES
            </a>
            <a href={`${baseUrl}/blog`} className="font-medium hover:text-black">
              BLOG
            </a>
            <a href={`${baseUrl}/faqs`} className="font-medium hover:text-black">
              FAQS
            </a>
            <div className="relative group">
              <button type="button" className="font-medium hover:text-black flex items-center gap-1">
                LIST YOUR PRACTICE
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link href="/register/clinic" className="block px-4 py-3 text-sm font-medium hover:bg-gray-50 rounded-t-lg">
                  Register a Clinic
                </Link>
                <Link href="/register/practitioner" className="block px-4 py-3 text-sm font-medium hover:bg-gray-50 rounded-b-lg border-t border-gray-100">
                  Register as a Practitioner
                </Link>
              </div>
            </div>
          </nav>
          <a
            href={`${baseUrl}/book-demo`}
            className="font-bold rounded-lg border-2 py-2 px-5 w-auto h-auto border-black bg-transparent text-black hover:bg-black hover:text-white"
          >
            BOOK DEMO
          </a>
        </div>

        <div className="md:hidden">
          <button
            className="absolute top-4 left-2 mt-2 ml-1"
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
                  strokeWidth={2}
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
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="border-t border-gray-200 px-6 py-3">
          <div className="max-w-6xl mx-auto">
            <SearchBar />
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="md:hidden px-6 py-4">
          <nav className="flex flex-col gap-4">
            <button type="button" className="text-left font-bold hover:text-black">
              HOME
            </button>
            <button type="button" className="text-left font-bold hover:text-black">
              FEATURES
            </button>
            <button type="button" className="text-left font-bold hover:text-black">
              BLOG
            </button>
            <button type="button" className="text-left font-bold hover:text-black">
              FAQS
            </button>
            <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">List Your Practice</p>
              <Link href="/register/clinic" className="text-sm font-medium hover:text-black" onClick={() => setMenuOpen(false)}>
                Register a Clinic
              </Link>
              <Link href="/register/practitioner" className="text-sm font-medium hover:text-black" onClick={() => setMenuOpen(false)}>
                Register as a Practitioner
              </Link>
            </div>
          </nav>
          <Button className="mt-4 font-bold border-2 py-3 px-6 w-auto h-auto border-black bg-transparent text-black hover:bg-black hover:text-white">
            BOOK DEMO
          </Button>
        </div>
      )}
    </header>
  );
}
