import {
  HUB_CTA_PRIMARY_CLASS,
  HUB_CTA_PRIMARY_HERO_CLASS,
  HUB_CTA_SECONDARY_CLASS,
  HUB_CTA_SECONDARY_HERO_CLASS,
  HUB_CTA_LINK_CLASS,
} from "@/components/b2b-hub/hub-cta-buttons"
import { HubLogoStrip } from "@/components/b2b-hub/hub-logo-strip"
import Image from "next/image"
import Link from "next/link"
import {
  Building2,
  ClipboardList,
  FileImage,
  FileStack,
  FileText,
  LayoutGrid,
  Mail,
  MessageSquare,
  Send,
  Shield,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getPractitionerHubCopy } from "@/lib/b2b-hub/practitioner-hub-content"
import { practitionersHubNavLinks } from "@/lib/b2b-hub/practitioners-hub-nav-links"
import type { HubEntry, HubSegment } from "@/lib/b2b-hub/registry"
import { segmentLabel } from "@/lib/b2b-hub/registry"
import { toDisplayTitle } from "@/lib/b2b-hub/text"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.consentz.com"
const CTA_CLINIC_PHONE_SRC = "/directory/images/cta-clinic-phone.png"

const roleCards = [
  {
    title: "Nurse Injectors",
    body: "Manage consultations, consent, aftercare, and rebooking workflows without relying on scattered forms or manual reminders.",
    bullets: [
      "Digital consent forms",
      "Treatment notes & batch records",
      "Aftercare templates",
      "Patient rebooking workflows",
    ],
    Icon: Stethoscope,
  },
  {
    title: "Aesthetic Doctors",
    body: "Keep clinical records, treatment notes, patient communication, and compliance evidence structured in one place.",
    bullets: [
      "Clinical documentation",
      "Patient history timeline",
      "Compliance evidence records",
      "Structured follow-up workflows",
    ],
    Icon: ClipboardList,
  },
  {
    title: "Independent Practitioners",
    body: "Run your patient journey, marketing templates, forms, and follow-ups from a single system designed for solo practice.",
    bullets: [
      "Patient journey automation",
      "Marketing templates",
      "Before & after photo storage",
      "Follow-up reminders",
    ],
    Icon: UserRound,
  },
  {
    title: "Dermatology-Led Clinics",
    body: "Support regulated patient workflows with clear records, consent documentation, and full treatment history.",
    bullets: [
      "Regulated consent workflows",
      "Detailed treatment records",
      "CQC-ready documentation",
      "Multi-practitioner records",
    ],
    Icon: Building2,
  },
] as const

const painCards = [
  {
    title: "Consent Forms Spread Across Paper, PDFs, And Inboxes",
    desc: "No single source of truth for signed patient consent.",
    Icon: FileStack,
  },
  {
    title: "Treatment Notes Written After Long Clinic Days",
    desc: "Records completed from memory, increasing risk of error.",
    Icon: FileText,
  },
  {
    title: "Follow-Ups Manually Chased Between Appointments",
    desc: "Reminders and reactivation handled through scattered messages.",
    Icon: Send,
  },
  {
    title: "Before-And-After Photos Stored Separately",
    desc: "Images saved in camera rolls, not linked to patient records.",
    Icon: FileImage,
  },
  {
    title: "Patient Communication Split Across Multiple Tools",
    desc: "Messages across WhatsApp, email, and booking apps.",
    Icon: MessageSquare,
  },
  {
    title: "Compliance Evidence Hard To Organise When Needed",
    desc: "Consent, records, and audits spread across disconnected systems.",
    Icon: Shield,
  },
] as const

const featureCards = [
  {
    title: "Patient Records",
    body: "Centralised patient profiles with full history, notes, and photo records.",
    Icon: UserRound,
  },
  {
    title: "Digital Consent Forms",
    body: "Treatment-specific consent generated, signed, and stored automatically.",
    Icon: FileText,
  },
  {
    title: "Treatment Notes",
    body: "Structured notes capturing products used, batch numbers, and areas treated.",
    Icon: ClipboardList,
  },
  {
    title: "Before & After Photos",
    body: "Before and after images stored directly within each patient's record.",
    Icon: FileImage,
  },
  {
    title: "Aftercare Templates",
    body: "Ready-to-send aftercare instructions for every treatment type.",
    Icon: Mail,
  },
  {
    title: "Follow-Up Automations",
    body: "Automated reminders, review requests, and rebooking triggers.",
    Icon: Sparkles,
  },
  {
    title: "Marketing Templates",
    body: "Clinic-ready carousels, reels, emails, and campaign templates.",
    Icon: LayoutGrid,
  },
  {
    title: "Compliance Documentation",
    body: "Organised records, consent history, and audit-ready documentation.",
    Icon: Shield,
  },
] as const

const complianceCards = [
  {
    title: "Structured Records",
    body: "Patient consultations, consent, treatment notes, and aftercare all stored in one place — never scattered across tools.",
  },
  {
    title: "Consent History",
    body: "Every signed consent form stored against the patient's profile with a clear timestamp and treatment reference.",
  },
  {
    title: "Follow-Up Evidence",
    body: "A complete timeline of every touchpoint — from first consultation through to follow-up — available when you need it.",
  },
] as const

function PractitionerHeroMockup() {
  return (
    <div className="flex h-[min(400px,70vw)] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-[#e6e0d8] bg-white shadow-sm lg:h-[400px]">
      <div className="flex items-center gap-4 border-b border-[#1a1a1a] bg-[#1a1a1a] px-5 py-3 text-[11px] text-white">
        <span className="font-bold">Consentz</span>
        <span className="h-px flex-1 bg-white/20" />
        <span className="text-[#999]">Patients</span>
        <span className="text-[#999]">Consent</span>
        <span className="text-[#999]">Notes</span>
        <span className="text-[#999]">Templates</span>
      </div>
      <div className="flex min-h-0 flex-1 bg-[#faf8f5]">
        <div className="flex w-[130px] shrink-0 flex-col gap-1 border-r border-[#e6e0d8] bg-[#f6f4f1] px-3 py-3.5 text-[11px] text-[#928b82]">
          {["Patients", "Consultations", "Consent", "Tx Notes", "Aftercare", "Follow-ups"].map(
            (label) => (
              <div
                key={label}
                className={`rounded-md px-2.5 py-1.5 ${
                  label === "Tx Notes" ? "bg-[#e0f1ed] font-semibold text-[#106057]" : ""
                }`}
              >
                {label}
              </div>
            )
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 overflow-auto p-4">
          <div className="flex items-center gap-2.5 rounded-[10px] border border-[#e6e0d8] bg-[#faf8f5] px-3 py-2.5">
            <div className="h-8 w-8 shrink-0 rounded-full bg-[#e6e0d8]" />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-xs font-semibold text-[#2e2e2e]">Sarah Mitchell</p>
              <p className="text-[10px] text-[#928b82]">Lip Enhancement · 3rd visit</p>
            </div>
            <span className="shrink-0 rounded-full bg-[#e0f1ed] px-2.5 py-1 text-[9px] font-semibold text-[#1a877a]">
              Active
            </span>
          </div>
          <div className="flex flex-col gap-2 rounded-[10px] border border-[#e6e0d8] bg-[#faf8f5] px-3 py-2.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#2e2e2e]">
              Treatment Note
              <span className="h-px flex-1 bg-[#e6e0d8]" />
              <span className="text-[9px] font-normal text-[#928b82]">Today, 2:15pm</span>
            </div>
            <p className="text-[9px] text-[#928b82]">
              Product: <span className="text-[#2e2e2e]">1ml Juvéderm Volbella</span>
            </p>
            <p className="text-[9px] text-[#928b82]">
              Areas treated:{" "}
              <span className="text-[#2e2e2e]">Upper lip border, Cupid&apos;s bow</span>
            </p>
            <p className="text-[9px] text-[#928b82]">
              Batch no.: <span className="text-[#2e2e2e]">JVB-2024-0341</span>
            </p>
          </div>
          <div className="flex gap-2">
            {[
              ["Consent", "Signed ✓"],
              ["Aftercare", "Sent"],
              ["Follow-up", "Scheduled"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex min-w-0 flex-1 flex-col gap-1 rounded-lg border border-[#e6e0d8] bg-[#faf8f5] px-2.5 py-2"
              >
                <span className="text-[9px] text-[#928b82]">{k}</span>
                <span
                  className={`text-[11px] font-semibold ${
                    v.includes("✓") || v === "Sent" ? "text-[#1a877a]" : "text-[#2e2e2e]"
                  }`}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

type Props = { entry: HubEntry }

export function HubPractitionersDetailTemplate({ entry }: Props) {
  const seg = entry.segment as HubSegment
  const copy = getPractitionerHubCopy(entry.slug, entry.title, entry.summary ?? "")
  const navLinks = practitionersHubNavLinks(entry.slug)
  const intro =
    entry.summary ||
    "Run consultations, consent, treatment notes, patient communication, and follow-up workflows from one connected platform built for modern aesthetic practice."

  return (
    <>
      <section className="w-full border-b border-[#E5E7EB] bg-[var(--primary-bg-color)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0">
          <div className="relative box-border overflow-hidden pt-8 pb-12 lg:grid lg:min-h-[480px] lg:max-h-[720px] lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-center lg:gap-x-10 lg:px-12 lg:py-16 xl:px-[120px]">
            <div className="relative z-10 flex min-w-0 flex-col items-start justify-center lg:min-h-0 lg:pr-2">
              <Breadcrumb className="mb-6 flex justify-start">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/business/">Buyer Hub</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/business/${seg}/`}>
                      {segmentLabel(seg)}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="line-clamp-1">
                      {toDisplayTitle(entry.title)}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <header>
                <h1 className="mb-5 max-w-[720px] font-medium leading-[1.08] tracking-[0.468px] text-[#2e2e2e] [font-family:var(--font-playfair),Georgia,serif] text-[clamp(1.75rem,5vw,3.25rem)] lg:text-[52px] lg:leading-[62px]">
                  <span className="block">Software Built For</span>
                  <span className="block">{copy.heroFocus}</span>
                  <span className="block">{copy.heroAudience}</span>
                </h1>
                <p className="mb-9 max-w-[720px] text-lg font-medium leading-[1.65] text-[#1a1a1a] lg:text-xl">
                  {intro}
                </p>
                <div className="flex max-sm:flex-col max-sm:items-stretch gap-3 sm:flex-row sm:flex-nowrap sm:items-center sm:gap-4">
                  <a
                    href={`${baseUrl}/book-demo`}
                    className={HUB_CTA_PRIMARY_HERO_CLASS}
                  >
                    Book A Demo
                  </a>
                  <a
                    href={`${baseUrl}/medical-templates/`}
                    target="_blank"
                    rel="noreferrer"
                    className={HUB_CTA_SECONDARY_HERO_CLASS}
                  >
                    Explore Practitioner Tools
                  </a>
                </div>
              </header>
            </div>
            <div
              className="relative z-0 mt-10 flex w-full min-w-0 justify-center lg:mt-0 lg:justify-end"
              aria-hidden
            >
              <PractitionerHeroMockup />
            </div>
          </div>
        
        <HubLogoStrip />
</div>
      </section>

      <article className="mx-auto max-w-[1280px] px-4 pb-0 pt-8 md:pt-10 [font-family:Inter,system-ui,sans-serif]">
        <section className="mb-12">
          <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] p-6 shadow-sm md:p-8">
              <h2 className="mb-3 text-lg font-semibold text-[#111111]">Operational Reality</h2>
              <p className="text-base leading-relaxed text-[#1A1A1A]">
                Teams outgrow generic tools when consent, payments, and clinical evidence sit in different
                places. The result is slower bookings, weaker compliance confidence, and fragile patient
                communication.
              </p>
            </div>
            <div className="rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] p-6 shadow-sm md:p-8">
              <h2 className="mb-3 text-lg font-semibold text-[#111111]">What Changes With Consentz</h2>
              <p className="text-base leading-relaxed text-[#1A1A1A]">
                Consentz is built as an operating layer for clinics: structured consent, workflow automation,
                and reporting that maps to how regulated teams actually work day to day.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mx-auto grid max-w-[1072px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {navLinks.map((item) => {
              const external = item.href.startsWith("http")
              const className =
                "flex min-h-[93px] items-center justify-center rounded-xl border border-[#DEDBDB] bg-[#FAFAFA] px-5 py-[18px] text-center text-xl font-semibold text-[#111111] transition-colors hover:border-neutral-400 hover:bg-white"
              if (external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className={className}
                  >
                    <span className="line-clamp-3">{item.label}</span>
                  </a>
                )
              }
              return (
                <Link key={item.href} href={item.href} className={className}>
                  <span className="line-clamp-3">{item.label}</span>
                </Link>
              )
            })}
          </div>
          <div className="mt-10 flex justify-center">
            <a
              href={`${baseUrl}/book-demo`}
              className={HUB_CTA_PRIMARY_CLASS}
            >
              Book Demo
            </a>
          </div>
        </section>

        <section className="mb-0 w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 bg-[#fcfbf9] px-4 py-16 md:px-12 md:py-24 lg:px-[120px]">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-12">
            <div className="max-w-[900px] text-center">
              <h2 className="text-3xl font-bold leading-tight text-[#2e2e2e] md:text-4xl md:leading-[48px]">
                Built Around How Practitioners Actually Work
              </h2>
              <p className="mt-4 text-lg font-medium leading-7 text-[#928b82] md:text-xl">
                Purpose-built workflows for every aesthetic practitioner role — from solo nurse injectors to
                dermatology-led clinics.
              </p>
            </div>
            <div className="grid w-full max-w-[1120px] grid-cols-1 gap-6 md:grid-cols-2">
              {roleCards.map(({ title, body, bullets, Icon }) => (
                <div
                  key={title}
                  className="flex flex-col gap-4 rounded-2xl border border-[#e6e0d8] bg-white p-8"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e0f1ed]">
                    <Icon className="h-6 w-6 text-[#106057]" strokeWidth={1.5} aria-hidden />
                  </div>
                  <h3 className="text-[22px] font-bold leading-[30px] text-[#2e2e2e]">{title}</h3>
                  <p className="text-[15px] leading-6 text-[#928b82]">{body}</p>
                  <div className="h-px w-10 bg-[#e6e0d8]" />
                  <ul className="flex flex-col gap-2">
                    {bullets.map((b) => (
                      <li key={b} className="flex gap-2.5 text-sm text-[#928b82]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#928b82]" aria-hidden />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-0 w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 bg-[#f2eee6] px-4 py-16 md:px-12 md:py-24 lg:px-[120px]">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-12">
            <div className="w-full max-w-[900px] text-center">
              <p className="mb-3 text-[11px] font-semibold tracking-[2.5px] text-[#1a877a]">
                Practitioner Reality
              </p>
              <h2 className="text-3xl font-bold leading-tight text-[#2e2e2e] md:text-4xl md:leading-[48px]">
                Less Admin Between You And Your Patients
              </h2>
              <p className="mt-4 text-lg leading-7 text-[#928b82] md:text-[18px]">
                The scattered tools and manual processes that slow down independent practitioners — and how
                Consentz removes them.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {painCards.map(({ title, desc, Icon }) => (
                <div
                  key={title}
                  className="flex flex-col gap-3.5 rounded-[14px] border border-[#e6e0d8] bg-[#fcfbf9] p-7"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#e6e0d8] bg-[#f2eee6]">
                    <Icon className="h-5 w-5 text-[#2e2e2e]" strokeWidth={1.5} aria-hidden />
                  </div>
                  <h3 className="text-[17px] font-semibold leading-[25px] text-[#2e2e2e]">{title}</h3>
                  <p className="text-sm leading-[22px] text-[#928b82]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-0 w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 bg-[#fcfbf9] px-4 py-16 md:px-12 md:py-24 lg:px-[120px]">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-12">
            <div className="w-full max-w-[900px] text-center">
              <p className="mb-3 text-[11px] font-semibold tracking-[2.5px] text-[#1a877a]">
                Practitioner Workflow
              </p>
              <h2 className="text-3xl font-bold leading-tight text-[#2e2e2e] md:text-4xl md:leading-[48px]">
                One Workflow From Consultation To Follow-Up
              </h2>
              <p className="mt-4 text-lg leading-7 text-[#928b82] md:text-[18px]">
                Every step of the patient journey — captured, structured, and connected in one place.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {copy.workflow.map((step, i) => (
                <div
                  key={`${step.title}-${i}`}
                  className="group relative flex flex-col gap-3.5 overflow-hidden rounded-[14px] border border-[#e6e0d8] bg-white p-7 transition-colors duration-200 hover:bg-[#f1f9f6]"
                >
                  <div
                    className="pointer-events-none absolute left-7 top-0 h-0.5 w-[100px] bg-[#1a877a] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    aria-hidden
                  />
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a1a] text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-[11px] font-normal tracking-wide text-[#928b82]">
                      {step.stepLabel}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold leading-[26px] text-[#2e2e2e]">{step.title}</h3>
                  <p className="text-sm leading-[22px] text-[#928b82]">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-0 w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 bg-[#f2eee6] px-4 py-16 md:px-12 md:py-24 lg:px-[120px]">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-12">
            <div className="w-full max-w-[900px] text-center">
              <p className="mb-3 text-[11px] font-semibold tracking-[2.5px] text-[#1a877a]">
                Practitioner Toolkit
              </p>
              <h2 className="text-3xl font-bold leading-tight text-[#2e2e2e] md:text-4xl md:leading-[48px]">
                Everything A Practitioner Needs To Run A Professional Clinic Workflow
              </h2>
              <p className="mt-4 text-lg leading-7 text-[#928b82] md:text-[18px]">
                From first consultation to long-term patient reactivation — all in one connected system.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featureCards.map(({ title, body, Icon }) => (
                <div
                  key={title}
                  className="flex flex-col gap-3 rounded-[14px] border border-[#e6e0d8] bg-white p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#e0f1ed]">
                    <Icon className="h-5 w-5 text-[#106057]" strokeWidth={1.5} aria-hidden />
                  </div>
                  <h3 className="text-base font-semibold leading-6 text-[#2e2e2e]">{title}</h3>
                  <p className="text-[13px] leading-5 text-[#928b82]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-0 w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 bg-[#fcfbf9] px-4 py-16 md:px-12 md:py-24 lg:px-[120px]">
          <div className="mx-auto flex max-w-[800px] flex-col items-center gap-8">
            <div className="w-full max-w-[720px] rounded-2xl border border-[#e6e0d8] bg-white shadow-sm">
              <div className="h-1 w-full rounded-t-2xl bg-[#1a877a]" />
              <div className="flex flex-col gap-4 px-7 pb-8 pt-6">
                <p className="text-[10px] font-semibold tracking-[2px] text-[#1a877a]">
                  {copy.spotlight.eyebrow}
                </p>
                <h2 className="text-xl font-bold leading-7 text-[#2e2e2e] md:text-[22px]">
                  {copy.spotlight.title}
                </h2>
                <p className="text-[15px] leading-6 text-[#928b82]">{copy.spotlight.body}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {copy.spotlight.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-[#e0f1ed] px-3 py-1.5 text-xs font-semibold text-[#106057]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-0 mt-0 w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 bg-white px-4 py-16 md:px-12 md:py-24 lg:px-[120px]">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-12">
            <div className="w-full max-w-[900px] text-center">
              <p className="mb-3 text-[11px] font-semibold tracking-[2.5px] text-[#1a877a]">
                Records & Compliance
              </p>
              <h2 className="text-3xl font-bold leading-tight text-[#2e2e2e] md:text-4xl md:leading-[48px]">
                Professional Records Without The Admin Overwhelm
              </h2>
              <p className="mt-4 text-lg leading-[30px] text-[#928b82] md:text-[18px]">
                Consentz helps practitioners keep their patient journey structured, consistent, and easier to
                evidence — from consultation and consent through to treatment notes and follow-up.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
              {complianceCards.map(({ title, body }) => (
                <div
                  key={title}
                  className="flex flex-col gap-4 rounded-2xl border border-[#e6e0d8] bg-white p-8"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e0f1ed]">
                    <FileText className="h-6 w-6 text-[#106057]" strokeWidth={1.5} aria-hidden />
                  </div>
                  <h3 className="text-xl font-bold leading-7 text-[#2e2e2e]">{title}</h3>
                  <p className="text-[15px] leading-6 text-[#928b82]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-0 mt-16 w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 overflow-hidden bg-[var(--primary-bg-color)]">
          <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-8 sm:pb-14 sm:pt-10 lg:h-[472px] lg:overflow-hidden lg:px-20 lg:pb-20 lg:pt-0">
            <div className="relative z-10 flex w-full max-w-[720px] flex-col items-center text-center lg:absolute lg:left-1/2 lg:top-[118px] lg:-translate-x-1/2">
              <h2 className="text-[26px] font-bold leading-tight tracking-[-0.03em] text-[#111111] sm:text-[30px] lg:text-[36px] lg:leading-normal lg:tracking-[-1.08px]">
                Ready To Run Your Clinic Properly?
              </h2>
              <p className="mt-3 max-w-xl text-base leading-[1.6] text-[#1A1A1A] sm:text-lg lg:mt-[14px] lg:text-[20px]">
                Join aesthetic clinics across the UK using Consentz
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={`${baseUrl}/book-demo`}
                  className={HUB_CTA_PRIMARY_CLASS}
                >
                  Book A Demo
                </a>
                <a
                  href={`${baseUrl}/book-demo`}
                  className="inline-flex items-center justify-center rounded-[12px] border-[1.5px] border-[#E2DDD7] bg-white px-6 py-[13px] text-sm font-medium text-[#111111] transition-colors hover:bg-neutral-50"
                >
                  Get CQC Readiness Audit
                </a>
              </div>
            </div>
            <div
              className="relative z-0 mx-auto mt-8 h-[200px] w-[174px] overflow-hidden sm:h-[220px] sm:w-[191px] lg:absolute lg:mx-0 lg:mt-0 lg:h-[469px] lg:w-[407px] lg:max-w-none lg:right-20 lg:top-[41px]"
              aria-hidden
            >
              <Image
                src={CTA_CLINIC_PHONE_SRC}
                alt=""
                width={586}
                height={731}
                className="pointer-events-none absolute max-w-none select-none"
                sizes="(max-width: 1024px) 191px, 407px"
                style={{
                  height: "156.09%",
                  width: "144.06%",
                  left: "-15.65%",
                  top: "-7.82%",
                }}
              />
            </div>
          </div>
        </section>
      </article>
    </>
  )
}
