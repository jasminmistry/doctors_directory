"use client";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Practitioner, Clinic, Product } from "@/lib/types";
import {
  decodeUnicodeEscapes,
  fixMojibake,
  isAward,
  isCity,
} from "@/lib/utils";
import ClinicLabels from "./Clinic/clinicLabels";
import { locations, TreatmentMap } from "@/lib/data";
import { Button } from "./ui/button";
import { isClinic, isPractitioner, isProduct, isTreatment } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
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
    return formatSlugText(practitioner.slug!);
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
  if (isPractitioner(practitioner)) {
    return "/directory/images/default-dr-profile-1.webp";
  }

  if (
    (isPractitioner(practitioner) || isClinic(practitioner)) &&
    practitioner.image
  ) {
    return practitioner.image.replace("&w=256&q=75", "") || "/placeholder.svg";
  }

  return "/placeholder.svg";
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
    return `/products/category/${practitioner.category}/${practitioner.slug}`;
  }

  return "#";
}

function getTreatmentName(
  practitioner: Practitioner | Clinic | Product | string,
): string {
  if (!isTreatment(practitioner)) {
    return "";
  }

  return formatTreatmentText(practitioner);
}

function getTreatmentHref(
  practitioner: Practitioner | Clinic | Product | string,
  customLink: string | undefined,
  treatmentName: string,
): string {
  if (!isTreatment(practitioner)) {
    return "#";
  }

  if (customLink) {
    return `${customLink}/${practitioner}`;
  }

  return `/treatments/${treatmentName}`;
}

function getTreatmentImageSrc(treatmentName: string): string {
  if (!treatmentName) {
    return "/placeholder.svg";
  }

  return TreatmentMap[treatmentName] || "/placeholder.svg";
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
          className=" relative mb-2 bg-white border-b border-t-0 border-[#C4C4C4] md:border-t rounded-md md:border md:border-(--alto)"
          aria-labelledby={`${practitionerOrClinicAriaPrefix}-name-${practitioner.slug}`}
        >
          <Card
            asChild
            className="mt-2 gap-4 md:px-0 shadow-none group transition-all duration-300 border-b border-t-0 border-[#C4C4C4] md:border-t rounded-27 md:border md:border-(--alto) cursor-pointer"
            data-testid="practitioner-card"
          >
            <>
              <header>
                <CardHeader className="pb-4 px-2">
                  <h2
                    id={`practitioner-name-${practitioner.slug} `}
                    className="sr-only"
                  >
                    {practitionerName}
                  </h2>

                  <div className="flex items-start gap-4">
                    <div className="flex flex-col flex-1 min-w-0 text-left items-stretch">
                      <div className="flex w-full flex-row items-start md:border-0 md:flex-col md:items-center">
                        <div className="mt-2 relative w-20 h-20 md:w-[150px] md:h-[150px] flex items-center justify-center overflow-hidden rounded-full bg-gray-300 md:mb-3 mr-0">
                          <img
                            src={profileImageSrc}
                            alt="Profile"
                            className="object-cover rounded-full min-w-full min-h-full"
                            onError={(e) => {
                              e.currentTarget.onerror = null; // prevent infinite loop
                              e.currentTarget.src =
                                "/directory/images/default-dr-profile-1.webp";
                            }}
                          />
                        </div>

                        <div className="text-center flex-1 min-w-0 items-start sm:items-center flex flex-col">
                          <div className="text-base font-semibold text-primary truncate ml-4 sm:ml-0">
                            {practitionerName
                              .split(" ")
                              .slice(0, 4)
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1),
                              )
                              .join(" ")}
                          </div>

                          <div className="absolute top-2 -right-4 text-white text-xs font-semibold px-6 py-1">
                            <ClinicLabels clinic={practitioner as Clinic} />
                          </div>

                          {"practitioner_name" in practitioner && (
                            <p className="text-muted-foreground mb-2 font-semibold leading-tight truncate ml-4 sm:ml-0">
                              {practitioner.practitioner_title
                                ?.split(",")[0]
                                .split(" ")
                                .slice(0, 4)
                                .map(
                                  (word: string) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1),
                                )
                                .join(" ")}
                            </p>
                          )}

                          {!("practitioner_name" in practitioner) &&
                            practitioner.category && (
                              <p className="text-muted-foreground mb-2 font-semibold leading-tight truncate ml-4 sm:ml-0">
                                {practitioner.category.trim()}
                              </p>
                            )}
                        </div>
                      </div>

                      <div className="sr-only">Rating</div>
                      <div
                        className="flex flex-row gap-2 pt-3 items-center justify-start md:justify-center w-full text-sm"
                        aria-label={`Rating: ${practitioner.rating} out of 5 stars, ${practitioner.reviewCount} reviews`}
                      >
                        <div className="inline-flex items-center gap-1">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                aria-hidden="true"
                                className={`h-4 w-4 ${
                                  i < practitioner.rating!
                                    ? "fill-black text-black"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="border-l border-black pl-2 underline">
                          ({practitioner.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </header>

              <CardContent className="pt-0 px-2 md:px-4 space-y-4">
                <div className="sr-only">Location</div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground/80">
                  <MapPin
                    className="h-4 w-4 mt-0 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="leading-snug truncate">
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
                  prefetch={false}
                  className="z-10"
                >
                  <Button className="mt-4 mb-0 w-full flex border rounded-lg font-weight px-4 py-2 bg-black align-items-center cursor-pointer justify-center text-white hover:bg-white hover:text-black">
                    Contact
                  </Button>
                </Link>

                {practitioner.Treatments?.length! > 0 && null}
              </CardContent>
              <div className="px-2 md:px-4 space-y-4 pb-4">
                <div className="sr-only">Treatments offered</div>
                <ul
                  className="flex flex-wrap gap-1 pt-4"
                  aria-label="Treatments offered"
                >
                  {practitioner.Treatments &&
                    practitioner.Treatments.sort((a, b) => a.length - b.length)
                      .slice(0, 2)
                      .map((modality, index) => (
                        <li key={index}>
                          <Badge variant="outline" className="text-xs">
                            <Link
                              href={`/directory/treatments/${modality}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {modality
                                .split(" ") // split into words
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1),
                                ) // capitalize each
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
                            href={`/directory/treatments`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            +{practitioner.Treatments.length - 2} more
                          </Link>
                        </Badge>
                      </li>
                    )}
                </ul>
              </div>
            </>
          </Card>
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
                      <img
                        src={
                          practitioner.image_url?.replaceAll('"', "") ||
                          "/placeholder.svg"
                        }
                        alt="Product"
                        className="object-cover rounded-lg min-w-full min-h-full"
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
                            className="text-[11px] font-normal text-gray-500"
                          >
                            {value.price}
                          </Badge>
                        </li>
                      ))}
                  {practitioner.all_prices && (
                    <li>
                      <Badge
                        variant="outline"
                        className="text-[11px] font-normal text-gray-500"
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
      {isTreatment(practitioner) === true && (
        <Card
          asChild
          className="gap-0 h-full relative px-4 md:px-0 shadow-none md:border-0 duration-300 cursor-pointer"
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
                  <div className="flex w-full flex-row items-start border-0 md:flex-col md:items-center">
                    <div className="w-20 h-20 md:w-[150px] md:h-[150px] flex items-center justify-center overflow-hidden md:mb-3 mr-0">
                      <img
                        src={treatmentImageSrc}
                        alt="Treatment"
                        className="object-cover rounded-full w-full h-full"
                      />
                    </div>

                    <div className="mb-3 md:mb-0 flex text-left md:text-center md:align-items-center md:justify-center font-semibold text-md md:text-lg transition-colors text-balance">
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
          className="gap-0 relative shadow-none group transition-all duration-300 border-b border-t-0 border-[#C4C4C4] md:border md:border-(--alto) cursor-pointer hover:shadow-lg "
        >
          <Link href={cityHref}>
            <div className="mt-2 flex flex-col items-center gap-2">
              <Button className="w-1/2 text-center font-semibold text-md md:text-lg transition-colors text-balance bg-black cursor-pointer hover:bg-white hover:text-black">
                {practitioner}
              </Button>
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
          <Card className="gap-0 relative shadow-none group transition-all duration-300 border-b border-t-0 border-[#C4C4C4] md:border md:border-(--alto) cursor-pointer hover:shadow-lg ">
            <CardHeader className=" h-55 pb-4 px-2">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 md:w-[150px] md:h-[150px] flex items-center justify-center overflow-hidden rounded-lg bg-gray-300">
                  <img
                    src={
                      (
                        practitioner as unknown as {
                          name: string;
                          slug: string;
                          image_url: string;
                        }
                      ).image_url
                    }
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
