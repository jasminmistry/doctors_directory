import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import Script from "next/script";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { CtaClickTracker } from "@/components/tracking/cta-click-tracker";

import "./globals.css";

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-QTXQ1H7HG2";

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
  return (
    <html lang="en" className="root">
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "t3kivscorp");
          `}
        </Script>
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-base`}
        
      >
        <div className="overflow-hidden">
          <Header />
          <Suspense fallback={null}>{children}</Suspense>
          <Footer />
          <Toaster position="top-right" richColors className="site-toaster" />
          <ScrollToTop />
          <CtaClickTracker />
          <Analytics />
        </div>
      </body>
    </html>
  );
}
