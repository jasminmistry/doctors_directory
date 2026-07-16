import { toDirectoryCanonical } from '@/lib/seo'
import { toUrlSlug } from '@/lib/utils'
import type { Clinic } from '@/lib/types'

export type DirectoryJsonLdBreadcrumbItem = {
  name: string
  path: string
}

export type DirectoryJsonLdListItem = {
  name: string
  path: string
}

const canonicalPathWithSlash = (path: string): string => {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return toDirectoryCanonical(normalized.endsWith('/') ? normalized : `${normalized}/`)
}

export const buildBreadcrumbListJsonLd = (
  items: ReadonlyArray<DirectoryJsonLdBreadcrumbItem>
) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: canonicalPathWithSlash(item.path),
  })),
})

export const buildItemListJsonLd = (
  name: string,
  items: ReadonlyArray<DirectoryJsonLdListItem>
) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    url: canonicalPathWithSlash(item.path),
  })),
})

export const clinicItemListFromClinics = (
  clinics: ReadonlyArray<{ slug?: string; City?: string; url?: string; name?: string }>,
  getName: (clinic: { slug?: string | undefined; url?: string | undefined; name?: string | undefined }) => string,
  limit = 12
): DirectoryJsonLdListItem[] =>
  clinics.slice(0, limit).flatMap((clinic) => {
    if (!clinic.slug || !clinic.City) {
      return []
    }
    return [
      {
        name: getName(clinic),
        path: `/clinics/${toUrlSlug(clinic.City)}/clinic/${clinic.slug}`,
      },
    ]
  })

export const buildServiceJsonLd = (params: {
  name: string
  description: string
  areaServed: string
  path: string
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: params.name,
  description: params.description,
  areaServed: params.areaServed,
  url: canonicalPathWithSlash(params.path),
  provider: {
    '@type': 'Organization',
    name: 'Consentz Directory',
  },
})

export const buildMedicalClinicJsonLd = (clinic: Clinic, displayName: string) => {
  const path =
    clinic.slug && clinic.City
      ? `/clinics/${toUrlSlug(clinic.City)}/clinic/${clinic.slug}`
      : null
  if (!path) {
    return null
  }
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalClinic', 'LocalBusiness'],
    name: displayName,
    url: toDirectoryCanonical(path),
    address: clinic.gmapsAddress
      ? {
          '@type': 'PostalAddress',
          streetAddress: clinic.gmapsAddress,
          addressLocality: clinic.City,
          addressCountry: 'GB',
        }
      : undefined,
    telephone: clinic.gmapsPhone || undefined,
    aggregateRating:
      clinic.rating && clinic.reviewCount
        ? {
            '@type': 'AggregateRating',
            ratingValue: Number(clinic.rating),
            reviewCount: Number(clinic.reviewCount),
          }
        : undefined,
  }
}

export const buildMedicalClinicListJsonLd = (
  clinics: ReadonlyArray<Clinic>,
  getName: (clinic: Clinic) => string,
  limit = 6
) =>
  clinics
    .slice(0, limit)
    .map((clinic) => buildMedicalClinicJsonLd(clinic, getName(clinic)))
    .filter((schema): schema is NonNullable<typeof schema> => schema !== null)

export const buildFaqPageJsonLd = (
  items: ReadonlyArray<{ question: string; answer: string }>
) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
})

export const practitionerItemListFromProfiles = (
  practitioners: ReadonlyArray<{ City?: string; practitioner_name?: string }>,
  limit = 12
): DirectoryJsonLdListItem[] =>
  practitioners.slice(0, limit).flatMap((practitioner) => {
    if (!practitioner.City || !practitioner.practitioner_name) {
      return []
    }
    return [
      {
        name: practitioner.practitioner_name,
        path: `/practitioners/${toUrlSlug(practitioner.City)}/profile/${practitioner.practitioner_name}`,
      },
    ]
  })
