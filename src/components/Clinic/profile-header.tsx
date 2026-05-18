"use client"
import { useState } from "react";
import {
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Clinic } from "@/lib/types";
import SocialMediaIcons from "../Clinic/clinicSocialMedia";
import ClinicLabels from "./clinicLabels";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ConsultationChatDialog } from "@/components/chat/consultation-chat-dialog";
import { ClinicOnlineStatus } from "@/components/clinic/online-status";
interface ProfileHeaderProps {
  clinic: Clinic;
  clinicName?: string;
  hasCoreCalendar?: boolean;
}

export function ProfileHeader({ clinic, clinicName, hasCoreCalendar = false }: Readonly<ProfileHeaderProps>) {
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
  const proxyUrl = clinic.image
    ? `/directory/api/img?url=${encodeURIComponent(clinic.image)}`
    : DEFAULT_IMG;
  const [imgSrc, setImgSrc] = useState(proxyUrl);

  return (
    <Card className="relative md:mt-2 flex flex-col gap-6 md:rounded-xl px-0 md:px-6 py-6 relative shadow-none group transition-all duration-300 md:rounded-27 border-t border-b border-[#C4C4C4] md:border-t md:border md:border-(--alto) bg-white md:bg-(--primary-bg-color)">
      {!clinic.claimed && (
        <Link prefetch={false} href={`/claim/${clinic.slug}`}>
          <Badge
            variant="outline"
            className="absolute top-2 right-2 z-50 mb-2 font-semibold text-balance leading-tight bg-white md:bg-(--primary-bg-color)"
          >
            Claim Profile
          </Badge>
        </Link>
      )}
      <div className="px-4 md:px-0 grid grid-cols-1 lg:grid-cols-[4fr_1fr] gap-4 items-start">
        {/* Left: avatar + info */}
        <div className="flex flex-row flex-wrap items-start gap-4 pb-4 border-b border-[#C4C4C4] md:pb-0 md:border-0">
          {/* Avatar */}
          <div className="relative w-20 h-20 md:w-40 md:h-40 shrink-0 overflow-hidden rounded-full bg-gray-200">
            <img
              src={imgSrc}
              alt={practitionerName}
              className="object-cover w-full h-full rounded-full"
              onError={() => setImgSrc(DEFAULT_IMG)}
            />
          </div>

          {/* Text info — uniform gap between every row */}
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            {/* Name + verification badges + CQC labels (side by side on desktop) */}
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-semibold text-lg md:text-2xl leading-tight">
                  {practitionerName}
                </h1>
                {clinic.idVerified && (
                  <Badge className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-medium shrink-0">
                    <ShieldCheck className="h-3 w-3" />
                    ID Verified
                  </Badge>
                )}
                {!clinic.idVerified && clinic.manualVerified && (
                  <Badge className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 border-blue-200 text-xs font-medium shrink-0">
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

            {/* Role / category */}
            <p className="text-sm font-semibold text-muted-foreground leading-tight">
              {roleTitle}
            </p>

            {/* Address + phone — desktop only */}
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
            pageType="clinic_page"
            clinicSlug={clinic.slug ?? ''}
            clinicName={clinicName ?? clinic.slug ?? ''}
            hasCoreCalendar={hasCoreCalendar}
            treatment={clinic.Treatments?.[0]}
            location={clinic.City}
            buttonClassName="shadow-none h-auto rounded-lg text-md px-7 py-3 text-white hover:cursor-pointer"
          />
          <Button
            asChild
            variant="outline"
            className="w-full shadow-none border-black h-auto rounded-lg text-md px-7 py-3 hover:cursor-pointer"
          >
            <a
              href={consultationHref ?? "#fees"}
              target={consultationHref ? "_blank" : undefined}
              rel={consultationHref ? "noopener noreferrer" : undefined}
              data-track-cta="true"
            >
              Request Pricing
            </a>
          </Button>
          <SocialMediaIcons clinic={clinic} />
        </div>
      </div>
    </Card>
  );
}
