import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import ItemsGrid from '@/components/collectionGrid'
import { BestRankedBlock } from '@/components/best-ranked-block'
import { BestInCityDirectoryPage } from '@/components/best-in-city-directory-page'
import { DirectoryJsonLd } from '@/components/directory-json-ld'
import { buildClinicRankedEntries } from '@/lib/best-ranked'
import { getBestInCityEntry } from '@/lib/best-in-city-pages'
import { getClinicDisplayName } from '@/lib/clinic-display'
import { isDeindexedStandaloneSlug } from '@/lib/directory-deindex'
import {
  buildBreadcrumbListJsonLd,
  buildItemListJsonLd,
  buildMedicalClinicListJsonLd,
  clinicItemListFromClinics,
} from '@/lib/directory-json-ld'
import {
  getStandaloneDirectoryEntry,
  getStandaloneProductItems,
  getStandaloneTreatmentClinics,
} from '@/lib/directory-seo-pages'
import { getProductsForTreatment, MIN_TREATMENT_PRODUCTS_FOR_PAGE } from '@/lib/treatment-product-match'
import { buildBestInCityPageTitle } from '@/lib/page-meta-titles'
import { toDirectoryCanonical } from '@/lib/seo'
import { toUrlSlug } from '@/lib/utils'
import { IconArrowNarrowLeft } from '@tabler/icons-react'

type PageProps = {
  params: {
    slug: string
  }
}

const MIN_TREATMENT_CLINICS = 3

export const revalidate = 300

export function generateMetadata({ params }: PageProps): Metadata {
  if (isDeindexedStandaloneSlug(params.slug)) {
    return {
      title: 'Page Not Found',
      robots: { index: false, follow: false },
    }
  }

  const bestInCityEntry = getBestInCityEntry(params.slug)
  if (bestInCityEntry) {
    const title = buildBestInCityPageTitle(
      bestInCityEntry.treatmentName,
      bestInCityEntry.locationLabel,
      bestInCityEntry.clinicCount
    )
    const description = `Compare the best ${bestInCityEntry.treatmentName.toLowerCase()} clinics in ${bestInCityEntry.locationLabel}. Rankings use verified directory data, reviews, and profile completeness.`
    const canonical = toDirectoryCanonical(`/${bestInCityEntry.slug}`)
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { title, description, url: canonical, type: 'website' },
      twitter: { card: 'summary_large_image', title, description },
    }
  }

  const entry = getStandaloneDirectoryEntry(params.slug)
  if (!entry) {
    return {
      title: 'Page Not Found',
      robots: { index: false, follow: false },
    }
  }

  const canonical = toDirectoryCanonical(`/${entry.slug}`)
  if (entry.type === 'treatment') {
    const title = `${entry.name} Treatment | Verified Clinics and Practitioner Coverage`
    const description = `Browse ${entry.name.toLowerCase()} treatment providers, compare ratings and review clinic options across the UK directory.`
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { title, description, url: canonical, type: 'website' },
      twitter: { card: 'summary_large_image', title, description },
    }
  }

  if (entry.type === 'treatment-product') {
    const title = `${entry.name} Treatment Products | Aesthetic Product Directory`
    const description = `Explore products commonly used for ${entry.name.toLowerCase()} treatment, with links to detailed product profiles in the directory catalogue.`
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { title, description, url: canonical, type: 'website' },
      twitter: { card: 'summary_large_image', title, description },
    }
  }

  const title = `${entry.name} Products | Aesthetic Product Directory`
  const description = `Explore ${entry.name.toLowerCase()} products with direct links to category listings and detailed product records.`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default function StandaloneDirectoryPage({ params }: PageProps) {
  if (isDeindexedStandaloneSlug(params.slug)) {
    notFound()
  }

  if (params.slug.includes('polynucleotide-treatment')) {
    redirect(`/${params.slug.replace('polynucleotide-treatment', 'polynucleotides')}/`)
  }

  const bestInCityEntry = getBestInCityEntry(params.slug)
  if (bestInCityEntry) {
    return <BestInCityDirectoryPage entry={bestInCityEntry} />
  }

  const entry = getStandaloneDirectoryEntry(params.slug)
  if (!entry) {
    notFound()
  }

  const pagePath = `/${entry.slug}`

  if (entry.type === 'treatment') {
    const clinics = getStandaloneTreatmentClinics(entry.name)
    if (clinics.length < MIN_TREATMENT_CLINICS) {
      notFound()
    }
    const ranked = buildClinicRankedEntries(clinics, 6)
    const listItems = clinicItemListFromClinics(
      clinics,
      (clinic) => getClinicDisplayName({ slug: clinic.slug, url: clinic.url })
    )
    const jsonLdSchemas = [
      buildBreadcrumbListJsonLd([
        { name: 'Home', path: '/' },
        { name: `${entry.name} Treatment`, path: pagePath },
      ]),
      buildItemListJsonLd(`${entry.name} Treatment Clinics`, listItems),
      ...buildMedicalClinicListJsonLd(clinics, (clinic) =>
        getClinicDisplayName({ slug: clinic.slug, url: clinic.url })
      ),
    ]

    return (
      <>
        <DirectoryJsonLd schemas={jsonLdSchemas} />
        <main className="bg-(--primary-bg-color)">
          <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
            <Link href="/" prefetch={false} className="mb-4 inline-flex items-center gap-3 text-sm hover:underline">
              <IconArrowNarrowLeft stroke={1.5} className="h-4 w-4" />
              Back to Directory
            </Link>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{entry.name} Treatment</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="mt-4 text-2xl font-semibold text-foreground md:text-3xl">
              {entry.name} Treatment
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
              Find clinics offering {entry.name.toLowerCase()} treatment, compare reputation
              signals and review real provider profiles.
            </p>
            <Link
              href={entry.targetPath}
              className="mt-3 inline-block text-sm font-medium text-foreground underline-offset-2 hover:underline"
            >
              View full {entry.name} treatment guide
            </Link>
          </div>

          <div className="mx-auto max-w-7xl px-4 pb-6">
            <BestRankedBlock title={`Top ${entry.name} Clinics`} entries={ranked} />
          </div>

          <div className="mx-auto max-w-7xl px-4 pb-12">
            <ItemsGrid items={clinics} />
          </div>
        </main>
      </>
    )
  }

  if (entry.type === 'treatment-product') {
    const products = getProductsForTreatment(entry.treatmentName).slice(0, 60)
    if (products.length < MIN_TREATMENT_PRODUCTS_FOR_PAGE) {
      notFound()
    }

    const productListItems = products.slice(0, 12).map((product) => ({
      name: product.product_name,
      path: `/products/category/${toUrlSlug(product.product_category ?? '')}/${product.slug}`,
    }))

    const jsonLdSchemas = [
      buildBreadcrumbListJsonLd([
        { name: 'Home', path: '/' },
        { name: `${entry.name} Treatment Products`, path: pagePath },
      ]),
      buildItemListJsonLd(`${entry.name} Treatment Products`, productListItems),
    ]

    return (
      <>
        <DirectoryJsonLd schemas={jsonLdSchemas} />
        <main className="bg-(--primary-bg-color)">
          <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
            <Link href="/" prefetch={false} className="mb-4 inline-flex items-center gap-3 text-sm hover:underline">
              <IconArrowNarrowLeft stroke={1.5} className="h-4 w-4" />
              Back to Directory
            </Link>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{entry.name} Treatment Products</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="mt-4 text-2xl font-semibold text-foreground md:text-3xl">
              {entry.name} Treatment Products
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
              Products commonly associated with {entry.name.toLowerCase()} treatment in the
              directory catalogue.
            </p>
            <Link
              href={entry.targetPath}
              className="mt-3 inline-block text-sm font-medium text-foreground underline-offset-2 hover:underline"
            >
              View {entry.name} treatment guide
            </Link>
          </div>

          <div className="mx-auto grid max-w-6xl gap-3 px-4 pb-12 md:grid-cols-2">
            {products.map((product) => (
              <Card key={product.slug} className="border border-border bg-card">
                <CardContent className="p-4">
                  <h2 className="text-sm font-semibold text-foreground md:text-base">
                    {product.product_name}
                  </h2>
                  <p className="mt-2 text-xs text-muted-foreground md:text-sm">
                    {product.brand ?? 'Brand not provided'}
                  </p>
                  <Link
                    href={`/products/category/${toUrlSlug(product.product_category ?? '')}/${product.slug}`}
                    className="mt-3 inline-block text-sm font-medium text-foreground underline-offset-2 hover:underline"
                  >
                    View product details
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </>
    )
  }

  const products = getStandaloneProductItems(entry.name).slice(0, 60)
  if (products.length < MIN_TREATMENT_CLINICS) {
    notFound()
  }

  const productListItems = products.slice(0, 12).map((product) => ({
    name: product.product_name,
    path: `/products/category/${entry.slug}/${product.slug}`,
  }))

  const jsonLdSchemas = [
    buildBreadcrumbListJsonLd([
      { name: 'Home', path: '/' },
      { name: entry.name, path: pagePath },
    ]),
    buildItemListJsonLd(`${entry.name} Products`, productListItems),
  ]

  return (
    <>
      <DirectoryJsonLd schemas={jsonLdSchemas} />
      <main className="bg-(--primary-bg-color)">
        <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
          <Link href="/" prefetch={false} className="mb-4 inline-flex items-center gap-3 text-sm hover:underline">
            <IconArrowNarrowLeft stroke={1.5} className="h-4 w-4" />
            Back to Directory
          </Link>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{entry.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="mt-4 text-2xl font-semibold text-foreground md:text-3xl">
            {entry.name} Products
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
            Standalone index of {entry.name.toLowerCase()} products from the directory catalogue.
          </p>
          <Link
            href={entry.targetPath}
            className="mt-3 inline-block text-sm font-medium text-foreground underline-offset-2 hover:underline"
          >
            View {entry.name} category
          </Link>
        </div>

        <div className="mx-auto grid max-w-6xl gap-3 px-4 pb-12 md:grid-cols-2">
          {products.map((product) => (
            <Card key={product.slug} className="border border-border bg-card">
              <CardContent className="p-4">
                <h2 className="text-sm font-semibold text-foreground md:text-base">
                  {product.product_name}
                </h2>
                <p className="mt-2 text-xs text-muted-foreground md:text-sm">
                  {product.brand ?? 'Brand not provided'}
                </p>
                <Link
                  href={`/products/category/${toUrlSlug(entry.name)}/${product.slug}`}
                  className="mt-3 inline-block text-sm font-medium text-foreground underline-offset-2 hover:underline"
                >
                  View product details
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  )
}
