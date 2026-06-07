import { HubBuyerFaq } from "@/components/b2b-hub/hub-buyer-faq"
import { HubTestimonialsSection } from "@/components/b2b-hub/hub-testimonials-section"
import {
  HUB_CTA_PRIMARY_CLASS,
  HUB_CTA_PRIMARY_HERO_CLASS,
  HUB_CTA_SECONDARY_CLASS,
  HUB_CTA_SECONDARY_HERO_CLASS,
  HUB_CTA_LINK_CLASS,
} from "@/components/b2b-hub/hub-cta-buttons"
import { HubSectionCta } from "@/components/b2b-hub/hub-section-cta"
import { HubServiceProviderSection } from "@/components/b2b-hub/hub-service-provider-section"
import {
  HUB_BTN_VIEW_ALL_BLOGS_CLASS,
  HUB_SURFACE_CARD_CLASS,
} from "@/components/b2b-hub/hub-marketing-typography"
import Image from "next/image";
import Link from "next/link"
import { HUB_DETAIL_HERO_VIEWPORT_CLASS } from "@/lib/b2b-hub/hub-index-hero-layout"
import {
  HUB_HERO_ACTIONS_ROW,
  HUB_SPLIT_HERO_CONTENT,
  HUB_SPLIT_HERO_GRID_TWO_COL,
  HUB_SPLIT_HERO_VISUAL_TALL,
} from "@/components/b2b-hub/hub-hero-layout-classes"
import { cn } from "@/lib/utils";
import { Droplets, MapPin, Syringe, Users } from "lucide-react";
import {
  SoftwareHeroVisual,
} from "@/components/b2b-hub/hub-pillar-detail-template";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { HUB_BLOG_LINKS } from "@/lib/b2b-hub/hub-blog-links";
import { UK_POPULAR_TREATMENTS } from "@/lib/b2b-hub/uk-hub-index-data";
import { getCityScaledHero } from "@/lib/b2b-hub/city-page-hero";
import type { CityMarketStats } from "@/lib/b2b-hub/city-page-stats";
import { getCityDataByName } from "@/lib/b2b-hub/city-directory-data";
import { buildOperatorCitySections } from "@/lib/b2b-hub/operator-city-content";
import {
  buildCityOperationalInsight,
} from "@/lib/b2b-hub/operational-insight";
import { toCurrentSiteUrl } from "@/lib/b2b-hub/seo";
import { HubCityOperatorWriteup } from "@/components/b2b-hub/hub-city-operator-writeup";
import { HubOperationalInsightBlock } from "@/components/b2b-hub/hub-operational-insight-block";
import { HubTopClinicsSection } from "@/components/b2b-hub/hub-top-clinics-section";
import {
  getCityRegulator,
  getNearbyCityLinks,
  regulatorComplianceLine,
  regulatorInspectionLine,
  regulatorReadinessAuditLabel,
} from "@/lib/b2b-hub/city-regulator";
import {
  buildCityHubFaqs,
  buildCityHubFaqJsonLdAnswers,
} from "@/lib/b2b-hub/city-localised-faq";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com";

const CITY_HUB = "/directory/images/city-hub";
const CITY_MACBOOK_SRC = `${CITY_HUB}/city-macbook-group.png`;

function cityWorkflowLinks(citySlug: string, cityTitle: string) {
  return [
    {
      label: `${cityTitle} CQC Software`,
      href: "/business/cqc/cqc-compliance-software-for-clinics/",
    },
    {
      label: `${cityTitle} Consent Forms`,
      href: `/business/uk/${citySlug}/botox-consent-form-software/`,
    },
    {
      label: `${cityTitle} Automation`,
      href: "/business/automation/clinic-reactivation-automation-software/",
    },
    {
      label: `${cityTitle} Aesthetic Nurse`,
      href: `/business/uk/${citySlug}/aesthetic-nurse-software/`,
    },
    {
      label: `${cityTitle} Dermatologist`,
      href: "/business/software/dermatologist-crm-software/",
    },
    {
      label: "Aesthetic Clinic Software",
      href: "/business/software/aesthetic-clinic-software/",
    },
    {
      label: "CQC Compliance Software",
      href: "/business/cqc/cqc-compliance-software-for-clinics/",
    },
    {
      label: "Botox Consent Forms",
      href: `/business/uk/${citySlug}/botox-consent-form-software/`,
    },
    {
      label: "Patient Reactivation",
      href: "/business/automation/clinic-reactivation-automation-software/",
    },
  ] as const;
}

function painPoints(cityTitle: string, citySlug: string) {
  const regulator = getCityRegulator(citySlug);
  return [
    regulatorInspectionLine(cityTitle, regulator),
    regulatorComplianceLine(regulator),
    "Patient reactivation is being lost to competitors",
    "Too many disconnected tools for one small clinic",
    "No time to manually chase follow-ups and aftercare",
  ] as const;
}

export type HubCityScaledHero = {
  line1: string;
  line2: string | null;
  intro: string;
};

export type HubCityScaledPageProps = {
  citySlug: string;
  cityTitle: string;
  pageSlug: string;
  pageTitle: string;
  stats: CityMarketStats;
  canonicalPath?: string;
  heroOverride?: HubCityScaledHero;
  expansionBreadcrumb?: {
    segmentLabel: string;
    segmentHref: string;
    hubTitle: string;
    hubHref: string;
  };
};

export function HubCityScaledPage({
  citySlug,
  cityTitle,
  pageSlug,
  pageTitle,
  stats,
  canonicalPath,
  heroOverride,
  expansionBreadcrumb,
}: HubCityScaledPageProps) {
  const regulator = getCityRegulator(citySlug);
  const hero = heroOverride ?? getCityScaledHero(cityTitle, pageSlug);
  const workflow = cityWorkflowLinks(citySlug, cityTitle);
  const pains = painPoints(cityTitle, citySlug);
  const faqItems = buildCityHubFaqs(cityTitle, regulator);
  const faqJsonLdAnswers = buildCityHubFaqJsonLdAnswers(cityTitle, regulator);
  const nearbyCities = getNearbyCityLinks(citySlug);
  const readinessAuditLabel = regulatorReadinessAuditLabel(regulator);
  const cityData = getCityDataByName(cityTitle);
  const operationalInsight = buildCityOperationalInsight(cityTitle, stats, cityData);
  const operatorSections = cityData
    ? buildOperatorCitySections(cityData, stats)
    : [];

  const pagePath = canonicalPath ?? `/business/uk/${citySlug}/${pageSlug}/`;
  const pageUrl = toCurrentSiteUrl(pagePath);
  const jsonLdGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: pageTitle,
        description: hero.intro,
        isPartOf: {
          "@type": "WebSite",
          url: toCurrentSiteUrl("/business/"),
          name: "Consentz Buyer Hub",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faqJsonLdAnswers[item.question],
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
      />
      <section
        className={cn(
          "w-full overflow-x-clip border-b border-[#E5E7EB] bg-[var(--primary-bg-color)]",
          HUB_DETAIL_HERO_VIEWPORT_CLASS
        )}
      >
        <div className="mx-auto flex w-full min-w-0 max-w-[1440px] flex-1 flex-col overflow-x-clip px-4 sm:px-6 lg:px-0">
          <div className={HUB_SPLIT_HERO_GRID_TWO_COL}>
            <div className={HUB_SPLIT_HERO_VISUAL_TALL} aria-hidden>
              <SoftwareHeroVisual />
            </div>
            <div className={HUB_SPLIT_HERO_CONTENT}>
              <Breadcrumb className="mb-6 flex w-full justify-center lg:justify-start">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/business/">Buyer Hub</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  {expansionBreadcrumb ? (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink href={expansionBreadcrumb.segmentHref}>
                          {expansionBreadcrumb.segmentLabel}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink href={expansionBreadcrumb.hubHref}>
                          {expansionBreadcrumb.hubTitle}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="line-clamp-2">{cityTitle}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  ) : (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/business/uk/">By City</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="line-clamp-2">
                          {pageTitle}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
              <header>
                <h1 className="mb-5 max-w-[700px] text-[clamp(1.75rem,5vw,3.25rem)] font-medium leading-[1.08] tracking-[0.468px] text-[#1A1A1A] [font-family:var(--font-playfair),Georgia,serif] lg:text-[52px]">
                  {hero.line2 ? (
                    <>
                      <span className="block">{hero.line1}</span>
                      <span className="block">{hero.line2}</span>
                    </>
                  ) : (
                    hero.line1
                  )}
                </h1>
                <p className="mb-9 max-w-[700px] text-lg font-medium leading-[1.65] text-[#1A1A1A] [font-family:Inter,system-ui,sans-serif] lg:text-2xl">
                  {hero.intro}
                </p>
                <div className={HUB_HERO_ACTIONS_ROW}>
                  <a
                    href={`${baseUrl}/book-demo`}
                    className={HUB_CTA_PRIMARY_HERO_CLASS}
                  >
                    Book a Demo
                  </a>
                  <a
                    href={`${baseUrl}/book-demo`}
                    className={HUB_CTA_SECONDARY_HERO_CLASS}
                  >
                    {readinessAuditLabel}
                  </a>
                  <a
                    href={`${baseUrl}/book-demo`}
                    className={HUB_CTA_LINK_CLASS}
                  >
                    See How It Works →
                  </a>
                </div>
              </header>
            </div>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-[1280px] px-4 pb-0 pt-10 md:pt-12 [font-family:Inter,system-ui,sans-serif]">
        <section className="mb-12 text-center">
          <h2 className="text-[30px] font-bold tracking-[-0.02em] text-[#111111] md:text-[36px] md:tracking-[-0.72px]">
            The {cityTitle} Aesthetic Market
          </h2>
          <div className="mx-auto mt-10 grid max-w-[1142px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] px-7 py-7 text-center">
              <MapPin className="h-14 w-14 text-[#111111]" strokeWidth={1.25} aria-hidden />
              <p className="text-[28px] font-bold tracking-[-0.02em] text-[#111111] sm:text-[36px] sm:tracking-[-1.08px]">
                {stats.clinicCount}
              </p>
              <p className="text-base leading-snug text-[#6B6B6B] sm:text-xl sm:leading-[1.45]">
                Clinics in {cityTitle}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] px-7 py-7 text-center">
              <Users className="h-14 w-14 text-[#111111]" strokeWidth={1.25} aria-hidden />
              <p className="text-[28px] font-bold tracking-[-0.02em] text-[#111111] sm:text-[36px] sm:tracking-[-1.08px]">
                {stats.practitionerCount}
              </p>
              <p className="text-base leading-snug text-[#6B6B6B] sm:text-xl sm:leading-[1.45]">Practitioners</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] px-7 py-7 text-center">
              <Syringe className="h-14 w-14 text-[#111111]" strokeWidth={1.25} aria-hidden />
              <p className="text-[28px] font-bold tracking-[-0.02em] text-[#111111] sm:text-[36px] sm:tracking-[-1.08px]">
                {stats.topTreatment}
              </p>
              <p className="text-base leading-snug text-[#6B6B6B] sm:text-xl sm:leading-[1.45]">Top Treatment</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] px-7 py-7 text-center">
              <Droplets className="h-14 w-14 text-[#111111]" strokeWidth={1.25} aria-hidden />
              <p className="text-[28px] font-bold tracking-[-0.02em] text-[#111111] sm:text-[36px] sm:tracking-[-1.08px]">
                {stats.secondTreatment}
              </p>
              <p className="text-base leading-snug text-[#6B6B6B] sm:text-xl sm:leading-[1.45]">2nd Treatment</p>
            </div>
          </div>
        </section>

        <HubOperationalInsightBlock insight={operationalInsight} />

        {operatorSections.length > 0 ? (
          <HubCityOperatorWriteup cityTitle={cityTitle} sections={operatorSections} />
        ) : null}

        <section className="mb-16">
          <h2 className="mb-10 text-center text-[30px] font-bold tracking-[-0.02em] text-[#111111] md:text-[36px] md:tracking-[-0.72px]">
            Why {cityTitle} Clinics Choose Consentz
          </h2>
          <div className="mx-auto grid max-w-[1070px] grid-cols-1 gap-6 md:grid-cols-2">
            {pains.map((text) => (
              <div
                key={text}
                className="flex min-h-[88px] items-start rounded-xl bg-[#eef7f2] px-10 py-[15px]"
              >
                <p className="text-lg font-medium leading-[1.45] text-[#1A1A1A] md:text-xl">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <HubTopClinicsSection cityTitle={cityTitle} />

        {nearbyCities.length > 0 ? (
          <section className="mb-16 text-center">
            <h2 className="mb-6 text-[30px] font-bold tracking-[-0.02em] text-[#111111] md:text-[36px] md:tracking-[-0.72px]">
              Also Serving Clinics Near {cityTitle}
            </h2>
            <div className="mx-auto flex max-w-[900px] flex-wrap justify-center gap-3">
              {nearbyCities.map((nearby) => (
                <Link
                  key={nearby.slug}
                  href={`/business/uk/${nearby.slug}/${pageSlug}/`}
                  className="rounded-full border border-[#DEDBDB] bg-white px-5 py-2 text-sm font-medium text-[#111111] hover:bg-[#FAFAFA]"
                >
                  {nearby.label}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <HubServiceProviderSection />

        <HubBuyerFaq items={faqItems} />


        <section className="mx-auto mb-16 max-w-[1280px] text-center md:text-left">
          <h2 className="mb-3 text-3xl font-bold text-[#111111] md:text-4xl">Our latest blogs</h2>
          <p className="mx-auto mb-10 max-w-[1280px] text-xl leading-snug text-[#1A1A1A]">
            Explore insights and tips to help you manage and grow your aesthetics clinic
            efficiently. Stay informed with our latest articles.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {HUB_BLOG_LINKS.slice(0, 3).map((post) => (
              <a
                key={post.id}
                href={post.href}
                target="_blank"
                rel="noreferrer"
                className={HUB_SURFACE_CARD_CLASS}
              >
                <div className="relative h-[200px] w-full overflow-hidden bg-[#E8E6E2]">
                  <Image
                    src={post.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="flex flex-col gap-4 px-5 py-5 pb-6">
                  <span className="text-[15px] leading-snug text-[#111111] underline underline-offset-2">
                    {post.title}
                  </span>
                  <span className="text-sm text-[#111111] underline underline-offset-2">
                    Read more →
                  </span>
                </div>
              </a>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <a
              href="https://www.consentz.com/blog/"
              target="_blank"
              rel="noreferrer"
              className={HUB_BTN_VIEW_ALL_BLOGS_CLASS}
            >
              View all blogs
            </a>
          </div>
        </section>

      </article>
      <HubSectionCta className="mb-0" tone="warm" withBorder={false} />
    </>
  );
}
