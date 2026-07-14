"use client"
import { useState } from "react";
import {
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Clinic } from "@/lib/types";
import SocialMediaIcons from "../Clinic/clinicSocialMedia";
import ClinicLabels from "./clinicLabels";
import { PrestigeProfileBadge } from "./prestige-profile-badge";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { OnlineDot } from "@/components/Clinic/online-dot";
import { ConsultationChatDialog } from "@/components/chat/consultation-chat-dialog";
import { ClinicOnlineStatus } from "@/components/Clinic/online-status";
import { RequestConsultationDialog } from "@/components/tracking/request-consultation-dialog";
interface ProfileHeaderProps {
  clinic: Clinic;
  clinicName?: string;
  hasCoreCalendar?: boolean;
  claimState?: 'unclaimed' | 'pending' | 'claimed';
  goToProfileHref?: string;
}

export function ProfileHeader({ clinic, clinicName, hasCoreCalendar = false, claimState = clinic.claimed ? 'claimed' : 'unclaimed', goToProfileHref = '/portal/login' }: Readonly<ProfileHeaderProps>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const returnTo = queryString ? `${pathname}?${queryString}` : pathname;
  const normalizeExternalUrl = (value?: string) => {
    if (!value) return null;
    const cleaned = value.trim().replace(/^\.+|\.+$/g, "");
    if (!cleaned) return null;
    if (/^https?:\/\//i.test(cleaned)) return cleaned;
    return `https://${cleaned}`;
  };
  const consultationHref =
    normalizeExternalUrl(clinic.website) ?? normalizeExternalUrl(clinic.url);
  const practitionerName = clinic.slug!
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  const roleTitle = clinic.category;
  const DEFAULT_IMG = "/directory/images/default-dr-profile-1.webp";
  const initialImg =
    clinic.claimed && clinic.image && clinic.image.trim()
      ? clinic.image
      : DEFAULT_IMG;
  const [imgSrc, setImgSrc] = useState(initialImg);

  return (
    <Card className="relative md:mt-2 flex flex-col gap-6 md:rounded-lg px-0 md:px-6 py-6 relative shadow-none group transition-all duration-300 md:rounded-27 border-t border-b border-[#C4C4C4] md:border-t md:border md:border-(--alto) bg-white md:bg-(--primary-bg-color)">
      {claimState === 'unclaimed' && (
        <Link prefetch={false} href={`/claim/${clinic.slug}`}>
          <Badge
            variant="outline"
            className="absolute top-2 right-2 z-50 mb-2 font-semibold text-balance leading-tight bg-white md:bg-(--primary-bg-color)"
          >
            Claim Profile
          </Badge>
        </Link>
      )}
      {claimState === 'claimed' && (
        <Link prefetch={false} href={goToProfileHref}>
          <Badge
            variant="outline"
            className="absolute top-2 right-2 z-50 mb-2 font-semibold text-balance leading-tight bg-white md:bg-(--primary-bg-color)"
          >
            Go to Profile
          </Badge>
        </Link>
      )}

      <div className="px-4 md:px-0 grid grid-cols-1 lg:grid-cols-[4fr_1fr] gap-4 items-start">
        {/* Left: avatar + info */}
        <div className="flex flex-col gap-3 pb-4 border-b border-[#C4C4C4] md:pb-0 md:border-0">
          <div className="flex flex-row items-start gap-4">
            <div className="flex flex-col items-center gap-2 shrink-0 w-20 md:w-40 md:items-start">
              <div className="relative h-20 w-20 md:h-40 md:w-40 shrink-0 overflow-hidden rounded-full bg-gray-200">
                <img
                  src={imgSrc}
                  alt={practitionerName}
                  className="object-cover w-full h-full rounded-full"
                  onError={() => setImgSrc(DEFAULT_IMG)}
                />
              </div>
              <div className="hidden md:block w-full">
                <PrestigeProfileBadge
                  awardsBadgeLabel={clinic.awardsBadgeLabel}
                  tatlerBadgeLabel={clinic.tatlerBadgeLabel}
                  size="md"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 min-w-0 flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-semibold text-lg md:text-2xl leading-tight">
                    {practitionerName}
                  </h1>
                  {clinic.claimed && clinic.slug && (
                    <OnlineDot slug={clinic.slug} />
                  )}
                  {clinic.idVerified && (
                    <Badge className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-medium shrink-0">
                      <ShieldCheck className="h-3 w-3" />
                      ID Verified
                    </Badge>
                  )}
                  {!clinic.idVerified && clinic.manualVerified && (
                    <Badge className="inline-flex items-center gap-1 bg-blue-100 text-black border-blue-200 text-xs font-medium shrink-0">
                      <ShieldCheck className="h-3 w-3" />
                      Manually Verified
                    </Badge>
                  )}
                  {!clinic.idVerified && !clinic.manualVerified && clinic.verified && (
                    <Badge
                      variant="outline"
                      className="inline-flex items-center gap-1 border-foreground/30 text-foreground text-xs font-medium shrink-0"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <ClinicLabels clinic={clinic} />
              </div>

              <p className="text-sm font-semibold text-muted-foreground leading-tight">
                {roleTitle}
              </p>

              <div className="hidden md:flex flex-col gap-1.5 mt-1">
                <address className="not-italic text-sm leading-snug flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{clinic.gmapsAddress}</span>
                </address>
                <span className="inline-flex items-center text-sm">
                  <Phone className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  {clinic.gmapsPhone}
                </span>
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <PrestigeProfileBadge
              awardsBadgeLabel={clinic.awardsBadgeLabel}
              tatlerBadgeLabel={clinic.tatlerBadgeLabel}
              size="md"
            />
          </div>
        </div>

        {/* Address + phone — mobile only */}
        <div className="flex flex-col gap-1.5 md:hidden pt-1">
          <address className="not-italic text-sm leading-snug flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{clinic.gmapsAddress}</span>
          </address>
          <span className="inline-flex items-center text-sm">
            <Phone className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            {clinic.gmapsPhone}
          </span>
        </div>

        <div className="flex flex-col gap-3 justify-center">
          {clinic.claimed && (
            <ClinicOnlineStatus clinicSlug={clinic.slug ?? ''} />
          )}
          <ConsultationChatDialog
            clinicSlug={clinic.slug ?? ''}
            clinicName={clinicName ?? practitionerName}
            clinicImage={imgSrc}
            hasCoreCalendar={hasCoreCalendar}
            location={clinic.City}
            pageType="clinic_page"
            buttonClassName="shadow-none h-auto rounded-lg text-md px-7 py-3 text-white hover:cursor-pointer"
          />
          <RequestConsultationDialog
            pageType="clinic_page"
            clinicSlug={clinic.slug ?? ''}
            entityName={clinicName ?? practitionerName}
            entityImage={imgSrc}
            location={clinic.City}
            buttonVariant="outline"
            triggerLabel="Request Pricing"
            dialogTitle="Request pricing"
            submitLabel="Send pricing request"
            treatmentFallback="Pricing Enquiry"
            openParam="pricing"
            leadSource="pricing"
            buttonClassName="w-full shadow-none border-black h-auto rounded-lg text-md px-7 py-3 hover:cursor-pointer"
          />
          <SocialMediaIcons clinic={clinic} />
        </div>
      </div>
    </Card>
  );
}
