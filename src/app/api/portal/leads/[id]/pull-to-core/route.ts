export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'
import { pullLeadToCore } from '@/lib/core-api'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getPortalUser()
  if (!user || !user.clinicId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const leadId = parseInt(params.id, 10)
  if (isNaN(leadId)) {
    return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 })
  }

  const lead = await prisma.consultationLead.findFirst({
    where: { id: leadId, clinicId: user.clinicId },
  })
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  if (lead.coreSynced) {
    return NextResponse.json({ error: 'Lead already pulled into Core' }, { status: 409 })
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: user.clinicId },
    select: { coreClinicId: true, claimedPlan: true },
  })

  if (!clinic?.coreClinicId) {
    return NextResponse.json({ error: 'This clinic is not linked to Consentz Core' }, { status: 400 })
  }

  // Same reveal gate as patient details in leads/route.ts — pulling into Core must not
  // bypass the Pay-Per-Lead paywall by sending unpaid-for contact details server-to-server.
  const revealed = clinic.claimedPlan === 'subscription' || lead.isUnlocked
  if (!revealed) {
    return NextResponse.json({ error: 'Unlock this lead before pulling it into Core' }, { status: 403 })
  }

  const nameParts = lead.patientName.trim().split(/\s+/)
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ') || firstName

  try {
    const result = await pullLeadToCore(clinic.coreClinicId, lead.id, {
      firstName,
      lastName,
      email: lead.patientEmail,
      phone: lead.patientPhone,
      countryCode: null,
      notes: lead.notes,
    })

    await prisma.consultationLead.update({
      where: { id: lead.id },
      data: { coreSynced: true },
    })

    return NextResponse.json({ success: true, leadCaptureId: result.leadCaptureId, coreUrl: result.coreUrl })
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number }
    console.error('[leads/pull-to-core] error:', e)
    return NextResponse.json({ error: e.message ?? 'Failed to pull lead into Core' }, { status: e.status ?? 502 })
  }
}
