import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AdminRootShell } from "@/components/admin/admin-root-shell";
import { ConsentScripts } from "@/components/cookie-consent/consent-scripts";
import { SearchAtlasScript } from "@/components/search-atlas-script";
import { readCookieConsentFromRequest } from "@/lib/cookie-consent-server";

import "./globals.css";

export const metadata: Metadata = {
  title: "Aesthetic Directory - List Your Clinic & Grow Your Practice",
  description:
    "Join the premier Aesthetic Directory. Increase your visibility, showcase your treatments, and connect with high-quality leads looking for aesthetic services.",

  robots: {
    index: true,
    follow: true,
    nocache: false,
    "max-snippet": -1,
    "max-video-preview": -1,
    "max-image-preview": "large",
  },

};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialConsent = await readCookieConsentFromRequest();

  return (
    <html lang="en" className="root">
      <head>
        <ConsentScripts initialConsent={initialConsent} />
        <SearchAtlasScript />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-base`}
        
      >
        <AdminRootShell>
          {children}
        </AdminRootShell>
      </body>
    </html>
  );
}
