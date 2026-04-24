import { NextResponse } from 'next/server'
import { getTreatmentBySlug, updateTreatment, deleteTreatment } from '@/lib/data-access/treatments'
import { validateTreatment } from '@/lib/admin/validators'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const treatment = await getTreatmentBySlug(params.slug)
    if (!treatment) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 })
    }
    return NextResponse.json(treatment)
  } catch (error) {
    console.error('Failed to read treatment:', error)
    return NextResponse.json({ error: 'Failed to read treatment' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const data = await request.json()
    const validation = validateTreatment(data)
    if (!validation.success) {
      console.error('Validation error:', validation.error.errors)
      return NextResponse.json({ error: 'Invalid treatment data', details: validation.error.errors }, { status: 400 })
    }

    const { name, description, goals, prosAndCons, cost, choosingDoctor, alternatives, goodCandidate, preparation, safetyAndPain, howLongResultsLast, mildVsSevere, whatHappensDuring, recovery, regulation, maintenance, qualifications, niceGuidelines } = validation.data

    const treatment = await updateTreatment(params.slug, {
      name: name ?? undefined,
      description: description ?? null,
      goals: goals ?? null,
      prosAndCons: prosAndCons ?? null,
      cost: cost ?? null,
      choosingDoctor: choosingDoctor ?? null,
      alternatives: alternatives ?? null,
      goodCandidate: goodCandidate ?? null,
      preparation: preparation ?? null,
      safetyAndPain: safetyAndPain ?? null,
      howLongResultsLast: howLongResultsLast ?? null,
      mildVsSevere: mildVsSevere ?? null,
      whatHappensDuring: whatHappensDuring ?? null,
      recovery: recovery ?? null,
      regulation: regulation ?? null,
      maintenance: maintenance ?? null,
      qualifications: qualifications ?? null,
      niceGuidelines: niceGuidelines ?? null,
    })

    return NextResponse.json(treatment)
  } catch (error) {
    console.error('Failed to update treatment:', error)
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update treatment' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await deleteTreatment(params.slug)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete treatment:', error)
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete treatment' }, { status: 500 })
  }
}
