"use client";

import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

type BlogLink = {
  title: string;
  href: string;
};

const baseGuides: BlogLink[] = [
  {
    title: "Aesthetic Clinic Marketing: Complete Guide [2025]",
    href: "https://www.consentz.com/aesthetic-clinic-marketing",
  },
  {
    title: "10 Best HIPAA Compliant Medical Spa Software in 2025",
    href: "https://www.consentz.com/hipaa-compliant-medical-spa-software",
  },
  {
    title: "Top 10 Clinical Data Management Software Solutions in the USA",
    href: "https://www.consentz.com/clinical-data-management-software",
  },
];

export function RelevantBlogGuides() {
  const pathname = usePathname();
  const normalized = pathname.replace(/\/$/, "");
  const pathNoBase = normalized.startsWith("/directory")
    ? normalized.slice("/directory".length) || "/"
    : normalized || "/";
  const links = baseGuides;

  return (
    <section className="max-w-5xl mx-auto px-4 pb-16">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">
        Relevant blog guides
      </h2>
      <div className="grid gap-3 md:grid-cols-3">
        {links.map((blog) => (
          <a
            key={blog.href}
            href={blog.href}
            target="_blank"
            rel="noreferrer"
            className="block"
          >
            <Card className="h-full bg-white transition-colors hover:bg-neutral-50 border-neutral-200">
              <CardContent className="py-4 text-sm font-medium text-neutral-900">
                {blog.title}
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
      <div className="mt-4">
        <a
          href="https://www.consentz.com/blog/"
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-neutral-700 hover:text-neutral-900 underline"
        >
          View all blog posts
        </a>
      </div>
    </section>
  );
}
