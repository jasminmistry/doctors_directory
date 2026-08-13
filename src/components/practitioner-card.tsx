"use client";
import Link from "next/link";
import { DirectoryStarRating } from "@/components/directory-star-rating";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Practitioner, Clinic, Product } from "@/lib/types";
import {
  capitalize,
  decodeUnicodeEscapes,
  fixMojibake,
  isAward,
  isCity,
} from "@/lib/utils";
import ClinicLabels from "./Clinic/clinicLabels";
import { PrestigeSearchPill } from "./Clinic/prestige-search-pill";
import { FallbackImage, DEFAULT_PRODUCT } from "@/components/ui/fallback-image";
import { getTreatmentImage, locations } from "@/lib/data";
import { Button } from "./ui/button";
import { isClinic, isPractitioner, isProduct, toUrlSlug } from "@/lib/utils";
import { getClinicDisplayName } from "@/lib/clinic-display";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { OnlineDot } from "@/components/Clinic/online-dot";
import { IconMapPin } from "@tabler/icons-react";
type PractitionerOrClinic = Practitioner | Clinic | Product | string;
interface PractitionerCardProps {
  practitioner: PractitionerOrClinic;
  customLink?: string;
}

const formatSlugText = (value: string): string =>
  value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatTreatmentText = (value: string): string =>
  value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace("Hifu", "HIFU")
    .replace("Coolsculpting", "CoolSculpting");

function getPractitionerName(
  practitioner: Practitioner | Clinic | Product | string,
): string {
  if (isPractitioner(practitioner)) {
    if (practitioner.practitioner_name) {
      return formatSlugText(practitioner.practitioner_name);
    }

    return formatSlugText(practitioner.slug!);
  }

  if (isClinic(practitioner)) {
    return getClinicDisplayName(practitioner);
  }

  return "";
}

function getPractitionerOrClinicAriaPrefix(
  practitioner: Practitioner | Clinic | Product | string,
): string {
  if (isPractitioner(practitioner)) {
    return "practitioner";
  }

  if (isClinic(practitioner)) {
    return "clinic";
  }

  return "";
}

function getPractitionerOrClinicHref(
  practitioner: Practitioner | Clinic | Product | string,
  customLink?: string,
): string {
  if (customLink) {
    return customLink;
  }

  if (isPractitioner(practitioner) && practitioner.practitioner_name) {
    return `/practitioners/${(practitioner.City ?? "").toLowerCase()}/profile/${
      practitioner.practitioner_name
    }`;
  }

  if (isPractitioner(practitioner) || isClinic(practitioner)) {
    return `/clinics/${(practitioner.City ?? "").toLowerCase()}/clinic/${practitioner.slug}`;
  }

  return "#";
}

function getProfileImageSrc(
  practitioner: Practitioner | Clinic | Product | string,
): string {
  const DEFAULT = "/directory/images/default-dr-profile-1.webp";
  if (isClinic(practitioner) && practitioner.claimed && practitioner.image?.trim()) {
    return practitioner.image;
  }
  return DEFAULT;
}

function getCityHref(
  practitioner: Practitioner | Clinic | Product | string,
  customLink: string | undefined,
  path: string,
): string {
  if (!isCity(practitioner)) {
    return "";
  }

  const citySlug = practitioner.toLowerCase();

  if (customLink) {
    if (customLink.includes("/practitioners")) {
      return path.includes("/practitioners/treatment-by-city")
        ? `${customLink}/${citySlug}/treatments`
        : `${customLink}/${citySlug}`;
    }

    return `${customLink}/${citySlug}/services`;
  }

  return path.includes("/practitioners")
    ? `/practitioners/${citySlug}`
    : `/clinics/${citySlug}`;
}

function getProductHref(
  practitioner: Practitioner | Clinic | Product | string,
  customLink?: string,
): string {
  if (customLink) {
    return customLink;
  }

  if (isProduct(practitioner)) {
    return `/products/category/${toUrlSlug(practitioner.category)}/${practitioner.slug}`;
  }

  return "#";
}

function getTreatmentName(
  practitioner: Practitioner | Clinic | Product | string,
): string {
  if (typeof practitioner !== "string") {
    return "";
  }

  return formatTreatmentText(practitioner);
}

function getTreatmentHref(
  practitioner: Practitioner | Clinic | Product | string,
  customLink: string | undefined,
  treatmentName: string,
): string {
  if (typeof practitioner !== "string") {
    return "#";
  }

  if (customLink) {
    return `${customLink}/${toUrlSlug(typeof practitioner === 'string' ? practitioner : treatmentName)}`;
  }

  return `/treatments/${toUrlSlug(treatmentName)}`;
}

function getTreatmentImageSrc(treatmentName: string): string {
  return getTreatmentImage(treatmentName) || "/directory/images/default-dr-profile-1.webp";
}

function getAwardHref(
  practitioner: Practitioner | Clinic | Product | string,
  customLink?: string,
): string {
  if (customLink) {
    return customLink;
  }

  if (isAward(practitioner)) {
    return `/practitioners/credentials/${(practitioner as { slug: string; image_url: string }).slug}`;
  }

  return "#";
}

export function PractitionerCard({
  practitioner,
  customLink,
}: PractitionerCardProps) {
  const Router = useRouter();
  const path = usePathname();
  const practitionerName = getPractitionerName(practitioner);
  const cityHref = getCityHref(practitioner, customLink, path);
  const practitionerOrClinicHref = getPractitionerOrClinicHref(
    practitioner,
    customLink,
  );
  const practitionerOrClinicAriaPrefix =
    getPractitionerOrClinicAriaPrefix(practitioner);
  const profileImageSrc = getProfileImageSrc(practitioner);
  const productHref = getProductHref(practitioner, customLink);
  const treatmentName = getTreatmentName(practitioner);
  const treatmentHref = getTreatmentHref(
    practitioner,
    customLink,
    treatmentName,
  );
  const treatmentImageSrc = getTreatmentImageSrc(treatmentName);
  const awardHref = getAwardHref(practitioner, customLink);

  return (
    <>
      {(isPractitioner(practitioner) || isClinic(practitioner)) && (
        <article
          className="relative flex md:h-full flex-col my-3 md:my-0 overflow-hidden rounded-md border border-[#C4C4C4] bg-white"
          aria-labelledby={`${practitionerOrClinicAriaPrefix}-name-${practitioner.slug}`}
          data-testid="practitioner-card"
        >
          <h2
            id={`${practitionerOrClinicAriaPrefix}-name-${practitioner.slug}`}
            className="sr-only"
          >
            {practitionerName}
          </h2>
          <div className="flex h-full flex-col">
            <div className="flex flex-col items-center px-3 pt-4 text-center">
              <div className="relative mb-3 h-20 w-20 shrink-0 md:h-[120px] md:w-[120px]">
                <div className="h-full w-full overflow-hidden rounded-full bg-gray-200">
                  <FallbackImage
                    src={profileImageSrc}
                    alt={practitionerName}
                    className="h-full w-full object-cover"
                    width={120}
                    height={120}
                  />
                </div>
                <div className="pointer-events-none absolute -right-0.5 -top-0.5 z-10 md:-right-1 md:-top-1">
                  <ClinicLabels clinic={practitioner as Clinic} size="sm" />
                </div>
              </div>

              <div className="flex min-h-[2.75rem] w-full items-center justify-center gap-1 px-1">
                <span className="line-clamp-2 text-center text-base font-semibold leading-snug text-primary">
                  {isClinic(practitioner)
                    ? practitionerName
                    : practitionerName
                        .split(" ")
                        .slice(0, 4)
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                </span>
                {(isClinic(practitioner) || isPractitioner(practitioner)) && (
                  <div className="flex shrink-0 items-center gap-1">
                    <VerifiedBadge
                      idVerified={(practitioner as any).idVerified}
                      manualVerified={(practitioner as any).manualVerified}
                      verified={(practitioner as any).verified}
                    />
                    {practitioner.slug && (
                      <OnlineDot slug={practitioner.slug} />
                    )}
                  </div>
                )}
              </div>

              {isClinic(practitioner) && (
                <PrestigeSearchPill
                  awardsBadgeLabel={practitioner.awardsBadgeLabel}
                  tatlerBadgeLabel={practitioner.tatlerBadgeLabel}
                />
              )}

              <div className="mb-2 flex min-h-[1.25rem] w-full items-center justify-center px-1">
                {"practitioner_name" in practitioner && practitioner.practitioner_title ? (
                  <p className="line-clamp-1 text-sm font-semibold leading-tight text-muted-foreground">
                    {capitalize(
                      practitioner.practitioner_title
                        .split(",")[0]
                        .split(" ")
                        .slice(0, 4)
                        .join(" "),
                    )}
                  </p>
                ) : null}
                {!("practitioner_name" in practitioner) && practitioner.category ? (
                  <p className="line-clamp-1 text-sm font-semibold leading-tight text-muted-foreground">
                    {capitalize(practitioner.category.trim())}
                  </p>
                ) : null}
              </div>

              <div className="flex min-h-[1.5rem] w-full items-center justify-center">
                <DirectoryStarRating
                  reviewCount={practitioner.reviewCount ?? 0}
                  className="justify-center"
                />
              </div>
            </div>

            <div className="flex flex-1 flex-col px-3 pt-4">
              <div className="mb-4 flex min-h-[2.75rem] items-start gap-2 text-sm text-muted-foreground/80">
                <IconMapPin
                  stroke={1.5}
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="line-clamp-2 text-left leading-snug">
                  {practitioner.gmapsAddress!.split(",")[
                    practitioner.gmapsAddress!.split(",").length - 2
                  ] +
                    ", " +
                    practitioner.gmapsAddress!.split(",")[
                      practitioner.gmapsAddress!.split(",").length - 1
                    ]}
                </span>
              </div>

              <Link
                href={practitionerOrClinicHref}
                className="mt-auto pb-3"
                data-track-cta="true"
              >
                <Button className="w-full rounded-lg border bg-black px-4 py-2 text-white hover:bg-white hover:text-black">
                  Contact
                </Button>
              </Link>
            </div>

            <div className="min-h-[3.5rem] px-3 pb-4">
              <ul
                className="flex flex-wrap gap-1"
                aria-label="Treatments offered"
              >
                {practitioner.Treatments &&
                  practitioner.Treatments.sort((a, b) => a.length - b.length)
                    .slice(0, 2)
                    .map((modality, index) => (
                      <li key={index}>
                        <Badge variant="outline" className="text-xs">
                          <Link
                            href={`/treatments/${toUrlSlug(modality)}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {modality
                              .split(" ")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1),
                              )
                              .join(" ")}
                          </Link>
                        </Badge>
                      </li>
                    ))}
                {practitioner.Treatments &&
                  practitioner.Treatments.length > 2 && (
                    <li>
                      <Badge variant="outline" className="text-xs">
                        <Link
                          href={`/treatments`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          +{practitioner.Treatments.length - 2} more
                        </Link>
                      </Badge>
                    </li>
                  )}
              </ul>
            </div>
          </div>
        </article>
      )}
      {isProduct(practitioner) && (
        <Card
          asChild
          className="gap-0 h-full relative px-4 md:px-0 shadow-none group transition-all duration-300 border-b border-t-0 border-[#C4C4C4] md:border-t rounded-27 md:border md:border-(--alto) cursor-pointer"
          aria-labelledby={`product-name-${practitioner.slug}`}
          data-testid="practitioner-card"
        >
          <Link href={productHref} className="block" prefetch={false}>
            <CardHeader className="pb-2 px-2">
              <h2 id={`product-name-${practitioner.slug}`} className="sr-only">
                {decodeUnicodeEscapes(practitioner.product_name)}
              </h2>
              <div className="flex items-start gap-4">
                <div className="text-center flex-1 min-w-0 items-center flex flex-col">
                  <div className="flex w-full flex-row items-start md:border-0 md:flex-col md:items-center">
                    <div className="w-20 h-20 md:w-[150px] md:h-[150px] flex items-center justify-center overflow-hidden rounded-lg bg-gray-300 md:mb-4 mr-0">
                      <FallbackImage
                        src={practitioner.image_url?.replaceAll('"', "")}
                        alt={practitioner.product_name ?? "Product"}
                        className="object-cover rounded-lg min-w-full min-h-full"
                        fallback={DEFAULT_PRODUCT}
                      />
                    </div>

                    <div className="flex items-start md:items-center flex-col pl-4 md:pl-0 w-[calc(100%-80px)] md:w-full">
                      {practitioner.product_name && (
                        <p className="flex items-center gap-1 rounded-full bg-green-100 text-green-800 border border-gray-200 text-[10px] px-3 py-1 mb-2">
                          {decodeUnicodeEscapes(
                            practitioner?.distributor_cleaned.trim(),
                          )}
                        </p>
                      )}

                      <h3 className="mb-2 md:mb-0 flex text-left md:text-center md:align-items-center md:justify-center font-semibold text-xs md:text-md leading-relaxed text-balance line-clamp-2">
                        {decodeUnicodeEscapes(practitioner.product_name)}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0 px-2 md:px-4 space-y-4">
              <div className="flex md:items-center md:justify-center gap-2 text-[11px] text-gray-600">
                <span className="text-pretty text-center">
                  {decodeUnicodeEscapes(practitioner.category.trim())}
                </span>
              </div>
              <div>
                <ul
                  className="flex flex-wrap md:items-center md:justify-center gap-1 text-center"
                  aria-label="Product prices"
                >
                  {practitioner.all_prices &&
                    practitioner.all_prices
                      .slice(0, 2)
                      .map((value: any, index: number) => (
                        <li key={index}>
                          <Badge
                            variant="outline"
                            className="text-[11px] font-normal text-gray-600"
                          >
                            {value.price}
                          </Badge>
                        </li>
                      ))}
                  {practitioner.all_prices && (
                    <li>
                      <Badge
                        variant="outline"
                        className="text-[11px] font-normal text-gray-600"
                      >
                        {practitioner.all_prices.length - 2} more
                      </Badge>
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Link>
        </Card>
      )}
      {typeof practitioner === "string" && !isCity(practitioner) && (
        <Card
          asChild
          className="gap-0 h-full relative px-4 rounded-none md:rounded-lg md:px-0 md:border duration-300 shadow-none cursor-pointer"
          aria-labelledby={`treatment-name-${practitioner}`}
          data-testid="practitioner-card"
        >
          <Link
            href={treatmentHref}
            className="block border-0"
            prefetch={false}
          >
            <CardHeader className="px-2 border-0">
              <h2 id={`treatment-name-${treatmentName}`} className="sr-only">
                {treatmentName}
              </h2>
              <div className="flex items-start gap-4">
                <div className="text-center flex-1 min-w-0 items-center flex flex-col">
                  <div className="flex w-full flex-col items-center border-0 md:flex-col md:items-center">
                    <div className="w-20 h-20 md:w-[150px] md:h-[150px] flex items-center justify-center overflow-hidden md:mb-3 mr-0">
                      <FallbackImage
                        src={treatmentImageSrc}
                        alt={treatmentName}
                        className="object-cover rounded-full w-full h-full"
                      />
                    </div>

                    <div className="mb-3 md:mb-0 flex text-left md:text-center md:align-items-center md:justify-center font-normal text-sm transition-colors text-balance">
                      {treatmentName}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>{" "}
          </Link>
        </Card>
      )}
      {isCity(practitioner) === true && (
        <Card
          asChild
          className="gap-0 relative shadow-none group transition-all duration-300 border-b border-t-0 border-[#C4C4C4] md:border md:border-(--alto) cursor-pointer  "
        >
          <Link href={cityHref}>
            <div className="mt-2 flex flex-col items-center gap-2">
              <span className="font-normal text-sm">{practitioner}</span>
            </div>
          </Link>
        </Card>
      )}
      {isAward(practitioner) && (
        <Link
          key={
            (
              practitioner as unknown as {
                name: string;
                slug: string;
                image_url: string;
              }
            ).slug
          }
          href={awardHref}
          className="block"
        >
          <Card className="gap-0 relative shadow-none group transition-all duration-300 border-b border-t-0 border-[#C4C4C4] md:border md:border-(--alto) cursor-pointer ">
            <CardHeader className=" h-55 pb-4 px-2">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 md:w-[150px] md:h-[150px] flex items-center justify-center overflow-hidden rounded-lg bg-gray-300">
                  <FallbackImage
                    src={(practitioner as unknown as { name: string; slug: string; image_url: string }).image_url}
                    alt={`${(practitioner as unknown as { name: string; slug: string; image_url: string }).name} credential`}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <h3 className="mb-2 font-semibold transition-colors text-balance group-hover:text-black text-center text-md">
                {
                  (
                    practitioner as unknown as {
                      name: string;
                      slug: string;
                      image_url: string;
                    }
                  ).name
                }
              </h3>
            </CardHeader>
          </Card>
        </Link>
      )}
    </>
  );
}
