import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileHeader } from "@/components/Practitioner/profile-header";
import { GoogleMapsEmbed } from "@/components/gmaps-embed";
import { boxplotDatas_clinic } from "@/lib/data";
import { BoxPlotDatum, ItemMeta } from "@/lib/types";
import { Stats } from "@/components/visx-donut";
import ClinicDetailsMarkdown from "@/components/Practitioner/practitionerDetailsMD";
import { Practitioner } from "@/lib/types";
import PractitionerTabs from "@/components/Practitioner/PractitionerTabs";
import { flattenObject, capitalize } from "@/lib/utils";
import { Section } from "@/components/ui/section";
import ItemsGrid from "@/components/collectionGrid";
import { MoreItems } from "@/components/MoreItems";
import { locations } from "@/lib/data";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { ScoreInfoTooltip } from "@/components/score-info-tooltip";
import { BestRankedBlock } from "@/components/best-ranked-block";
import { buildPractitionerRankedEntries } from "@/lib/best-ranked";
import { toDirectoryCanonical } from "@/lib/seo";
import { getPractitionerBySlug, getAllPractitionersForSearch } from "@/lib/data-access/practitioners";
import { getAllTreatmentNames } from "@/lib/data-access/treatments";

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

export default async function ProfilePage({ params }: Readonly<ProfilePageProps>) {
  const { slug } = params;

  const [clinic, allPractitioners, uniqueTreatments] = await Promise.all([
    getPractitionerBySlug(slug),
    getAllPractitionersForSearch(),
    getAllTreatmentNames(),
  ])

  if (!clinic) {
    notFound();
  }

  const hoursObj = clinic.hours as unknown as Record<string, any>;
  const hours = hoursObj?.["Typical_hours_listed_in_directories"] ?? clinic.hours;
  const flatHours = typeof hours === 'object' ? flattenObject(hours) : hours

  const practitioner = clinic
  const currentCity = practitioner.City?.toLowerCase()

  const rankedCityPractitioners = buildPractitionerRankedEntries(
    allPractitioners
      .filter((entry) => entry.practitioner_name !== clinic.practitioner_name)
      .filter((entry) => entry.City?.toLowerCase() === currentCity),
    5
  )

  const boxplotData = mergeBoxplotDataFromDict(
    boxplotDatas_clinic,
    clinic?.weighted_analysis ?? {}
  );

  const overallScore = Math.round(
    boxplotData.find((datum) => datum.label === "Overall Aggregation")?.item.weighted_score ?? 0
  );
  const rankingSubtitle =
    practitioner?.ranking?.subtitle_text ?? `${overallScore}/100 in ${practitioner?.City ?? "City"}`;

  const associatedClinics: string[] = JSON.parse(clinic.Associated_Clinics ?? '[]')

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="sticky top-0 z-10">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <Link className="mb-2 inline-block" href="/" prefetch={false}>
            <Button variant="ghost" size="sm" className="gap-2 hover:cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              Back to Directory
            </Button>
          </Link>
          <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/directory">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/directory/practitioners">Practitioners</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/directory/practitioners/${practitioner.City}`}>{`${practitioner.City}`}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{`${practitioner.practitioner_name}`}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        </div>
       </div>

       <div className="container mx-auto max-w-6xl pt-0 md:px-4 py-20 space-y-8">
               {/* Profile Header */}
               <ProfileHeader clinic={clinic} k_value={practitioner as any} clinic_list={associatedClinics} />

               <div className="px-4 md:px-0">
                 <PractitionerTabs />

                 <div className="grid grid-cols-1 gap-8 lg:grid-cols-10 mb-4">
                   <div className="order-2 lg:order-1 col-span-1 lg:col-span-6">
                     <ClinicDetailsMarkdown clinic={practitioner} />
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
                                   i < (practitioner.rating ?? 0)
                                     ? "fill-black text-black"
                                     : "/30"
                                 }`}
                               />
                             ))}
                           </div>
                         </div>
                         <span
                           className="border-l border-black pl-2 underline"
                           aria-label={`${practitioner.reviewCount} reviews`}
                         >
                           {practitioner.reviewCount ? practitioner.reviewCount+"+ Reviews Analysed" : "0"}
                         </span>
                       </div>
                       <div className="border-t border-gray-300 my-4"></div>
                       <div className="mb-4 flex items-center justify-center gap-2">
                         <h3 className="text-center text-lg font-semibold text-foreground">
                           Consentz® Practitioner Score
                         </h3>
                         <ScoreInfoTooltip entityLabel="practitioner" />
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
                    <table className="w-full align-top text-sm bg-white border-collapse" data-testid='hours'>
                      <tbody>
                        {typeof flatHours === 'object' ? Object.entries(flatHours).map(([day, time]) => (
                          <tr key={day}>
                            <td className="align-top border-0 px-1 py-1 font-medium">
                              {day?.toString()}
                            </td>
                            <td className="align-top border-0 px-1 py-1">
                              {time?.toString()}
                            </td>
                          </tr>
                        )):<tr>Not listed</tr>}
                      </tbody>
                    </table>
                  </div>
                </Section>
              )}
              {/* PAYMENTS */}
              {practitioner.Payments && (
              <Section title="Payment Options" id="payments">
                {Array.isArray(practitioner.Payments) ? (
                  <ul className="list-disc ml-6 space-y-1" data-testid="payments">
                    {(practitioner.Payments as any[]).map((p: any, idx: number) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                ) : practitioner.Payments && typeof practitioner.Payments === "object" ? (
                  <div className="overflow-x-auto shadow-none">
                    <table className="w-full text-sm bg-white">
                      <tbody>
                        {Object.entries(practitioner.Payments as any).map(
                          ([k, v]) =>
                            k !== "Source" && (
                              <tr key={k}>
                                <td className="border-0 px-4 py-2 font-medium">
                                  {k?.toString()}
                                </td>
                                <td className="border-0 px-4 py-2">
                                  {(v as any)?.toString()}
                                </td>
                              </tr>
                            )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  String(practitioner.Payments) || "Not listed"
                )}
              </Section>)}
              <div className='flex flex-col sm:flex-row gap-2'>


                     <GoogleMapsEmbed
                 url={practitioner.url}

                 className="w-full h-auto md:h-80"
               />

             </div>

                   </div>
                 </div>



                </div>
                 <div className="px-4 md:px-0 space-y-6">
                   <h3 className="text-lg font-semibold text-foreground mb-2">{`Top Treatments in ${practitioner.City}`}</h3>
                   <MoreItems items={uniqueTreatments} />
                   <h3 className="text-lg font-semibold text-foreground mb-2">{`Top Cities in the UK`}</h3>
                   <MoreItems items={locations} />
                 </div>
                 <div className="px-4 md:px-0 space-y-4">
                   <BestRankedBlock
                     title={`Best Practitioners in ${practitioner.City}`}
                     entries={rankedCityPractitioners}
                   />
                 </div>
              </div>

    </main>
  );
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const clinic = await getPractitionerBySlug(params.slug)
  const citySlug = decodeURIComponent(params.cityslug).toLowerCase();
  const canonicalSlug = decodeURIComponent(params.slug).toLowerCase();
  const canonicalUrl = toDirectoryCanonical(
    `/practitioners/${citySlug}/profile/${canonicalSlug}`
  );

  if (!clinic) {
    return {
      title: "Practitioner Not Found",
      alternates: { canonical: canonicalUrl },
    };
  }

  const practitionerDisplayName = capitalize(clinic.practitioner_name!);
  const city = capitalize(citySlug);

  let topTreatments: string[] = [];
  if (Array.isArray(clinic.Treatments) && clinic.Treatments.length > 0) {
    topTreatments = clinic.Treatments.slice(0, 2).map(t => capitalize(t));
  }

  const treatments = topTreatments.length >= 2
    ? `${topTreatments[0]}, ${topTreatments[1]} & Reviews`
    : topTreatments.length === 1
    ? `${topTreatments[0]} & Reviews`
    : "Aesthetic Treatments & Reviews";
  const title = `${practitionerDisplayName} ${city} | ${treatments}`;
  const description = `Compare ${practitionerDisplayName} in ${city}. See prices, reviews, treatments, and book consultations instantly.`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
  };
}
