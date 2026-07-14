import { Clinic } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Section } from "../ui/section";
import { sanitizeDisplayText, toUrlSlug } from "@/lib/utils";

export default function ClinicDetailsSections({ clinic }: { clinic: Clinic }) {
  const countOccurrences = (str: string, substr: string) => {
    let count = 0;
    for (let i = 0; i < str.length; i++) {
      if (str.substr(i, substr.length) === substr) {
        count++;
      }
    }
    return count;
  };
  const parseList = (val: any) => {
    if (!val) return [];
    try {
       if (Array.isArray(val)) {
        console.log("isArray")
        return val;
      }
      
      if (typeof val === "string" && val.startsWith("[") && val.endsWith("]")) {
        if (countOccurrences(val, '"') > 0) {
          val = val.replaceAll("'", '').replaceAll('"', '').replaceAll("[","['").replaceAll("]","']").replaceAll(".,",".','")
        }
        return JSON.parse(val.replaceAll("'", '"'));
      }
     
    } catch (error) {
      console.log("parseList error: ",val,error)
      return [val];
    }
  };

  let flag = false;
  let edge_case_accreditations: any = [];
  let accreditations_array = []
  try {
    if(clinic.accreditations.includes("}")) {
      edge_case_accreditations = JSON.parse(clinic.accreditations.replaceAll("'", '"'))
      for (let i = 0; i < edge_case_accreditations.length; i++) {
        try {
          if (edge_case_accreditations[i]['Details'] !== undefined) {
          accreditations_array.push(edge_case_accreditations[i]['Details'])
          }
        } catch (error) {}
        try {
          if(edge_case_accreditations[i]['name'] !== undefined) {
          accreditations_array.push(edge_case_accreditations[i]['name'])
          }
        } catch (error) {}
    }
      flag =  true
  } 
} catch (error) {
    flag = false;
  }
  

  return (
    <div className="">
      {/* ABOUT */}
      <Section title={`About ${clinic.slug!.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}`} id="about" data-testid='about'>
        {sanitizeDisplayText(clinic.about_section) || "Not publicly listed"}
      </Section>

      <div className="border-t border-[#e0e0e0]  my-6"></div>

      {/* Treatments */}
      {clinic?.Treatments!.length > 0 && (
      <Section title="Treatments" id="treatments" data-testid='treatments'>
        <div className="flex flex-wrap gap-1">
          {clinic.Treatments &&
            clinic.Treatments?.map(
              (modality, index) => 
                { 
                  const treatments = modality.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

                  return (

                <Link key={modality} href={`/treatments/${toUrlSlug(modality)}`}>
                  <Badge variant="outline" className="text-md bg-gray-100 border-0">
                    {treatments}
                  </Badge>
                </Link> )}
              
            )}
        </div>
        <div className="border-t border-[#e0e0e0]  my-6"></div>
      </Section>
    )}

      

      {(clinic.aestheticsAwards && clinic.aestheticsAwards.length > 0) ||
      (clinic.tatlerGuideYears && clinic.tatlerGuideYears.length > 0) ? (
        <>
          <Section title="Accreditations" id="accreditations-prestige">
            <ul className="list-disc ml-6 space-y-1" data-testid="prestige-accreditations-list">
              {(clinic.aestheticsAwards ?? []).map((a) => (
                <li key={`${a.year}-${a.result}-${a.category}`}>
                  UK Aesthetics Awards — {a.result} {a.year} ({a.category})
                </li>
              ))}
              {(clinic.tatlerGuideYears ?? []).map((year) => (
                <li key={`tatler-${year}`}>
                  Tatler Beauty &amp; Cosmetic Surgery Guide — {year}
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-300 my-6"></div>
          </Section>
        </>
      ) : null}

      {clinic.accreditations.length > 2 && (
      <Section title="Accreditations" id="accreditations">
      {flag === false ? (
        Array.isArray(parseList(clinic.accreditations)) ? (
          <ul className="list-disc ml-6 space-y-1" data-testid="accreditations-list">
            {parseList(clinic.accreditations).map((a: string, i: number) => (
              <li key={i}>{sanitizeDisplayText(a)}</li>
            ))} 
          </ul>) : <ul className="list-disc ml-6 space-y-1" data-testid="accreditations-list">
            <li> "Not listed"</li></ul>
      ) : (
          <ul className="list-disc ml-6 space-y-1" data-testid="accreditations-list">
            {accreditations_array.map((a: string, i: number) => (
              <li key={i}>{sanitizeDisplayText(a).replaceAll("—", '')}
            </li>))}
          </ul>
      ) 
      }
      <div className="border-t border-[#e0e0e0]  my-6"></div>
      </Section>
      )
    }

      {clinic.Insurace && (
      <Section title="Insurance Accepted" id="insurance" data-testid='insurance'>
        {Array.isArray(clinic.Insurace) ? (
          <ul className="list-disc ml-6 space-y-1" data-testid = "insurance-list">
            {clinic.Insurace.map((i: any, idx: number) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        ) : clinic.Insurace && typeof clinic.Insurace === "object" ? (
          <div className="overflow-x-auto shadow-none">
            <table className="w-full text-sm bg-white">
              <tbody>
                {Object.entries(clinic.Insurace).map(
                  ([k, v]) =>
                    k !== "Source" && (
                      <tr key={k}>
                        <td className="align-top border-0 px-1 py-1 font-medium">
                          {k?.toString()}
                        </td>
                        <td className="align-top border-0 px-1 py-1">{
                        v?.toString()}</td>
                      </tr>
                    )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          clinic.Insurace || "Not listed"
        )}
        <div className="border-t border-[#e0e0e0]  my-6"></div>
      </Section>
      
      )
    }

      <Section title={`Estimated Fees in ${clinic.City}`} id="fees">
        {clinic.claimed && Array.isArray(clinic.Fees) && (clinic.Fees as Array<{ treatment?: string; price?: string }>).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-white">
              <thead>
                <tr>
                  <th className="border-0 px-1 py-1 text-left font-medium">Treatment</th>
                  <th className="border-0 px-1 py-1 text-left font-medium">Price</th>
                </tr>
              </thead>
              <tbody>
                {(clinic.Fees as Array<{ treatment?: string; price?: string }>).map((fee, idx) => (
                  <tr key={`${fee.treatment}-${idx}`}>
                    <td className="align-top border-0 px-1 py-1">{fee.treatment}</td>
                    <td className="align-top border-0 px-1 py-1">{fee.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Section>
    </div>
  );
}
