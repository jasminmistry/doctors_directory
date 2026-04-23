import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileHeader } from "@/components/Clinic/profile-header";
import { GoogleMapsEmbed } from "@/components/gmaps-embed";
import { boxplotDatas_clinic } from "@/lib/data";
import { BoxPlotDatum, ItemMeta } from "@/lib/types";
import { Stats } from "@/components/visx-donut";
import ClinicDetailsMarkdown from "@/components/Clinic/clinicDetailsMD";
import { Clinic } from "@/lib/types";
import { getClinicBySlug, getClinicsByCity } from "@/lib/data-access/clinics";
import ClinicTabs from "@/components/Clinic/clinicTabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import ItemsGrid from "@/components/collectionGrid";
import { capitalize, flattenObject } from "@/lib/utils";
import { Section } from "@/components/ui/section";
import { MoreItems } from "@/components/MoreItems";
import { locations } from "@/lib/data";
import { ScoreInfoTooltip } from "@/components/score-info-tooltip";
import { BestRankedBlock } from "@/components/best-ranked-block";
import { buildClinicRankedEntries } from "@/lib/best-ranked";
import { CityPricingContext } from "@/components/city-pricing-context";
import { buildCityTreatmentPriceInsights } from "@/lib/city-pricing";
function mergeBoxplotDataFromDict(
  base: BoxPlotDatum[],
  incoming: Record<string, ItemMeta>
): BoxPlotDatum[] {
  return base.map((datum) => {
    const matchItem = incoming[datum.label];
    const result = { ...datum, item: { ...datum.item, ...matchItem } };
    return result;
  });
}

interface ProfilePageProps {
  params: {
    cityslug: string;
    slug: string;
  };
}

// Helper to convert DB clinic to old Clinic type format
function convertDbClinicToOldType(dbClinic: any): Clinic {
  return {
    slug: dbClinic.slug || undefined,
    image: dbClinic.image || '',
    url: dbClinic.gmapsUrl || undefined,
    rating: dbClinic.rating ? Number(dbClinic.rating) : 0,
    reviewCount: dbClinic.reviewCount || 0,
    category: dbClinic.category || '',
    gmapsAddress: dbClinic.gmapsAddress || '',
    gmapsPhone: dbClinic.gmapsPhone || '',
    gmapsReviews: dbClinic.reviews?.map((r: any) => ({
      reviewer_name: r.reviewerName,
      rating: r.rating ? Number(r.rating) : 0,
      review_date: r.reviewDate,
      review_text: r.reviewText,
      owner_response: r.ownerResponse,
    })),
    reviewAnalysis: dbClinic.reviewAnalysis as any,
    weighted_analysis: dbClinic.weightedAnalysis as any,
    ranking: dbClinic.ranking ? {
      city_rank: dbClinic.ranking.cityRank,
      city_total: dbClinic.ranking.cityTotal,
      score_out_of_100: dbClinic.ranking.scoreOutOf100,
      subtitle_text: dbClinic.ranking.subtitleText,
    } : undefined,
    City: dbClinic.city?.name || '',
    facebook: dbClinic.facebook || '',
    twitter: dbClinic.twitter || '',
    Linkedin: dbClinic.linkedin || '',
    instagram: dbClinic.instagram || '',
    youtube: dbClinic.youtube || '',
    website: dbClinic.website || '',
    email: dbClinic.email || '',
    isSaveFace: dbClinic.isSaveFace,
    isDoctor: dbClinic.isDoctor,
    isJCCP: dbClinic.isJccp ? [dbClinic.isJccp, dbClinic.jccpUrl] : null,
    isCQC: dbClinic.isCqc ? [dbClinic.isCqc, dbClinic.cqcUrl] : null,
    isHIW: dbClinic.isHiw ? [dbClinic.isHiw, dbClinic.hiwUrl] : null,
    isHIS: dbClinic.isHis ? [dbClinic.isHis, dbClinic.hisUrl] : null,
    isRQIA: dbClinic.isRqia ? [dbClinic.isRqia, dbClinic.rqiaUrl] : null,
    about_section: dbClinic.aboutSection || '',
    accreditations: dbClinic.accreditations || '',
    awards: dbClinic.awards || '',
    affiliations: dbClinic.affiliations || '',
    hours: dbClinic.hours?.reduce((acc: any, h: any) => {
      acc[h.dayOfWeek] = h.hours;
      return acc;
    }, {}) || '',
    Practitioners: dbClinic.staff?.map((s: any) => s.fullName).join(', ') || '',
    Insurace: JSON.stringify(dbClinic.insuranceInfo || []),
    Payments: JSON.stringify(dbClinic.paymentMethods || []),
    Fees: JSON.stringify(dbClinic.fees?.map((f: any) => ({
      treatment: f.treatmentName,
      price: f.price,
    })) || []),
    x_twitter: dbClinic.xTwitter || '',
    Treatments: dbClinic.treatments?.map((t: any) => t.treatment.name) || [],
  } as Clinic;
}

export default async function ProfilePage({ params }: Readonly<ProfilePageProps>) {
  const { cityslug, slug } = params;
  const displayCityName = capitalize(cityslug);
  const normalizedCitySlug = decodeURIComponent(cityslug).toLowerCase();

  const dbClinic = await getClinicBySlug(slug);
  if (!dbClinic) {
    notFound();
  }

  const dbCityClinics = await getClinicsByCity(normalizedCitySlug);
  const clinic = convertDbClinicToOldType(dbClinic);
  const cityClinics = dbCityClinics
    .filter(c => c.slug !== slug)
    .map(convertDbClinicToOldType);
  const rankedCityClinics = buildClinicRankedEntries(cityClinics, 5);
  const uniqueTreatments = [
    ...new Set(
      cityClinics
        .filter(c => Array.isArray(c.Treatments))
        .flatMap(c => c.Treatments).filter((t): t is string => typeof t === "string")
    )
  ];
  const hoursObj = clinic?.hours as unknown as Record<string, any>;

  const hours =
    (hoursObj && typeof hoursObj === 'object' && hoursObj["Typical_hours_listed_in_directories"]) ?? clinic?.hours;
  const flatHours = typeof hoursObj === 'object' && hoursObj !== null ? flattenObject(hours) : hours

  const boxplotData = mergeBoxplotDataFromDict(
    boxplotDatas_clinic,
    clinic?.weighted_analysis ?? {}
  );

  const overallScore = Math.round(
    boxplotData.find((datum) => datum.label === "Overall Aggregation")?.item.weighted_score ?? 0
  );
  const rankingSubtitle =
    clinic?.ranking?.subtitle_text ?? `${overallScore}/100 in ${clinic?.City ?? displayCityName}`;

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <Link className="mb-2 inline-block" href="/" prefetch={false}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:cursor-pointer hover:bg-white hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Directory
            </Button>
          </Link>
        </div>
        <div className="container mx-auto max-w-6xl px-4 py-2">
          <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/directory">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/directory/clinics">Clinics</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/directory/clinics/${normalizedCitySlug}`}>{displayCityName}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{capitalize(clinic.slug!)}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl pt-0 md:px-4 py-20 space-y-8">
        <ProfileHeader clinic={clinic} />


        <div className="px-4 md:px-0">
          <ClinicTabs />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-10 mb-4">
            <div className="order-2 lg:order-1 col-span-1 lg:col-span-6">
              <ClinicDetailsMarkdown clinic={clinic} />
            </div>

            <div className="order-1 lg:order-2 col-span-1 lg:col-span-4">
              <div className="border border-gray-300 rounded-xl p-6">
                <div className="flex flex-row gap-2 pt-2 mb-4 items-center justify-center text-sm">
                  <div className="inline-flex items-center gap-1">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < clinic.rating ? "fill-black text-black" : "/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span
                    className="border-l border-black pl-2 underline"
                    aria-label={`${clinic.reviewCount} reviews`}
                  >
                    {clinic.reviewCount
                      ? clinic.reviewCount + "+ Reviews Analysed"
                      : "0"}
                  </span>
                </div>
                <div className="border-t border-gray-300 my-4"></div>
                <div className="mb-4 flex items-center justify-center gap-2">
                  <h3 className="text-center text-lg font-semibold text-foreground">
                    Consentz® Clinic Score
                  </h3>
                  <ScoreInfoTooltip entityLabel="clinic" />
                </div>
                <Stats data={boxplotData} />
                <p className="mt-3 text-xs font-bold text-black">
                  {rankingSubtitle}
                </p>
              </div>
              {/* HOURS */}
              {flatHours && (
                <Section title="Hours" id="hours">
                  <div className="overflow-x-auto shadow-none">
                    <table
                      className="w-full align-top text-sm bg-white border-collapse"
                      data-testid="hours"
                    >
                      <tbody>
                        {typeof flatHours === "object" ? (
                          Object.entries(flatHours).map(([day, time]) => (
                            <tr key={day}>
                              <td className="align-top border-0 px-1 py-1 font-medium">
                                {day?.toString()}
                              </td>
                              <td className="align-top border-0 px-1 py-1">
                                {time?.toString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>Not listed</tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Section>
              )}
              {/* PAYMENTS */}
              {clinic.Payments && (
                <Section title="Payment Options" id="payments">
                  {Array.isArray(clinic.Payments) ? (
                    <ul
                      className="list-disc ml-6 space-y-1"
                      data-testid="payments"
                    >
                      {clinic.Payments.map((p: any, idx: number) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  ) : clinic.Payments && typeof clinic.Payments === "object" ? (
                    <div className="overflow-x-auto shadow-none">
                      <table className="w-full text-sm bg-white">
                        <tbody>
                          {Object.entries(clinic.Payments).map(
                            ([k, v]) =>
                              k !== "Source" && (
                                <tr key={k}>
                                  <td className="border-0 px-4 py-2 font-medium">
                                    {k?.toString()}
                                  </td>
                                  <td className="border-0 px-4 py-2">
                                    {v?.toString()}
                                  </td>
                                </tr>
                              ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    clinic.Payments || "Not listed"
                  )}
                </Section>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <GoogleMapsEmbed
                  url={clinic.url}
                  className="w-full h-auto md:h-80"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 md:px-0 space-y-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">{`Top Treatments in ${displayCityName}`}</h3>
          <MoreItems items={uniqueTreatments} />
          <h3 className="text-lg font-semibold text-foreground mb-2">{`Top Cities in the UK`}</h3>
          <MoreItems items={locations} />
        </div>
        <div className="px-4 md:px-0 space-y-4">
          <BestRankedBlock
            title={`Best Clinics in ${clinic.City}`}
            entries={rankedCityClinics}
          />
          {cityClinics.length > 0 && (
            <CityPricingContext
              city={displayCityName}
              insights={buildCityTreatmentPriceInsights(cityClinics, displayCityName, 1)}
              variant="light"
            />
          )}
        </div>

      </div>
    </main>
  );
}

// export async function generateStaticParams() {

//   const filePath = path.join(process.cwd(), 'public', 'clinics_processed_new_data.json');
//   const fileContents = fs.readFileSync(filePath, 'utf-8');
//   const clinics: Clinic[] = JSON.parse(fileContents);
//   return clinics.map((clinic) => ({
//     cityslug: clinic.City,   // <-- MUST include this!
//     slug: clinic.slug,
//   }));
// }

export async function generateMetadata({ params }: ProfilePageProps) {
  const clinic = clinics.find((p) => p.slug === params.slug);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://staging.consentz.com";
  const citySlug = decodeURIComponent(params.cityslug).toLowerCase();
  const canonicalUrl = `${baseUrl}/directory/clinics/${citySlug}/clinic/${params.slug}`;

  if (!clinic) {
    return {
      title: "Clinic Not Found",
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  const clinicDisplayName = capitalize(clinic.slug!);
  const city = capitalize(params.cityslug);
  const topTreatments = Array.isArray(clinic.Treatments) ? clinic.Treatments.slice(0, 3).map(t => capitalize(t)) : [];
  const treatmentSuffix = topTreatments.length >= 3
    ? `${topTreatments[0]}, ${topTreatments[1]} & ${topTreatments[2]}`
    : topTreatments.length === 2
    ? `${topTreatments[0]} & ${topTreatments[1]}`
    : topTreatments.length === 1
    ? topTreatments[0]
    : 'Botox, Fillers & Skin Treatments';
  const title = `${clinicDisplayName} ${city} | Reviews, Prices & Booking - ${treatmentSuffix}`;
  const description = `Compare ${clinicDisplayName} in ${city}. See prices, reviews, treatments, and book consultations instantly.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: clinic.image,
          width: 1200,
          height: 630,
          alt: `${clinicDisplayName} profile picture`,
        },
      ],
    },
  };
}
