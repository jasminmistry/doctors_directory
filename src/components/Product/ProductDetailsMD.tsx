// New component rewriting markdown renderer into section-based layout
// Matching the design shown in the reference image (clean sections, headings, lists, tables)

import { Product } from "@/lib/types";
import { fixPythonArrayString, parseList, decodeUnicodeEscapes} from "@/lib/utils";
import { Section } from "@/components/ui/section";
export default function PractitionerDetailsSections({
  clinic,
}: Readonly<{
  readonly clinic: Product;
}>) {
  
  

  function renderList(val: any) {
  if (!val) return "Not publicly listed";

    let list = Array.isArray(val) ? val : parseList(fixPythonArrayString(val));
    if (!list.length) return "Not publicly listed";
    // If first element is an object, convert its key-value pairs to array of strings
    if (typeof list[0] === "object" && !Array.isArray(list[0])) {
      list = Object.entries(list[0]).map(([key, value]) => `${key.replace(/_/g, ' ')}: ${String(value)}`);
    }
    return (
      <ul className="list-disc ml-6 space-y-1">
        {list.map((a: string, i: number) => (
          <li key={i}>{a}</li>
        ))}
      </ul>
    );
}

  return (
    <div>
  

      <Section title="Description" id="description">
        {decodeUnicodeEscapes(clinic.description)}
      </Section>
      <div className="border-t border-gray-300 my-6"></div>
 
      <Section title="Bnefits" id="benefits">
         {renderList(clinic.key_benefits)}
      </Section>
      <div className="border-t border-gray-300 my-6"></div>
     
      <Section title="Indications" id="indications">
        {renderList(clinic.indications)}
      </Section> 
      <div className="border-t border-gray-300 my-6"></div>

      <Section title="Composition" id="composition">
        {(() => {
          const comp = Array.isArray(clinic?.composition)
            ? clinic.composition
            : (typeof clinic?.composition === 'string' ? JSON.parse(clinic.composition) : null)
          if (Array.isArray(comp) && comp.length > 0 && comp[0]?.['component'] !== undefined) {
            return comp.map((item: any, index: number) => (
              <div key={index}>
                <ul className="list-disc ml-6 space-y-1">
                  {item['ingredients_INCI']?.map((a: string, i: number) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            ))
          }
          return renderList(clinic.composition)
        })()}
      </Section>
      <div className="border-t border-gray-300 my-6"></div>
  
      <Section title="Formulation" id="formulation">
        {renderList(clinic.formulation)}
      </Section>
      <div className="border-t border-gray-300 my-6"></div>

      <Section title="Packaging" id="packaging">
        {renderList(clinic.packaging)}
      </Section>
      <div className="border-t border-gray-300 my-6"></div>
 
      <Section title="Usage" id="usage">
        {renderList(clinic.usage_instructions)}
      </Section>
      <div className="border-t border-gray-300 my-6"></div>
      <Section title="Contraindications" id="contraindications">
        {renderList(clinic.contraindications)}
      </Section>
      <div className="border-t border-gray-300 my-6"></div>
      <Section title="Adverse Effects" id="adverse_effects">
        {renderList(clinic.adverse_effects)}
      </Section>
      <div className="border-t border-gray-300 my-6"></div>
      <Section title="Storage Conditions" id="storage_conditions">
        {renderList(clinic.storage_conditions)}
      </Section>
      <div className="border-t border-gray-300 my-6"></div>
      <Section title="Duration" id="duration">
        {clinic.treatment_duration}
      </Section>
      <div className="border-t border-gray-300 my-6"></div> 
      <Section title="Onset" id="onset_of_effect">
        {clinic.onset_of_effect}
      </Section>
      {clinic.all_prices &&
              clinic.all_prices
                .map((value: any, index:number) => (
                
                    <div key={index}>
                      <table className="w-full mb-6 table-fixed">
                        <thead>
                          <tr>
                            <th className="border-none md:w-[20%] border-gray-300 p-2 text-left">
                              Price
                            </th>
                            <th className="border-none border-gray-300 p-2 text-left">
                              Link
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border-none md:w-[20%] border-gray-300 p-2 text-left">
                              {value.price}
                            </td>
                            <td className="border-none border-gray-300 p-2 text-left">
                              <a href={value.url} className="break-words whitespace-normal" target="_blank" rel="noreferrer">
                                {value.url}
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                ))}
    </div>
  );
}

