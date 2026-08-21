"use client"
import { useState } from "react"
import {
  IconStar,
  IconMapPin,
  IconPhone,
  IconMail,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Practitioner } from "@/lib/types";
import SocialMediaIcons from "../Clinic/clinicSocialMedia";
import ClinicLabels from "@/components/Clinic/clinicLabels";
import { PrestigeProfileBadge } from "@/components/Clinic/prestige-profile-badge";
import ClinicTabsHeader from "./clinicTabsHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { IconLink as LinkIcon } from "@tabler/icons-react"
import { OnlineDot } from "@/components/Clinic/online-dot";
import { RequestConsultationDialog } from "@/components/tracking/request-consultation-dialog";
import { capitalize } from "@/lib/utils";
import { isConsentzLinked } from "@/lib/consentz-customers";
interface ProfileHeaderProps {
  clinic: Practitioner;
  k_value: any;
  clinic_list: string[]
  claimState?: 'unclaimed' | 'pending' | 'claimed';
  goToProfileHref?: string;
  isOwner?: boolean;
}

export function ProfileHeader({ clinic, k_value, clinic_list, claimState = clinic.claimed ? 'claimed' : 'unclaimed', goToProfileHref = '/portal/login', isOwner = false }: Readonly<ProfileHeaderProps>) {
  const [selectedClinic, setSelectedClinic] = useState(clinic_list[0])
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const returnTo = queryString ? `${pathname}?${queryString}` : pathname
  const normalizeExternalUrl = (value?: string) => {
    if (!value) return null
    const cleaned = value.trim().replace(/^\.+|\.+$/g, "")
    if (!cleaned) return null
    if (/^https?:\/\//i.test(cleaned)) return cleaned
    return `https://${cleaned}`
  }

  const consultationHref =
    normalizeExternalUrl(k_value?.website) ??
    normalizeExternalUrl(k_value?.url) ??
    normalizeExternalUrl(clinic.website) ??
    normalizeExternalUrl(clinic.url)
  const practitionerName = clinic.practitioner_name!
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  const DEFAULT_IMG = "/directory/images/default-dr-profile-1.webp";
  // Profile photos are temporarily disabled site-wide — always show the default placeholder.
  const [imgSrc, setImgSrc] = useState(DEFAULT_IMG);
  let sections: {id: string,label: string}[] = []
  clinic_list.forEach((clinic: string) => {
    sections.push({ id: clinic, label: clinic })
  })

  return (
    <Card className="relative md:mt-2 flex flex-col gap-6 md:rounded-lg px-0 md:px-6 py-6 relative shadow-none group transition-all duration-300 md:rounded-27 border-t border-b border-[#C4C4C4] md:border-t-[1px] md:border md:border-[var(--alto)] bg-white md:bg-[var(--primary-bg-color)]">
      {claimState === 'unclaimed' && (
        <Link prefetch={false} href={`/claim/practitioner/${clinic.practitioner_name}`}>
          <Badge
            variant="outline"
            className="absolute top-2 right-2 z-50 mb-2 font-semibold text-balance leading-tight bg-white md:bg-[var(--primary-bg-color)]"
          >
            Claim Profile
          </Badge>
        </Link>
      )}
      {claimState === 'claimed' && isOwner && (
        <Link prefetch={false} href={goToProfileHref}>
          <Badge
            variant="outline"
            className="absolute top-2 right-2 z-50 mb-2 font-semibold text-balance leading-tight bg-white md:bg-[var(--primary-bg-color)]"
          >
            Go to Profile
          </Badge>
        </Link>
      )}
      <div className="px-4 md:px-0 grid grid-cols-1 lg:grid-cols-[4fr_1fr] gap-4 items-center">
        <div className="flex flex-col md:flex-col md:mb-4 md:px-4 md:px-0 lg:mb-0 items-start gap-4 border-b border-[#C4C4C4] md:border-0">
          <div className="flex w-full flex-col items-center gap-4 md:flex-row md:flex-wrap md:items-start">
            <div className="flex flex-col items-center gap-2 shrink-0 md:items-start">
              <div className="relative h-[80px] w-[80px] md:h-[160px] md:w-[160px] shrink-0">
                <div className="h-full w-full overflow-hidden rounded-full bg-grey-300">
                  <img
                    src={imgSrc}
                    alt=""
                    className="object-cover rounded-full min-w-full min-h-full"
                    onError={() => setImgSrc(DEFAULT_IMG)}
                  />
                </div>
                <div className="absolute -left-1 -top-1 z-20 md:-left-1.5 md:-top-1.5">
                  <ClinicLabels clinic={k_value} size="overlay-md" showConsentz={false} />
                </div>
                {isConsentzLinked(k_value) && (
                  <img
                    src="/directory/consentz-customer-badge.jpg"
                    alt="Consentz Customer"
                    title="Consentz Customer"
                    className="absolute -right-1 -top-1 z-20 h-7 w-7 rounded-full border-2 border-white object-cover shadow-sm md:-right-1.5 md:-top-1.5 md:h-10 md:w-10"
                  />
                )}
              </div>
              <PrestigeProfileBadge
                awardsBadgeLabel={clinic.awardsBadgeLabel ?? k_value.awardsBadgeLabel}
                tatlerBadgeLabel={clinic.tatlerBadgeLabel ?? k_value.tatlerBadgeLabel}
                size="md"
                className="items-center md:items-start"
              />
              <div className="flex max-w-[14rem] flex-col items-center gap-1 text-center md:items-start md:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                  <h1 className="font-semibold text-lg md:text-xl leading-tight">
                    {practitionerName}
                  </h1>
                  {k_value?.claimed && k_value?.slug && (
                    <OnlineDot slug={k_value.slug} />
                  )}
                </div>
                {clinic.idVerified && (
                  <Badge className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-medium shrink-0">
                    <IconShieldCheck stroke={1.5} className="h-3 w-3" />
                    ID Verified
                  </Badge>
                )}
                {!clinic.idVerified && clinic.manualVerified && (
                  <Badge className="inline-flex items-center gap-1 bg-blue-100 text-black border-blue-200 text-xs font-medium shrink-0">
                    <IconShieldCheck stroke={1.5} className="h-3 w-3" />
                    Manually Verified
                  </Badge>
                )}
                {!clinic.idVerified && !clinic.manualVerified && clinic.verified && (
                  <Badge variant="outline" className="inline-flex items-center gap-1 border-foreground/30 text-xs font-medium shrink-0">
                    <IconShieldCheck stroke={1.5} className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center md:items-start md:text-left">
              <p className="text-muted-foreground font-semibold text-balance leading-tight">
                {clinic.practitioner_title
                  ? capitalize(clinic.practitioner_title)
                  : clinic.practitioner_title}
              </p>
              <div className="hidden md:flex flex-col gap-1.5">
                <address className="not-italic text-sm leading-relaxed flex items-start gap-2">
                  <IconMapPin
                    stroke={1.5}
                    className="h-4 w-4 mt-1 shrink-0 "
                    aria-hidden="true"
                  />
                  <span className=" text-foreground">
                    {k_value.gmapsAddress}
                  </span>
                </address>
                {k_value.gmapsPhone && (
                  <span className="inline-flex items-center text-sm">
                    <IconPhone stroke={1.5} className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                    {k_value.gmapsPhone}
                  </span>
                )}
                <ClinicTabsHeader
                  k_value={k_value}
                  clinic_list={clinic_list}
                  selected={selectedClinic}
                  onSelect={(clinic) => setSelectedClinic(clinic)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="block md:hidden gap-0 flex items-start md:mb-4 md:items-start flex-col ">
          <address className="mb-2 not-italic text-sm leading-relaxed flex items-start justify-start sm:items-start gap-2">
            <IconMapPin stroke={1.5} className="h-4 w-4 mt-1 shrink-0 " aria-hidden="true" />
            <span className="block max-w-[300px] break-words sm:whitespace-normal">
              {k_value.gmapsAddress}
            </span>
          </address>

          {k_value.gmapsPhone && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center text-sm">
                <IconPhone stroke={1.5} className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                {k_value.gmapsPhone}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 justify-center">
          <RequestConsultationDialog
            pageType="practitioner_page"
            clinicSlug={k_value?.slug}
            entityName={practitionerName}
            entityImage={imgSrc}
            location={k_value?.City || clinic.City}
            consultationHref={consultationHref}
            buttonClassName="shadow-none h-auto rounded-lg text-md px-7 py-3 text-white hover:cursor-pointer"
          />
          <RequestConsultationDialog
            pageType="practitioner_page"
            clinicSlug={k_value?.slug}
            entityName={practitionerName}
            entityImage={imgSrc}
            location={k_value?.City || clinic.City}
            consultationHref={consultationHref}
            buttonVariant="outline"
            triggerLabel="Request Pricing"
            dialogTitle="Request pricing"
            submitLabel="Send pricing request"
            treatmentFallback="Pricing Enquiry"
            openParam="pricing"
            leadSource="pricing"
            buttonClassName="shadow-none border-black h-auto rounded-lg text-md px-7 py-3 hover:cursor-pointer"
          />
          <SocialMediaIcons clinic={k_value} />
        </div>
      </div>
    </Card>
  );
}