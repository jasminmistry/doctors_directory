import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: { slug: string; id: string } }) {
  const clinic = await prisma.clinic.findUnique({ where: { slug: params.slug }, select: { id: true } })
  if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })

  const id = parseInt(params.id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const existing = await prisma.booking.findFirst({ where: { id, clinicId: clinic.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { patientName, patientPhone, patientEmail, treatment, notes, slotStart, slotEnd, status } = body

  if (!patientName?.trim() || !slotStart || !slotEnd)
    return NextResponse.json({ error: 'patientName, slotStart and slotEnd are required' }, { status: 400 })
  if (new Date(slotEnd) <= new Date(slotStart))
    return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })

  const booking = await prisma.booking.update({
    where: { id },
    data: {
      patientName: patientName.trim(),
      patientPhone: patientPhone?.trim() ?? '',
      patientEmail: patientEmail?.trim() || null,
      treatment: treatment?.trim() || null,
      notes: notes?.trim() || null,
      slotStart: new Date(slotStart),
      slotEnd: new Date(slotEnd),
      status: status ?? existing.status,
    },
  })

  return NextResponse.json({ booking })
}

export async function DELETE(_req: NextRequest, { params }: { params: { slug: string; id: string } }) {
  const clinic = await prisma.clinic.findUnique({ where: { slug: params.slug }, select: { id: true } })
  if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })

  const id = parseInt(params.id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const existing = await prisma.booking.findFirst({ where: { id, clinicId: clinic.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.booking.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
