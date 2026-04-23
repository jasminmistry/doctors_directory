import { NextResponse } from 'next/server'
import { getClinicBySlug, updateClinic, deleteClinic } from '@/lib/data-access/clinics'
import { validateClinic } from '@/lib/admin/validators'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const clinic = await getClinicBySlug(params.slug)

    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }

    return NextResponse.json(clinic)
  } catch (error) {
    console.error('Failed to read clinic:', error)
    return NextResponse.json({ error: 'Failed to read clinic' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const data = await request.json()
    const validation = validateClinic(data)

    if (!validation.success) {
      console.error('Validation error:', validation.error.errors)
      return NextResponse.json({ error: 'Invalid clinic data', details: validation.error.errors }, { status: 400 })
    }

    const clinic = await updateClinic(params.slug, validation.data)
    return NextResponse.json(clinic)
  } catch (error) {
    console.error('Failed to update clinic:', error)
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update clinic' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await deleteClinic(params.slug)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete clinic:', error)
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete clinic' }, { status: 500 })
  }
}
