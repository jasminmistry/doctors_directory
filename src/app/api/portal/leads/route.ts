export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'

export async function GET() {
  const user = await getPortalUser()
  if (!user || !user.clinicId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: user.clinicId },
    select: { claimedPlan: true },
  })

  const plan = clinic?.claimedPlan ?? 'free'
  const isSubscription = plan === 'subscription'

  const leads = await prisma.consultationLead.findMany({
    where: { clinicId: user.clinicId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      treatment: true,
      location: true,
      preferredTime: true,
      status: true,
      isUnlocked: true,
      seenAt: true,
      createdAt: true,
      // Always select raw data — blur is applied below, not in query
      patientName: true,
      patientPhone: true,
      patientEmail: true,
    },
  })

  const response = leads.map((lead: typeof leads[number]) => {
    const revealed = isSubscription || lead.isUnlocked
    return {
      id: lead.id,
      treatment: lead.treatment,
      location: lead.location,
      preferredTime: lead.preferredTime,
      status: lead.status,
      isUnlocked: revealed,
      isNew: lead.seenAt === null,
      createdAt: lead.createdAt,
      // Reveal or redact patient identity
      patientName: revealed ? lead.patientName : null,
      patientPhone: revealed ? lead.patientPhone : null,
      patientEmail: revealed ? lead.patientEmail : null,
    }
  })

  return NextResponse.json({ leads: response, plan })
}
