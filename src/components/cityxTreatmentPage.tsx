import { City } from "@/lib/types"
import { fixMojibake, decodeUnicodeEscapes } from "@/lib/utils"
type PageProps = {cityData: City, treatment: Record<string, any>, slug: string}
type TreatmentSection = Record<string, unknown>

function cleanText(text: string) {
  return decodeUnicodeEscapes(fixMojibake(fixMojibake(fixMojibake(text.trim()))))
}
function createBullets(text: unknown) {
  const normalizedText = Array.isArray(text)
    ? text.filter((item): item is string => typeof item === "string").join("; ")
    : typeof text === "string"
      ? text
      : ""

  if (!normalizedText.trim()) {
    return null
  }

  const splitText = normalizedText
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)

  if (splitText.length <= 1) {
    return decodeUnicodeEscapes(normalizedText)
  }

  return (
    <div className='mt-2 space-y-2'>
      <ul className="list-disc list-inside pl-6 space-y-1">
        {splitText.map((item, key) => {
          const cleanedItem = decodeUnicodeEscapes(
            fixMojibake(fixMojibake(fixMojibake(item)))
          )

          return (
            <li className="text-sm leading-relaxed pl-6" key={key}>
              {cleanedItem.trim().charAt(0).toUpperCase() + cleanedItem.trim().slice(1)}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
function deepClean<T>(obj: T): T {
  if (typeof obj === "string") {
    return cleanText(obj) as T
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClean(item)) as T
  }

  if (typeof obj === "object" && obj !== null) {
    const result: any = {}
    for (const key in obj) {
      result[key] = deepClean(obj[key])
    }
    return result
  }

  return obj
}

function asRecord(value: unknown): TreatmentSection {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as TreatmentSection
  }
  return {}
}

function getRecordValueByKey(section: TreatmentSection, key: string): unknown {
  const matchedKey = Object.keys(section).find(
    (sectionKey) => sectionKey.toLowerCase() === key.toLowerCase()
  )
  return matchedKey ? section[matchedKey] : undefined
}

function toList(value: unknown, preferredKeys: readonly string[] = []): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string")
  }

  if (typeof value === "string") {
    return [value]
  }

  const section = asRecord(value)

  for (const key of preferredKeys) {
    const preferredValue = getRecordValueByKey(section, key)
    if (Array.isArray(preferredValue)) {
      return preferredValue.filter((item): item is string => typeof item === "string")
    }
    if (typeof preferredValue === "string") {
      return [preferredValue]
    }
  }

  const discoveredLists = Object.values(section).filter(Array.isArray)
  if (discoveredLists.length > 0) {
    const firstList = discoveredLists[0]
    return firstList.filter((item): item is string => typeof item === "string")
  }

  return Object.values(section).filter((item): item is string => typeof item === "string")
}

function toText(value: unknown, preferredKeys: readonly string[] = []): string {
  if (typeof value === "string") {
    return value
  }

  const listValue = toList(value, preferredKeys)
  if (listValue.length > 0) {
    return listValue[0]
  }

  return ""
}

export function CityTreatmentPage({ cityData, treatment, slug }: PageProps) {
    const sections = Object.entries(deepClean(treatment))
    const getSection = (...phrases: readonly string[]) =>
      sections.find(([key]) =>
        phrases.some((phrase) => key.toLowerCase().includes(phrase.toLowerCase()))
      )?.[1]

    const description = toText(getSection("what is", "how does it work"), ["description"])
    const goals = toList(getSection("goals"), ["goals"])
    const pros = toList(getSection("pros and cons"), ["pros", "Pros"])
    const cons = toList(getSection("pros and cons"), ["cons", "Cons"])
    const costSection = asRecord(getSection("cost"))
    const alternatives = toList(
      getSection("non-surgical", "alternative options", "compare"),
      ["comparison"]
    )
    const candidateSection = getSection("good candidate")
    const candidates = toList(candidateSection, ["typical", "notIdeal"])
    const preparation = toList(getSection("prepare for"), ["advice"])
    const maintenanceText = toText(getSection("maintenance sessions"), ["maintenance", "notes"])
    const safetySection = asRecord(getSection("safety considerations", "painful"))
    const qualifications = toList(
      getSection("qualifications should a practitioner", "what qualifications"),
      ["whatToSeek"]
    )
    const guidelinesText = toText(getSection("guidelines for", "mhra"), ["guidelines"])
    const recoverySection = asRecord(getSection("recovery process", "downtime", "side effects"))
    const clinicAdvice = toList(
      getSection("look for when choosing a doctor", "look for when choosing"),
      ["advice"]
    )
    const treatmentName = slug.split("%20").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    return (
        <>
  {/* ================= HERO ================= */}
    <div className='bg-white p-4 rounded rounded-lg mb-4'> 
  
    <h2 className="text-sm md:text-2xl font-semibold mb-1 md:mb-2 mt-2">{treatmentName} Treatment in {cityData.City}</h2>
    <section className='text-muted-foreground gap-2 space-y-2'>
      <div>{description}</div>
      <div>
      Our dataset currently has {cityData.market_size_indicators_number_of_clinics} clinic(s),
      with approximately {cityData.market_size_indicators_review_volume_total} reviews and
      an average rating of {cityData.market_size_indicators_average_rating_citywide}.
    </div>
      <div>
      <strong><h3>Medical Infrastructure:</h3></strong>
      </div>
      <ul className="list-disc list-inside">
        {createBullets(cityData.city_overview_medical_infrastructure_presence)}
      </ul>

      <div>
      <strong><h3>Local Aethetics Market:</h3></strong>
      </div>
      <ul className="list-disc list-inside">
        {createBullets(cityData.beauty_spend_indicators_market_maturity_level)}
      </ul>

       
  </section>


  {/* ================= GOALS ================= */}

  
     <h2 className="text-sm md:text-2xl font-semibold mb-1 md:mb-2 mt-2">Goals of {treatmentName} Treatment</h2>
      <section className='text-muted-foreground gap-2 space-y-2'>
       
    <ul className="list-disc list-inside">
      {goals.map((goal: string, index:number) => (
        <li className="text-sm leading-relaxed pl-6" key={index}>{goal}</li>
      ))}
    </ul>
     


    
  </section>

  {/* ================= TREATMENT OPTIONS ================= */}


     <h2 className="text-sm md:text-2xl font-semibold mb-1 md:mb-2 mt-2">{treatmentName} Treatment Options</h2>
      <section className='text-muted-foreground gap-2 space-y-2'>
      


    <h4><strong>Medical & Non-Surgical Approaches</strong></h4>
    <ul className="list-disc list-inside">
      {alternatives.map(
        (item:string, index:number) => (
          <li className="text-sm leading-relaxed pl-6" key={index}>{item}</li>
        )
      )}
    </ul>

    <h4><strong>Pros of {treatmentName} Treatment</strong></h4>
    <ul className="list-disc list-inside">
      {pros.map((pro: string, index:number) => (
        <li className="text-sm leading-relaxed pl-6" key={index}>{pro}</li>
      ))}
    </ul>

    <h4><strong>Cons of {treatmentName} Treatment</strong></h4>
    <ul className="list-disc list-inside">
      {cons.map((con: string, index:number) => (
        <li className="text-sm leading-relaxed pl-6" key={index}>{con}</li>
      ))}
    </ul>

  </section>



  {/* ================= COST ================= */}


     <h2 className="text-sm md:text-2xl font-semibold mb-1 md:mb-2 mt-2">Cost of {treatmentName} Treatment in {cityData.City}</h2>
      <section className='text-muted-foreground gap-2 space-y-2'>
    <div className='mt-2 space-y-2'>
         <ul className="list-disc list-inside">
          {Object.entries(costSection).map(([key, value]) => {
            if(Array.isArray(value)) {
              return value.map((item:string, index:number) => (
                <li className="text-sm leading-relaxed pl-6" key={`${key}-${index}`} >{cleanText(item)}</li>
              ))
            }
            else return ( <li className="text-sm leading-relaxed pl-6" key={key} >{cleanText(value as string)}</li>)
          })}
          </ul>
      </div>

    
  </section>

  {/* ================= ACCESSIBILITY ================= */}


     <h2 className="text-sm md:text-2xl font-semibold mb-1 md:mb-2 mt-2">Accessibility</h2>
          <section className='text-muted-foreground gap-2 space-y-2'>

      <div>
      <strong><h3>Public transport:</h3></strong>
      
      <ul className="list-disc list-inside">
        {createBullets(cityData.accessibility_factors_public_transport_proximity)}
      </ul></div>

      <div>
      <strong><h3>Parking availability:</h3></strong>
      
      <ul className="list-disc list-inside">
        {createBullets(cityData.accessibility_factors_parking_availability)}
      </ul></div>
      
      <div>
      <strong><h3>Clinic distribution:</h3></strong>
      
      <ul className="list-disc list-inside">
        {createBullets(cityData.accessibility_factors_city_centre_vs_suburban_distribution)}
      </ul></div>
      
      <div>
      <strong><h3>Airport proximity:</h3></strong>
      
      <ul className="list-disc list-inside">
        {createBullets(cityData.medical_tourism_potential_airport_proximity)}
      </ul></div>
      

  </section>

  {/* ================= APPOINTMENT PREPARATION ================= */}

  
     <h2 className="text-sm md:text-2xl font-semibold mb-1 md:mb-2 mt-2">Preparing for Your {treatmentName} Appointment</h2>
          <section className='text-muted-foreground gap-2 space-y-2'>
    <ul className="list-disc list-inside">
      {preparation.map((item: string, index:number) => (
        <li className="text-sm leading-relaxed pl-6" key={index}>{item}</li>
      ))}
    </ul>

    <div>{maintenanceText}</div>
  </section>

  {/* ================= SAFETY ================= */}


     <h2 className="text-sm md:text-2xl font-semibold mb-1 md:mb-2 mt-2">Treatment Safety & Local Regulations</h2>
     <section className='text-muted-foreground gap-2 space-y-2'>
      
    <div>{Object.entries(safetySection).map(([key, value]) => <p key={key}>{value as string}</p>)}</div>
 

    <ul className="list-disc list-inside">
      {qualifications.map(
        (item: string, index:number) => (
          <li className="text-sm leading-relaxed pl-6" key={index}>{item}</li>
        )
      )}
    </ul>
      <div>{guidelinesText}</div>
    

      <div>
      <strong><h3>Local regulatory authority:</h3></strong>
      
      <ul className="list-disc list-inside">
        {createBullets(cityData.regulatory_environment_primary_regulator)}
      </ul></div>
    <div>
      <strong><h3>Private insurance usage locally:</h3></strong>
      
      <ul className="list-disc list-inside">
        {createBullets(cityData.insurance_and_financing_private_insurance_usage)}
      </ul></div>
      <div>
      <strong><h3>Cosmetic finance availability:</h3></strong>
      
      <ul className="list-disc list-inside">
        {createBullets(cityData.insurance_and_financing_cosmetic_finance_availability)}
      </ul></div>
   
  </section>



  {/* ================= CANDIDATES ================= */}


     <h2 className="text-sm md:text-2xl font-semibold mb-1 md:mb-2 mt-2">Who Is a Good Candidate?</h2>
      <section className='text-muted-foreground gap-2 space-y-2'>
    <ul className="list-disc list-inside">
      {candidates.map(
        (candidate: string, index:number) => (
          <li className="text-sm leading-relaxed pl-6" key={index}>{candidate}</li>
        )
      )}
    </ul>
  </section>

  {/* ================= PRACTITIONER SELECTION ================= */}


     <h2 className="text-sm md:text-2xl font-semibold mb-1 md:mb-2 mt-2">Choosing a Clinic</h2>
      <section className='text-muted-foreground gap-2 space-y-2'>
    <ul className="list-disc list-inside">
      {qualifications.map(
        (qual: string, index:number) => (
          <li className="text-sm leading-relaxed pl-6" key={index}>{qual}</li>
        )
      )}

      {clinicAdvice.map(
        (item: string, index:number) => (
          <li className="text-sm leading-relaxed pl-6" key={`look-${index}`}>{item}</li>
        )
      )}
    </ul>

    <div>
      Current average rating citywide:{" "}
      {cityData.market_size_indicators_average_rating_citywide}
    </div>
  </section>

  {/* ================= RECOVERY ================= */}


     <h2 className="text-sm md:text-2xl font-semibold mb-1 md:mb-2 mt-2">Recovery & Long-Term Results</h2>
      <section className='text-muted-foreground gap-2 space-y-2'>
        <div className='mt-2 space-y-2'>
         <ul className="list-disc list-inside">
          {Object.entries(recoverySection).map(([key, value]) => {
            if(Array.isArray(value)) {
              return value.map((item:string, index:number) => (
                <li className="text-sm leading-relaxed pl-6" key={`${key}-${index}`} >{cleanText(item)}</li>
              ))
            }
            else return ( <li className="text-sm leading-relaxed pl-6" key={key} >{cleanText(value as string)}</li>)
          })}
          </ul>
      </div>
  
          <div><strong>Aftercare:</strong></div>
    <ul className="list-disc list-inside">
      {alternatives.length > 0 ? alternatives.map((item: string, index:number) => (
        <li className="text-sm leading-relaxed pl-6" key={index}>{item}</li>
      )) : <li className="text-sm leading-relaxed pl-6">{toText(getSection("compare", "alternative options"))}</li>}
    </ul>
  </section></div>
</>
    )
}