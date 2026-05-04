import type React from "react";
import { HubChrome } from "@/components/b2b-hub/hub-chrome";

export default function BusinessLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-[60vh] bg-white">
      <HubChrome />
      {children}
    </div>
  );
}
