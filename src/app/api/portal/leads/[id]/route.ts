export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPortalUser } from '@/lib/portal'

const VALID_STATUSES = ['new', 'contacted', 'booked', 'lost', 'spam', 'archived', 'closed'] as const
type PipelineStatus = typeof VALID_STATUSES[number]

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getPortalUser()
  if (!user || !user.clinicId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = parseInt(params.id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const update: {
    pipelineStatus?: PipelineStatus
    notes?: string | null
    ownerName?: string | null
  } = {}

  if ('pipelineStatus' in body) {
    if (!VALID_STATUSES.includes(body.pipelineStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    update.pipelineStatus = body.pipelineStatus
  }

  if ('notes' in body) {
    update.notes = typeof body.notes === 'string' ? body.notes.trim() || null : null
  }

  if ('ownerName' in body) {
    update.ownerName = typeof body.ownerName === 'string' ? body.ownerName.trim() || null : null
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const existing = await prisma.consultationLead.findFirst({
    where: { id, clinicId: user.clinicId },
    select: { id: true },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const lead = await prisma.consultationLead.update({
    where: { id },
    data: update,
    select: { id: true, pipelineStatus: true, notes: true, ownerName: true, coreSynced: true },
  })

  return NextResponse.json({ lead })
}
