"use client"
import {
  MapPin,
  Phone,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Clinic } from "@/lib/types";
import SocialMediaIcons from "../Clinic/clinicSocialMedia";
import ClinicLabels from "./clinicLabels";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
interface ProfileHeaderProps {
  clinic: Clinic;
}

export function ProfileHeader({ clinic }: Readonly<ProfileHeaderProps>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const returnTo = queryString ? `${pathname}?${queryString}` : pathname;
  const practitionerName = clinic.slug!
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  const roleTitle = clinic.category;

  return (
    <Card className="relative md:mt-2 flex flex-col gap-6 md:rounded-xl px-0 md:px-6 py-6 relative shadow-none group transition-all duration-300 md:rounded-27 border-t border-b border-[#C4C4C4] md:border-t md:border md:border-(--alto) bg-white md:bg-(--primary-bg-color)">
      <Link
        prefetch={false}
        href={{
          pathname: `/admin/clinics/${clinic.slug}`,
          query: { returnTo },
        }}
      >
        <Badge
          variant="outline"
          className="absolute top-2 right-2 z-50 mb-2 font-semibold text-balance leading-tight bg-white md:bg-(--primary-bg-color)"
        >
          Claim Profile
        </Badge>
      </Link>
      <div className="px-4 md:px-0 grid grid-cols-1 lg:grid-cols-[4fr_1fr] gap-4 items-center">
        <div className="flex flex-col md:flex-col md:mb-4 md:px-4 md:px-0 lg:mb-0 items-start gap-4 border-b border-[#C4C4C4] md:border-0">
          <div className="flex flex-row flex-wrap items-start md:items-center">
            <div className="relative w-[80px] h-[80px] md:w-[160px] md:h-[160px] flex items-center justify-center overflow-hidden rounded-full bg-grey-300 mr-4">
              <img
                src={
                  clinic.image.replace("&w=256&q=75", "") || "/placeholder.svg"
                }
                alt={"/placeholder.svg"}
                className="object-cover rounded-full min-w-full min-h-full"
                onError={(e) => {
                  e.currentTarget.onerror = null; // prevent infinite loop
                  e.currentTarget.src =
                    "/directory/images/default-dr-profile-1.webp";
                }}
              />
            </div>

            <div className="flex flex-col w-[calc(100%-96px)] md:w-[calc(100%-196px)]">
              <div className="flex w-full md:w-auto flex-col md:flex-row gap-2 mb-2 items-start md:items-center">
                <h1 className="inline text-left mb-0 md:m-0 font-semibold text-md md:text-2xl transition-colors md:text-left">
                  {practitionerName}
                </h1>
                <ClinicLabels clinic={clinic} />
              </div>

              <div className="flex flex-row gap-2 mb-3 items-center">
                <p className="text-muted-foreground mb-2 font-semibold text-balance leading-tight">
                  {roleTitle}
                </p>
              </div>

              <div className="hidden md:block gap-0 flex items-center md:items-start flex-col ">
                <address className="mb-2 not-italic text-sm leading-relaxed flex items-start justify-start sm:items-start gap-2">
                  <MapPin
                    className="h-4 w-4 mt-1 shrink-0 "
                    aria-hidden="true"
                  />
                  <span className="block max-w-[300px] break-words sm:whitespace-normal">
                    {clinic.gmapsAddress}
                  </span>
                </address>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center text-sm">
                    <Phone className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                    {clinic.gmapsPhone}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="block md:hidden gap-0 flex items-start md:mb-4 md:items-start flex-col ">
          <address className="mb-2 not-italic text-sm leading-relaxed flex items-start justify-start sm:items-start gap-2">
            <MapPin className="h-4 w-4 mt-1 shrink-0 " aria-hidden="true" />
            <span className="block max-w-[300px] break-words sm:whitespace-normal">
              {clinic.gmapsAddress}
            </span>
          </address>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center text-sm">
              <Phone className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              {clinic.gmapsPhone}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 justify-center">
          <Button
            variant="default"
            className="shadow-none h-auto rounded-lg text-md px-7 py-3 text-white hover:cursor-pointer"
          >
            Request Consultation
          </Button>
          <Button
            variant="outline"
            className="shadow-none border-black h-auto rounded-lg text-md px-7 py-3 hover:cursor-pointer"
          >
            Request Pricing
          </Button>
          <SocialMediaIcons clinic={clinic} />
        </div>
      </div>
    </Card>
  );
}
