export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { requirePatient } from '@/lib/patient-auth'

const postSchema = z.object({
  content: z.string().min(1).max(2000),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { patient, error } = await requirePatient(req)
  if (error) return error

  const id = parseInt(params.id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const session = await prisma.chatSession.findFirst({
    where: { id, patientId: patient.id },
    include: { clinic: { select: { id: true, name: true, slug: true } } },
  })
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const since = req.nextUrl.searchParams.get('since')
  const messages = await prisma.chatMessage.findMany({
    where: {
      sessionId: id,
      ...(since ? { createdAt: { gt: new Date(since) } } : {}),
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ session, messages }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { patient, error } = await requirePatient(req)
  if (error) return error

  const id = parseInt(params.id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const session = await prisma.chatSession.findFirst({
    where: { id, patientId: patient.id, status: 'active' },
  })
  if (!session) return NextResponse.json({ error: 'Not found or closed' }, { status: 404 })

  const body = postSchema.safeParse(await req.json())
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 })
  }

  const message = await prisma.chatMessage.create({
    data: { sessionId: session.id, sender: 'patient', content: body.data.content },
  })

  return NextResponse.json({ message }, { status: 201 })
}
