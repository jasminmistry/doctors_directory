import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ServiceCityDirectoryPage } from '@/components/service-city-directory-page'
import { TreatmentCityHubPage } from '@/components/treatment-city-hub-page'
import { getServiceCityEntry } from '@/lib/directory-seo-pages'
import { getTreatmentCityHubEntry } from '@/lib/treatment-city-hub'
import { isReservedSlugCityFirstSegment } from '@/lib/reserved-directory-slugs'
import { TREATMENT_HUB_SLUG_REDIRECTS } from '@/lib/treatment-hub-registry'
import {
  buildServiceCityPageDescription,
  buildServiceCityPageTitle,
  buildTreatmentCityHubPageTitle,
} from '@/lib/page-meta-titles'
import { resolveDirectoryPageMeta } from '@/lib/directory-page-meta'
import { toDirectoryCanonical } from '@/lib/seo'

type PageProps = {
  params: {
    slug: string
    city: string
  }
}

export const revalidate = 300

function resolvePage(params: PageProps['params']) {
  const serviceEntry = getServiceCityEntry(params.slug, params.city)
  if (serviceEntry) {
    return { kind: 'service' as const, serviceEntry }
  }
  const hubEntry = getTreatmentCityHubEntry(params.slug, params.city)
  if (hubEntry) {
    return { kind: 'hub' as const, hubEntry }
  }
  return null
}

export function generateMetadata({ params }: PageProps): Metadata {
  if (isReservedSlugCityFirstSegment(params.slug)) {
    return {
      title: 'Page Not Found',
      robots: { index: false, follow: false },
    }
  }

  const resolved = resolvePage(params)
  if (!resolved) {
    return {
      title: 'Page Not Found',
      robots: { index: false, follow: false },
    }
  }

  if (resolved.kind === 'service') {
    const { serviceEntry: entry } = resolved
    const canonical = toDirectoryCanonical(`/${entry.serviceSlug}/${entry.locationSlug}`)
    const meta = resolveDirectoryPageMeta(`/${entry.serviceSlug}/${entry.locationSlug}/`, {
      title: buildServiceCityPageTitle(entry.serviceLabel, entry.locationLabel),
      description: buildServiceCityPageDescription(entry.serviceLabel, entry.locationLabel),
    })
    const title = meta.title
    const description = meta.description
    return {
      title,
      description,
      ...(meta.keywords ? { keywords: meta.keywords } : {}),
      alternates: { canonical },
      openGraph: { title, description, url: canonical, type: 'website' },
      twitter: { card: 'summary_large_image', title, description },
    }
  }

  const { hubEntry: entry } = resolved
  const title = buildTreatmentCityHubPageTitle(
    entry.treatmentName,
    entry.locationLabel,
    entry.clinicCount
  )
  const description = `Explore ${entry.treatmentName.toLowerCase()} in ${entry.locationLabel}. Compare ${entry.clinicCount} clinics and ${entry.practitionerCount} practitioners, read FAQs, and choose the right provider.`
  const canonical = toDirectoryCanonical(`/${entry.treatmentSlug}/${entry.locationSlug}`)
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default function SlugCityPage({ params }: PageProps) {
  if (params.slug === 'software') {
    redirect(`/business/uk/${params.city}/aesthetic-clinic-software/`)
  }

  if (isReservedSlugCityFirstSegment(params.slug)) {
    notFound()
  }

  const hubSlugRedirect = TREATMENT_HUB_SLUG_REDIRECTS[params.slug]
  if (hubSlugRedirect) {
    redirect(`/${hubSlugRedirect}/${params.city}/`)
  }

  if (params.slug.endsWith('-treatment')) {
    const baseSlug = params.slug.slice(0, -'-treatment'.length)
    const hubEntry = getTreatmentCityHubEntry(baseSlug, params.city)
    if (hubEntry) {
      redirect(`/${baseSlug}/${params.city}/`)
    }
  }

  const resolved = resolvePage(params)
  if (!resolved) {
    notFound()
  }

  if (resolved.kind === 'service') {
    return <ServiceCityDirectoryPage entry={resolved.serviceEntry} />
  }

  return <TreatmentCityHubPage entry={resolved.hubEntry} />
}
