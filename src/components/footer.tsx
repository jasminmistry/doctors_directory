"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { HUB_CTA_FOOTER_LIGHT_CLASS } from "@/components/b2b-hub/hub-cta-buttons";
import { cn } from "@/lib/utils";
import { b2bBookDemoHref } from "@/lib/b2b-hub/seo";

const FOOTER_COLUMN_HEADING =
  "font-bold text-[22px] leading-7 text-[#F3F4F6] font-inter mb-5";
const FOOTER_WP_LINK =
  "text-left w-full hover:text-white transition text-base font-semibold leading-6";
const FOOTER_DIRECTORY_LINK =
  "block text-base font-semibold leading-6 hover:text-white transition";

const CONSENTZ_SOCIAL = {
  linkedin: "https://www.linkedin.com/company/consentz",
  facebook: "https://www.facebook.com/Consentz",
  instagram: "https://www.instagram.com/consentz/",
} as const;

const CONSENTZ_VS_LINKS = [
  ["Zenoti", "/zenoti-alternative/"],
  ["AestheticsPro", "/aestheticspro-alternatives/"],
  ["Pabau", "/pabau-alternatives/"],
  ["Aesthetic Record", "/aesthetic-record-alternatives/"],
  ["Clinicsense", "/consentz-vs-clinicsense/"],
  ["Nextech", "/consentz-vs-nextech/"],
  ["Vagaro", "/vagaro-alternative/"],
  ["GlowdayPRO", "/glowdaypro-alternative/"],
  ["PatientNow", "/patientnow-alternative/"],
  ["Mangomint", "/mangomint-alternative/"],
  ["Boulevard", "/boulevard-alternative/"],
] as const;

const FEATURES_PRODUCT_LINKS = [
  ["Clinic Management", "/clinic-management-software/"],
  ["Patient Engagement", "/what-is-patient-management-software/"],
  ["Photos and Records", "/photos-records/"],
  ["Personalise", "/personalise/"],
  ["Analytics", "/analytics/"],
  ["Stock and Billing", "/stock-and-billing/"],
] as const;

const FEATURES_MARKETING_LINKS = [
  ["Marketing", "/healthcare-marketing-software/"],
  ["Medical Templates", "/medical-templates/"],
  ["FAQs", "/faqs/"],
  ["Blog", "/blog/"],
  ["Articles", "/category/articles/"],
  ["Support", "mailto:care@consentz.com"],
  ["Terms & Conditions", "/terms/"],
  ["Partners", "/partners/"],
  ["Privacy Policy", "/privacy-policy/"],
  ["Sitemap", "/sitemap"],
] as const;

const CONSENTZ_HUB_LINKS = [
  ["Buyer Hub", "/business/"],
  ["Aesthetic Clinic Software", "/business/software/"],
  ["Templates", "/business/templates/"],
  ["By City", "/business/uk/"],
] as const;

const ACCREDITATIONS = [
  ["cqc", "CQC"],
  ["his", "HIS"],
  ["hiw", "HIW"],
  ["jccp", "JCCP"],
  ["rqia", "RQIA"],
  ["saveface", "Save Face"],
] as const;

function isBusinessHubPath(pathname: string) {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const path = normalized.startsWith("/directory")
    ? normalized.slice("/directory".length) || "/"
    : normalized;
  return path === "/business" || path.startsWith("/business/");
}

function FooterLinkList({
  items,
  baseUrl,
}: {
  items: readonly (readonly [string, string])[];
  baseUrl: string;
}) {
  return (
    <ul className="space-y-3 text-sm">
      {items.map(([label, path]) => (
        <li key={`${label}-${path}`}>
          {path.startsWith("mailto:") ? (
            <a href={path} className={FOOTER_WP_LINK}>
              {label}
            </a>
          ) : path === "/sitemap" || path === "/sitemap/" ? (
            <Link href="/sitemap" className={FOOTER_DIRECTORY_LINK}>
              {label}
            </Link>
          ) : path.startsWith("/directory") ? (
            <Link href={path.replace(/^\/directory/, "") || "/"} className={FOOTER_DIRECTORY_LINK}>
              {label}
            </Link>
          ) : (
            <a
              href={`${baseUrl}${path}`}
              target="_blank"
              rel="noopener noreferrer"
              className={FOOTER_WP_LINK}
            >
              {label}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

function FooterSocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="inline-flex text-white transition-opacity hover:opacity-80"
      >
        {children}
      </a>
    </li>
  );
}

export function Footer() {
  const pathname = usePathname() ?? "";
  const isBusinessHub = isBusinessHubPath(pathname);
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com";
  const bookDemoHref = b2bBookDemoHref();
  const copyrightYear = new Date().getFullYear();

  return (
    <>
      <footer
        className={cn(
          "overflow-visible bg-[var(--dune)] text-white",
          isBusinessHub
            ? "pb-8 pt-[clamp(7.5rem,28vw,10.5rem)] md:pb-16 md:pt-16"
            : "py-8 md:py-16",
        )}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="w-full md:w-auto">
              <section className="mb-2 text-lg font-bold md:text-4xl">
                Are you a Practitioner?
              </section>
              <p>Join over 200+ clinics already growing with Consentz.</p>
            </div>
            <div className="flex w-full justify-start pt-10 md:w-auto md:pt-0">
              <a
                href={bookDemoHref}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  isBusinessHub
                    ? HUB_CTA_FOOTER_LIGHT_CLASS
                    : "inline-flex h-auto items-center justify-center rounded-lg bg-white px-4 py-2 text-base font-semibold text-black transition-colors hover:bg-gray-200 md:px-5 md:py-2 md:text-lg"
                }
              >
                BOOK DEMO
              </a>
            </div>
          </div>

          <div className="my-6 border-t border-white md:my-12" />

          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
            <div>
              <h3 className={FOOTER_COLUMN_HEADING}>Contacts</h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Phone className="h-5 w-5 shrink-0 text-white" aria-hidden />
                  <a href="tel:+442080503372" className={FOOTER_WP_LINK}>
                    (UK) +44 (0) 208 050 3372
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-5 w-5 shrink-0 text-white" aria-hidden />
                  <a href="tel:+16467861949" className={FOOTER_WP_LINK}>
                    (US) +1 646 786 1949
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-5 w-5 shrink-0 text-white" aria-hidden />
                  <a href="mailto:contact@consentz.com" className={FOOTER_WP_LINK}>
                    contact@consentz.com
                  </a>
                </p>
              </div>
            </div>

            <div>
              <h3 className={FOOTER_COLUMN_HEADING}>Consentz vs</h3>
              <FooterLinkList items={CONSENTZ_VS_LINKS} baseUrl={baseUrl} />
            </div>

            <div>
              <h3 className={FOOTER_COLUMN_HEADING}>Features</h3>
              <FooterLinkList items={FEATURES_PRODUCT_LINKS} baseUrl={baseUrl} />
            </div>

            <div>
              <h3 className={FOOTER_COLUMN_HEADING}>Features</h3>
              <FooterLinkList items={FEATURES_MARKETING_LINKS} baseUrl={baseUrl} />
            </div>

            <div>
              <h3 className={FOOTER_COLUMN_HEADING}>Get the app</h3>
              <a
                href="https://apps.apple.com/us/app/consentz/id1292663553"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/directory/images/Consentz Iphone App.webp"
                  alt="Download Consentz on the App Store"
                  width={139}
                />
              </a>
            </div>
          </div>

          <div className="my-6 border-t border-white md:my-8" />

          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
            <div>
              <img
                src="/directory/images/Consentz Logo light.svg"
                alt="Consentz"
                width={180}
                className="mb-6"
              />
              <p className="text-base font-semibold leading-6 text-white">
                Find qualified healthcare and aesthetic practitioners in your
                area. Verified profiles, authentic reviews, and regulatory
                compliance.
              </p>
            </div>

            <div>
              <h3 className={FOOTER_COLUMN_HEADING}>For Practitioners</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/register/clinic" className={FOOTER_DIRECTORY_LINK}>
                    Join Directory
                  </Link>
                </li>
                <li>
                  <Link href="/register/practitioner" className={FOOTER_DIRECTORY_LINK}>
                    Update Profile
                  </Link>
                </li>
                <li>
                  <Link href="/claim/" className={FOOTER_DIRECTORY_LINK}>
                    Verification Process
                  </Link>
                </li>
                <li>
                  <a href="mailto:care@consentz.com" className={FOOTER_DIRECTORY_LINK}>
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className={FOOTER_COLUMN_HEADING}>Directory</h3>
              <ul className="space-y-3">
                <li>
                  <Link prefetch={false} href="/treatments" className={FOOTER_DIRECTORY_LINK}>
                    Aesthetic Treatments
                  </Link>
                </li>
                <li>
                  <Link prefetch={false} href="/practitioners" className={FOOTER_DIRECTORY_LINK}>
                    Top Aesthetic Practitioners
                  </Link>
                </li>
                <li>
                  <Link prefetch={false} href="/clinics" className={FOOTER_DIRECTORY_LINK}>
                    Top Aesthetic Clinics
                  </Link>
                </li>
                <li>
                  <Link prefetch={false} href="/accredited" className={FOOTER_DIRECTORY_LINK}>
                    Accredited Clinics
                  </Link>
                </li>
                <li>
                  <Link
                    prefetch={false}
                    href="/clinics/treatment-by-city/"
                    className={FOOTER_DIRECTORY_LINK}
                  >
                    Top Clinics by Treatment & City
                  </Link>
                </li>
                <li>
                  <Link
                    prefetch={false}
                    href="/practitioners/treatment-by-city/"
                    className={FOOTER_DIRECTORY_LINK}
                  >
                    Top Practitioners by Treatment & City
                  </Link>
                </li>
                <li>
                  <Link prefetch={false} href="/products/brands" className={FOOTER_DIRECTORY_LINK}>
                    Aesthetic Product Brands
                  </Link>
                </li>
                <li>
                  <Link prefetch={false} href="/products/category" className={FOOTER_DIRECTORY_LINK}>
                    Aesthetic Product Categories
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className={FOOTER_COLUMN_HEADING}>Clinics by Accreditation</h3>
              <ul className="space-y-3">
                {ACCREDITATIONS.map(([slug, label]) => (
                  <li key={`clinic-${slug}`}>
                    <Link
                      prefetch={false}
                      href={`/accredited/${slug}/clinics`}
                      className={FOOTER_DIRECTORY_LINK}
                    >
                      {label} Accredited Clinics
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className={FOOTER_COLUMN_HEADING}>Practitioners by Accreditation</h3>
              <ul className="space-y-3">
                {ACCREDITATIONS.map(([slug, label]) => (
                  <li key={`practitioner-${slug}`}>
                    <Link
                      prefetch={false}
                      href={`/accredited/${slug}/practitioners`}
                      className={FOOTER_DIRECTORY_LINK}
                    >
                      {label} Accredited Practitioners
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>

      <div className="border-t border-white bg-[var(--dune)] px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <h3 className={`${FOOTER_COLUMN_HEADING} mb-4`}>Consentz Hub</h3>
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {CONSENTZ_HUB_LINKS.map(([label, path]) => (
              <li key={path}>
                <Link href={path} className={FOOTER_DIRECTORY_LINK}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="b-footer bg-[#191918] py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-4 text-sm text-white md:grid-cols-2">
            <div className="text-center md:text-left">
              <p className="m-0">
                © {copyrightYear} Consentz. All rights reserved.
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <ul className="flex items-center gap-8">
                <FooterSocialIcon
                  href={CONSENTZ_SOCIAL.linkedin}
                  label="Consentz on LinkedIn"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <g clipPath="url(#footer-linkedin-clip)">
                      <path
                        d="M22.2234 0H1.77187C0.792187 0 0 0.773438 0 1.72969V22.2656C0 23.2219 0.792187 24 1.77187 24H22.2234C23.2031 24 24 23.2219 24 22.2703V1.72969C24 0.773438 23.2031 0 22.2234 0ZM7.12031 20.4516H3.55781V8.99531H7.12031V20.4516ZM5.33906 7.43438C4.19531 7.43438 3.27188 6.51094 3.27188 5.37187C3.27188 4.23281 4.19531 3.30937 5.33906 3.30937C6.47813 3.30937 7.40156 4.23281 7.40156 5.37187C7.40156 6.50625 6.47813 7.43438 5.33906 7.43438ZM20.4516 20.4516H16.8937V14.8828C16.8937 13.5563 16.8703 11.8453 15.0422 11.8453C13.1906 11.8453 12.9094 13.2938 12.9094 14.7891V20.4516H9.35625V8.99531H12.7687V10.5609H12.8156C13.2891 9.66094 14.4516 8.70938 16.1813 8.70938C19.7859 8.70938 20.4516 11.0813 20.4516 14.1656V20.4516V20.4516Z"
                        fill="white"
                      />
                    </g>
                    <defs>
                      <clipPath id="footer-linkedin-clip">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </FooterSocialIcon>
                <FooterSocialIcon
                  href={CONSENTZ_SOCIAL.facebook}
                  label="Consentz on Facebook"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <g clipPath="url(#footer-facebook-clip)">
                      <path
                        d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z"
                        fill="white"
                      />
                    </g>
                    <defs>
                      <clipPath id="footer-facebook-clip">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </FooterSocialIcon>
                <FooterSocialIcon
                  href={CONSENTZ_SOCIAL.instagram}
                  label="Consentz on Instagram"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <g clipPath="url(#footer-instagram-clip)">
                      <path
                        d="M21.1695 0.00143433H2.91488C1.3423 0.00143433 0 1.47862 0 3.0464V21.3129C0 22.8801 1.3423 23.9987 2.91488 23.9987H21.1695C22.7421 23.9987 24 22.8801 24 21.3129V3.0464C24 1.47862 22.7421 0.00143433 21.1695 0.00143433ZM20.6049 3.42951C21.0599 3.42951 21.4288 3.7984 21.4288 4.25339V6.89133C21.4288 7.34631 21.0599 7.7152 20.6049 7.7152H17.9666C17.5116 7.7152 17.1427 7.34631 17.1427 6.89133V4.25339C17.1427 3.7984 17.5116 3.42951 17.9666 3.42951H20.6049ZM12.07 7.61368C14.6135 7.61368 16.6752 9.67096 16.6752 12.2075C16.6752 14.7445 14.6135 16.8018 12.07 16.8018C9.52689 16.8018 7.4647 14.7445 7.4647 12.2075C7.4647 9.67096 9.52684 7.61368 12.07 7.61368ZM21.4288 20.7002C21.4288 21.0687 21.0371 21.4278 20.6673 21.4278H3.47327C3.10364 21.4278 2.57125 21.0687 2.57125 20.7002V10.286H5.04423C4.87587 11.1433 4.78502 11.5431 4.78502 12.2075C4.78502 16.2148 8.05284 19.4742 12.0699 19.4742C16.0873 19.4742 19.3553 16.214 19.3553 12.2067C19.3553 11.5431 19.2644 11.1433 19.0968 10.286H21.4288V20.7002Z"
                        fill="white"
                      />
                    </g>
                    <defs>
                      <clipPath id="footer-instagram-clip">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </FooterSocialIcon>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
