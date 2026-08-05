export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requirePatient } from '@/lib/patient-auth'
import { CONSENT_FORM_VERSION } from '@/lib/consent'

const WITHDRAWAL_WORDING = 'Patient withdrew consent to have their enquiry details shared with clinics via the account dashboard.'

export async function POST(req: NextRequest) {
  const { patient, error } = await requirePatient(req)
  if (error) return error

  await prisma.patientConsent.create({
    data: {
      patientId: patient.id,
      checkbox: 'share',
      ticked: false,
      wordingShown: WITHDRAWAL_WORDING,
      formVersion: CONSENT_FORM_VERSION,
    },
  })

  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
