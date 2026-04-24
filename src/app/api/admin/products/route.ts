import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: { slug: true, productName: true, productCategory: true, brand: true, imageUrl: true },
      orderBy: { productName: 'asc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Failed to read products:', error)
    return NextResponse.json({ error: 'Failed to read products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const slug = body.slug?.trim()
    if (!slug) return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    const productName = body.productName?.trim()
    if (!productName) return NextResponse.json({ error: 'Product name is required' }, { status: 400 })

    const { slug: _s, ...rest } = body
    const record = await prisma.product.create({
      data: { slug, productName, ...rest } as any,
    })
    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Failed to create product:', error)
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'A product with this slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
