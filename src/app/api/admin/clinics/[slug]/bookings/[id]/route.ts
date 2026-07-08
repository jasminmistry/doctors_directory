import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
    return NextResponse.json({ error: 'Patient name is required.' }, { status: 400 })
  if (patientEmail?.trim() && !EMAIL_RE.test(patientEmail.trim()))
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  if (patientPhone?.trim() && !UK_PHONE_RE.test(patientPhone.trim().replace(/\s/g, '')))
    return NextResponse.json({ error: 'Please enter a valid UK phone number.' }, { status: 400 })
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
