import { NextResponse } from 'next/server'
import { getAllTreatments, createTreatment } from '@/lib/data-access/treatments'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const treatments = await getAllTreatments()
    return NextResponse.json(treatments)
  } catch (error) {
    console.error('Failed to read treatments:', error)
    return NextResponse.json({ error: 'Failed to read treatments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const slug = body.slug?.trim()
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }
    const name = body.name?.trim()
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const treatment = await createTreatment({
      slug,
      name,
      description: body.description ?? null,
      goals: body.goals ?? null,
      prosAndCons: body.prosAndCons ?? null,
      cost: body.cost ?? null,
      choosingDoctor: body.choosingDoctor ?? null,
      alternatives: body.alternatives ?? null,
      goodCandidate: body.goodCandidate ?? null,
      preparation: body.preparation ?? null,
      safetyAndPain: body.safetyAndPain ?? null,
      howLongResultsLast: body.howLongResultsLast ?? null,
      mildVsSevere: body.mildVsSevere ?? null,
      whatHappensDuring: body.whatHappensDuring ?? null,
      recovery: body.recovery ?? null,
      regulation: body.regulation ?? null,
      maintenance: body.maintenance ?? null,
      qualifications: body.qualifications ?? null,
      niceGuidelines: body.niceGuidelines ?? null,
    })

    return NextResponse.json(treatment, { status: 201 })
  } catch (error) {
    console.error('Failed to create treatment:', error)
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'A treatment with this slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create treatment' }, { status: 500 })
  }
}
