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
import { flattenObject } from "@/lib/utils";
import { Section } from "@/components/ui/section";
import { Clinic } from "@/lib/types";
import ItemsGrid from "@/components/collectionGrid";
import { MoreItems } from "@/components/MoreItems";
import { locations } from "@/lib/data";
import { readJsonFileSync } from "@/lib/json-cache";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { ScoreInfoTooltip } from "@/components/score-info-tooltip";
import { BestRankedBlock } from "@/components/best-ranked-block";
import { buildPractitionerRankedEntries } from "@/lib/best-ranked";
const clinicsData: Clinic[] = readJsonFileSync('clinics_processed_new_data.json')
const clinics = clinicsData
  const clinicIndex = new Map(
  clinics.filter(c=>c.slug !== undefined).map(c => [c.slug!, c])
)

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
    slug: string;
  };
}

export default function ProfilePage({ params }: Readonly<ProfilePageProps>) {
  const clinics: Practitioner[] = readJsonFileSync('derms_processed_new_5403.json');
  const { slug } = params;
  const clinic = clinics.find((p) => p.practitioner_name === slug);
  const k = clinicIndex.get(JSON.parse(clinic!.Associated_Clinics!)[0])
  const hoursObj = k?.hours as unknown as Record<string, any>;
  const hours =
    hoursObj["Typical_hours_listed_in_directories"] ?? k?.hours;
  const flatHours = typeof hoursObj === 'object' ? flattenObject(hours) : hours
  const practitioner = {...k,...clinic}
  const rankedCityPractitioners = buildPractitionerRankedEntries(
    clinics.filter(
      (entry) =>
        entry.City?.toLowerCase() === practitioner.City?.toLowerCase() &&
        entry.practitioner_name !== clinic?.practitioner_name
    ),
    5
  )
  const cityClinics = Array.from(clinicIndex.values())
  .filter(clinic => clinic.City === practitioner.City)
  const uniqueTreatments = [
  ...new Set(
    cityClinics
      .filter(c => Array.isArray(c.Treatments))
      .flatMap(c => c.Treatments).filter((t): t is string => typeof t === "string")
  )
];
  

  const boxplotData = mergeBoxplotDataFromDict(
    boxplotDatas_clinic,
    clinic?.weighted_analysis ?? {}
  );

  const overallScore = Math.round(
    boxplotData.find((datum) => datum.label === "Overall Aggregation")?.item.weighted_score ?? 0
  );
  const rankingSubtitle =
    practitioner?.ranking?.subtitle_text ?? `${overallScore}/100 in ${practitioner?.City ?? "City"}`;

  if (!clinic) {
    notFound();
  }

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
               <ProfileHeader clinic={clinic} k_value={k} clinic_list ={JSON.parse(clinic!.Associated_Clinics!)} />

               <div className="px-4 md:px-0">
                 <BestRankedBlock
                   title={`Best Practitioners in ${practitioner.City}`}
                   entries={rankedCityPractitioners}
                 />
               </div>

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
                                   i < k!.rating
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
              {k?.Payments && (
              <Section title="Payment Options" id="payments">
                {Array.isArray(k?.Payments) ? (
                  <ul className="list-disc ml-6 space-y-1" data-testid="payments">
                    {k?.Payments.map((p: any, idx: number) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                ) : k?.Payments && typeof k?.Payments === "object" ? (
                  <div className="overflow-x-auto shadow-none">
                    <table className="w-full text-sm bg-white">
                      <tbody>
                        {Object.entries(k?.Payments).map(
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
                            )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  k?.Payments || "Not listed"
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
              </div>

    </main>
  );
}

// export async function generateStaticParams() {

//   const filePath = path.join(process.cwd(), 'public', 'derms_processed.json');
//   const fileContents = fs.readFileSync(filePath, 'utf-8');
//   const clinics: Practitioner[] = JSON.parse(fileContents);
//   return clinics.map((clinic) => ({
//     slug: clinic.practitioner_name,
//   }));
// }

export async function generateMetadata({ params }: ProfilePageProps) {
  const clinics: Practitioner[] = readJsonFileSync('derms_processed_new_5403.json');
  const clinic = clinics.find((p) => p.practitioner_name === params.slug);

  if (!clinic) {
    return {
      title: "Practitioner Not Found",
    };
  }

  const clinicName = clinic.practitioner_name;

  return {
    title: `${clinicName} - Healthcare Directory`,
    description: `View the profile of ${clinicName}, a qualified ${clinic.practitioner_title} offering professional healthcare services. Read reviews and book appointments.`,
  };
}