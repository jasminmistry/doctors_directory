import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Accreditation, Clinic, Practitioner, Product } from "./types"
import { modalities, locations, accreditations, cityMap } from "./data"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
  try {
    return new TextDecoder("utf-8").decode(
      Uint8Array.from(str, c => c.charCodeAt(0))
    );
  } catch {
    return str;
  }
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

