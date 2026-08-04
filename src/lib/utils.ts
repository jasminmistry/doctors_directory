import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Accreditation, Clinic, Practitioner, Product } from "./types"
import { modalities, locations, accreditations, cityMap } from "./data"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Booking slot times are always shown in the clinic's own timezone (never the
 * visitor's browser timezone) — this renders the short abbreviation, e.g.
 * "Europe/London" -> "GMT" or "BST" depending on the date shown.
 */
export function formatTimezoneAbbr(timezone: string, date: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, timeZoneName: 'short' }).formatToParts(date)
    return parts.find(p => p.type === 'timeZoneName')?.value ?? timezone
  } catch {
    return timezone
  }
}

function credentialToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    
    .replace(/-+/g, '-')
    .trim();
}
export function getAccreditationImages(accreditationsJson:Array<Accreditation>){
  const accredImagesMap = new Map(
    (accreditationsJson as Array<{slug: string; image: string}>)
      .filter(item => item.image)
      .map(item => [item.slug.replaceAll("-"," "), item.image])
  );
  const recognitionsWithImages = [...accreditations, ]
        .map(credential => {
          const slug = credentialToSlug(credential);
          const imageUrl = accredImagesMap.get(slug);
          return imageUrl ? {
            name: credential,
            slug,
            image_url: imageUrl
          } : null;
        })
        .filter((item): item is {name: string; slug: string; image_url: string} => item !== null);
   
      return recognitionsWithImages
       }
export function consolidate(input: string): string[] {

  const arr = input
    .replaceAll('[', "")
    .replaceAll(']', "")
    .replaceAll("'", "").replaceAll('"', "")    
    .replaceAll("\\n", ",")  
    .replaceAll(", ", ",")
    .split(",'")
    .map(x => x.trim())
  let result = arr[0].split(",")
  return result
}

export function parse_numbers(input: string): number {
  const arr = input
  .replaceAll('[', "")
  .replaceAll(']', "")
  .replaceAll("'", "")
  .split(",'")
  .map(x => x.trim());

 
  return Number.parseFloat(arr[0]);
}

export function parse_text(input: string): string {
  const arr = input
  .replaceAll('[', "")
  .replaceAll(']', "")
  .replaceAll("'", "")
  .split(",")
  .map(x => x.trim());
  return arr[0];
}

export function parse_addresses(input: string): string {
  let result = ""
  try {

    const arr = input
  .replaceAll('[', "")
  .replaceAll(']', "")
  .replaceAll("'", '"')
  .split('", "')
  .map(x => x.trim());
  result = arr[0].replaceAll('"', '');
  } catch (e) {
    result = input
  }

  return result
}
export function decodeUnicodeEscapes(str: string) {

  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
    String.fromCodePoint(Number.parseInt(code, 16))
  );
}

export function calculateAge(dateOfBirth: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--
  }
  return age
}

export function cleanRouteSlug(slug: string) {
  try {
  return slug.toLowerCase()
  .replaceAll(/&|\+/g, 'and')
  .replaceAll(/[\/\\]+/g, '-')
    .replaceAll(' ', "-")
  }
  catch (e) {

    return slug
  }
}

export function toUrlSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/&|\+/g, ' and ')
    .replaceAll(/[\/\\]+/g, ' ')
    .replaceAll(/[^a-z0-9\s-]/g, '')
    .replaceAll(/\s+/g, '-')
    .replaceAll(/-+/g, '-')
    .replaceAll(/^-|-$/g, '')
}

export function capitalize(value: string): string {
  return value
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function parseLabels(label: string): [boolean, string] | null {
  try {
    const jsonReady = label
      .trim()
      .replaceAll(/\bTrue\b/g, "true")
      .replaceAll(/\bFalse\b/g, "false")
      .replaceAll(/\b,']/g, "]")

    const parsed = JSON.parse(jsonReady);
    return parsed;
  } catch (err) {
    console.log(label)
    return null;
  }
}



export function safeParse(v: any) {
  try {
  
    return JSON.parse(v.replaceAll(/[\u0000-\u001F]/g, ""));
  } catch (err) {
    console.log(err)
    const msg = String(err)

    if (msg.includes("Unterminated string in JSON") || msg.includes("Unexpected end of JSON input")) {
    
      if (typeof v === "string" && v.trim().startsWith("[") ) {

        const last = v.lastIndexOf("}")
  

        if (last !== -1) {
          let fixed = v.slice(0, last + 1).replace(/\s*,\s*$/, "") + "]"
          try {
            return JSON.parse(fixed)
          } catch {
            return null
          }
        }
      }
    }
    else {
      console.log("Value:",v,"Message: ",msg)
    }

    
    return null
  }
}
export const parseList = (val: any) => {
    if (!val) return [];
    try {
      if (typeof val === "string" && val.startsWith("[") && val.endsWith("]")) {
        return JSON.parse(val.replaceAll("'", '"'));
      }
      if (Array.isArray(val)) return val;
      return [val];
    } catch {
      return [val];
    }
  };
export const fixPythonArrayString = (str: string|undefined) => {
    if (!str) return null;

    try {
      let fixed = str
        .trim()
        .replaceAll(/^"\[|\]"$/g, (m) => (m === '"[' ? "[" : "]"));

      fixed = fixed.replaceAll(/'([^']*)'/g, '"$1"');

      return JSON.parse(fixed);
    } catch {
      return null;
    }
  };

export const flattenObject = (obj: any, parentKey = "", result: any = {}) => {
  for (const [key, value] of Object.entries(obj)) {
    const newKey = parentKey ? `${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenObject(value, newKey, result);
    } else {
      result[newKey] = value;
    }
  }
  return result;
};

export function fixMojibake(str: string) {
  if (!str) return str
  try {
    const bytes = Uint8Array.from(str, (c) => c.charCodeAt(0) & 0xff)
    const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes)
    if (decoded && !decoded.includes("\uFFFD")) {
      return decoded
    }
  } catch {
    /* fall through */
  }
  try {
    return new TextDecoder("utf-8").decode(
      Uint8Array.from(str, (c) => c.charCodeAt(0))
    )
  } catch {
    return str
  }
}

const MOJIBAKE_REPLACEMENTS: ReadonlyArray<readonly [string, string]> = [
  ["â€™", "'"],
  ["â€˜", "'"],
  ["â€œ", '"'],
  ["â€\u009d", '"'],
  ["Ã©", "é"],
  ["Ã¨", "è"],
  ["Ã¼", "ü"],
  ["Ã¶", "ö"],
  ["Ã¤", "ä"],
  ["Ã±", "ñ"],
  ["Â£", "£"],
]

export function sanitizeDisplayText(str: string): string {
  if (!str || typeof str !== "string") return str
  let out = str
  for (let pass = 0; pass < 3; pass += 1) {
    out = fixMojibake(out)
    out = decodeUnicodeEscapes(out)
    for (const [from, to] of MOJIBAKE_REPLACEMENTS) {
      out = out.split(from).join(to)
    }
  }
  out = out.replace(/\uFFFD/g, "'")
  out = out.replace(/[\u2018\u2019\u201A\u2032]/g, "'")
  out = out.replace(/[\u201C\u201D\u201E\u2033]/g, '"')
  out = out.replace(/[\u00A0]/g, " ")
  out = out.replace(/\byoull\b/gi, "you'll")
  out = out.replace(/\bdoesnt\b/gi, "doesn't")
  out = out.replace(/\bdont\b/gi, "don't")
  out = out.replace(/\bisnt\b/gi, "isn't")
  out = out.replace(/\barent\b/gi, "aren't")
  out = out.replace(/\bwont\b/gi, "won't")
  out = out.replace(/\bcant\b/gi, "can't")
  out = out.replace(/\bIts\b/g, "It's")
  out = out.replace(/\bits\b/g, "it's")
  return out
}

export function isAward(obj: unknown): obj is {name:string; slug: string; image_url: string} {
  const flag = typeof obj === "object" && Object.keys(obj!).length === 3;
  return flag;
}

export function isCity(obj: unknown): obj is string {
  if (typeof obj !== "string") return false;
  const normalized = obj.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  return locations.includes(normalized) || normalized in cityMap;
}
export function isTreatment(obj:unknown): obj is string{
    return typeof obj === "string" && modalities.includes(obj.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ").replace("Hifu", "HIFU").replace("Coolsculpting", "CoolSculpting"));
}
export function isPractitioner(obj: unknown): obj is Practitioner {

  return typeof obj === "object" && obj !== null && "practitioner_name" in obj;
}

export function isClinic(obj: unknown): obj is Clinic {
  return typeof obj === "object" && obj !== null && "isJCCP" in obj;
}

export function isProduct(obj: unknown): obj is Product {
  return typeof obj === "object" && obj !== null && "product_name" in obj;

}


function stripContentReferenceFromString(str: string): string {
  let result = "";
  let i = 0;

  while (i < str.length) {
    if (!str.startsWith(":contentReference[", i)) {
      result += str[i++];
      continue;
    }

    i += 18;

    while (i < str.length && str[i] !== "]") i++;
    i++;

    if (str[i] === "{") {
      while (i < str.length && str[i] !== "}") i++;
      i++;
    }
  }

  return result.trim();
}

export function stripContentReferencesDeep(obj: any): any {
  if (typeof obj === "string") {
    return stripContentReferenceFromString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(stripContentReferencesDeep);
  }

  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        stripContentReferencesDeep(value),
      ]),
    );
  }

  return obj;
}

