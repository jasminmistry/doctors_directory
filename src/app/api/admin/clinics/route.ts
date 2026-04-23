import { NextResponse } from 'next/server'
import { getAllClinics, createClinic } from '@/lib/data-access/clinics'
import { validateClinic } from '@/lib/admin/validators'

export async function GET() {
  try {
    const clinics = await getAllClinics()
    return NextResponse.json(clinics)
  } catch (error) {
    console.error('Failed to read clinics:', error)
    return NextResponse.json({ error: 'Failed to read clinics' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const validation = validateClinic(data)

    if (!validation.success) {
      console.error('Validation error:', validation.error.errors)
      return NextResponse.json({ error: 'Invalid clinic data', details: validation.error.errors }, { status: 400 })
    }

    const clinic = await createClinic(validation.data)
    return NextResponse.json(clinic, { status: 201 })
  } catch (error) {
    console.error('Failed to create clinic:', error)
    return NextResponse.json({ error: 'Failed to create clinic' }, { status: 500 })
  }
}
