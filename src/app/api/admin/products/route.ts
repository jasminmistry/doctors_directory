import { NextResponse } from 'next/server'
import { validateProduct } from '@/lib/admin/validators'
import { prisma } from '@/lib/db'
import { getAllProducts, convertDbProductToOldType } from '@/lib/data-access/products'

export async function GET() {
  try {
    const products = await getAllProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error('Failed to read products:', error)
    return NextResponse.json({ error: 'Failed to read products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const validation = validateProduct(data)

    if (!validation.success) {
      console.error('Validation error:', validation.error.errors)
      return NextResponse.json({ error: 'Invalid product data', details: validation.error.errors }, { status: 400 })
    }

    const d = validation.data as any
    const slug = d.slug || d.product_name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'unknown'

    const record = await prisma.product.create({
      data: {
        slug,
        productName: d.product_name || 'Unknown',
        productCategory: d.product_category ?? null,
        productSubcategory: d.product_subcategory ?? null,
        category: d.category ?? null,
        brand: d.brand ?? null,
        manufacturer: d.manufacturer ?? null,
        distributor: d.distributor ?? null,
        distributorCleaned: d.distributor_cleaned ?? null,
        sku: d.sku ?? null,
        imageUrl: d.image_url ?? null,
        documentPdfUrl: d.product_document_pdf_from_manufacturer ?? null,
        description: d.description ?? null,
        treatmentDuration: d.treatment_duration ?? null,
        onsetOfEffect: d.onset_of_effect ?? null,
        mhraApproved: d.mhra_approved ?? null,
        ceMarked: d.ce_marked ?? null,
        mhraLink: d.mhra_link ?? null,
        brandAbout: d.brand_about ?? null,
        sellerAbout: d.seller_about ?? null,
        keyBenefits: d.key_benefits ?? [],
        indications: d.indications ?? [],
        composition: d.composition ?? [],
        formulation: d.formulation ?? [],
        packaging: d.packaging ?? [],
        usageInstructions: d.usage_instructions ?? [],
        contraindications: d.contraindications ?? [],
        adverseEffects: d.adverse_effects ?? [],
        storageConditions: d.storage_conditions ?? [],
        certifications: d.certifications_and_compliance ?? [],
        verificationSources: d.verification_sources ?? [],
        allPrices: d.all_prices ?? undefined,
      },
    })

    return NextResponse.json(convertDbProductToOldType(record), { status: 201 })
  } catch (error) {
    console.error('Failed to create product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
