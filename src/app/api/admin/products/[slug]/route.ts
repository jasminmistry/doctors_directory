import { NextResponse } from 'next/server'
import { validateProduct } from '@/lib/admin/validators'
import { prisma } from '@/lib/db'
import { getProductBySlug, convertDbProductToOldType } from '@/lib/data-access/products'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await getProductBySlug(params.slug)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Failed to read product:', error)
    return NextResponse.json({ error: 'Failed to read product' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const data = await request.json()
    const validation = validateProduct(data)

    if (!validation.success) {
      console.error('Validation error:', validation.error.errors)
      return NextResponse.json({ error: 'Invalid product data', details: validation.error.errors }, { status: 400 })
    }

    const d = validation.data as any

    const record = await prisma.product.update({
      where: { slug: params.slug },
      data: {
        productName: d.product_name || undefined,
        productCategory: d.product_category || undefined,
        productSubcategory: d.product_subcategory || undefined,
        category: d.category || undefined,
        brand: d.brand || undefined,
        manufacturer: d.manufacturer || undefined,
        distributor: d.distributor || undefined,
        distributorCleaned: d.distributor_cleaned || undefined,
        sku: d.sku || undefined,
        imageUrl: d.image_url || undefined,
        documentPdfUrl: d.product_document_pdf_from_manufacturer || undefined,
        description: d.description || undefined,
        treatmentDuration: d.treatment_duration || undefined,
        onsetOfEffect: d.onset_of_effect || undefined,
        mhraApproved: d.mhra_approved || undefined,
        ceMarked: d.ce_marked || undefined,
        mhraLink: d.mhra_link || undefined,
        brandAbout: d.brand_about || undefined,
        sellerAbout: d.seller_about || undefined,
        keyBenefits: d.key_benefits ?? undefined,
        indications: d.indications ?? undefined,
        composition: d.composition ?? undefined,
        formulation: d.formulation ?? undefined,
        packaging: d.packaging ?? undefined,
        usageInstructions: d.usage_instructions ?? undefined,
        contraindications: d.contraindications ?? undefined,
        adverseEffects: d.adverse_effects ?? undefined,
        storageConditions: d.storage_conditions ?? undefined,
        certifications: d.certifications_and_compliance ?? undefined,
        verificationSources: d.verification_sources ?? undefined,
        allPrices: d.all_prices ?? undefined,
      },
    })

    return NextResponse.json(convertDbProductToOldType(record))
  } catch (error) {
    console.error('Failed to update product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await prisma.product.delete({ where: { slug: params.slug } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    console.error('Failed to delete product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
