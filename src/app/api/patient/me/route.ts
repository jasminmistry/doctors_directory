import { NextRequest, NextResponse } from 'next/server'
import { requirePatient } from '@/lib/patient-auth'

export async function GET(req: NextRequest) {
  const { patient, error } = await requirePatient(req)
  if (error) return error
  return NextResponse.json(
    { id: patient.id, email: patient.email, firstName: patient.firstName, lastName: patient.lastName, phone: patient.phone },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
