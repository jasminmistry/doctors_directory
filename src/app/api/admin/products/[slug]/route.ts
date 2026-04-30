import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const productEditSchema = z.object({
  productName: z.string().min(1).optional(),
  productCategory: z.string().optional().nullable(),
  productSubcategory: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  manufacturer: z.string().optional().nullable(),
  distributor: z.string().optional().nullable(),
  distributorCleaned: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  documentPdfUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  treatmentDuration: z.string().optional().nullable(),
  onsetOfEffect: z.string().optional().nullable(),
  mhraApproved: z.string().optional().nullable(),
  ceMarked: z.string().optional().nullable(),
  mhraLink: z.string().optional().nullable(),
  brandAbout: z.string().optional().nullable(),
  sellerAbout: z.string().optional().nullable(),
  isAestheticsDermatologyRelated: z.boolean().optional().nullable(),
  keyBenefits: z.any().optional().nullable(),
  indications: z.any().optional().nullable(),
  composition: z.any().optional().nullable(),
  formulation: z.any().optional().nullable(),
  packaging: z.any().optional().nullable(),
  usageInstructions: z.any().optional().nullable(),
  contraindications: z.any().optional().nullable(),
  adverseEffects: z.any().optional().nullable(),
  storageConditions: z.any().optional().nullable(),
  certifications: z.any().optional().nullable(),
  verificationSources: z.any().optional().nullable(),
  allPrices: z.any().optional().nullable(),
})

const PRODUCT_EDIT_SELECT = {
  slug: true, productName: true, productCategory: true, productSubcategory: true,
  category: true, brand: true, manufacturer: true, distributor: true, distributorCleaned: true,
  sku: true, imageUrl: true, documentPdfUrl: true, description: true, treatmentDuration: true,
  onsetOfEffect: true, mhraApproved: true, ceMarked: true, mhraLink: true, brandAbout: true,
  sellerAbout: true, isAestheticsDermatologyRelated: true, keyBenefits: true, indications: true,
  composition: true, formulation: true, packaging: true, usageInstructions: true,
  contraindications: true, adverseEffects: true, storageConditions: true, certifications: true,
  verificationSources: true, allPrices: true,
}

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      select: PRODUCT_EDIT_SELECT,
    })
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
    const body = await request.json()
    const { slug: _slug, ...rest } = body
    const validation = productEditSchema.safeParse(rest)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid data', details: validation.error.errors }, { status: 400 })
    }
    const product = await prisma.product.update({
      where: { slug: params.slug },
      data: validation.data as any,
      select: PRODUCT_EDIT_SELECT,
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error('Failed to update product:', error)
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
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
