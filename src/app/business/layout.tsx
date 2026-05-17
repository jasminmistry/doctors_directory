import type React from "react";
import { Playfair_Display } from "next/font/google";
import { HubChrome } from "@/components/b2b-hub/hub-chrome";
import { HubLayoutBlogSlot } from "@/components/b2b-hub/hub-layout-blog-slot";
import { HubProductSchema } from "@/components/b2b-hub/hub-product-schema";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-playfair",
  adjustFontFallback: false,
});

export default function BusinessLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${playfair.variable} min-h-[60vh] bg-white`}>
      <HubProductSchema />
      <HubChrome />
      {children}
      <HubLayoutBlogSlot />
    </div>
  );
}
