export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'
import { calculateAge } from '@/lib/utils'

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
      pipelineStatus: true,
      notes: true,
      ownerName: true,
      coreSynced: true,
      isUnlocked: true,
      seenAt: true,
      createdAt: true,
      patientName: true,
      patientPhone: true,
      patientEmail: true,
      source: true,
      patient: { select: { dateOfBirth: true } },
    },
  })

  const response = leads.map((lead: typeof leads[number]) => {
    const revealed = isSubscription || lead.isUnlocked
    const age = lead.patient?.dateOfBirth ? calculateAge(lead.patient.dateOfBirth) : null
    return {
      id: lead.id,
      treatment: lead.treatment,
      location: lead.location,
      preferredTime: lead.preferredTime,
      status: lead.status,
      pipelineStatus: lead.pipelineStatus,
      notes: lead.notes,
      ownerName: lead.ownerName,
      coreSynced: lead.coreSynced,
      isUnlocked: revealed,
      isNew: lead.seenAt === null,
      createdAt: lead.createdAt,
      patientName: revealed ? lead.patientName : null,
      patientPhone: revealed ? lead.patientPhone : null,
      patientEmail: revealed ? lead.patientEmail : null,
      patientAge: revealed ? age : null,
      source: lead.source,
    }
  })

  return NextResponse.json({ leads: response, plan })
}
