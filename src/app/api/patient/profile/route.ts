import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { requirePatient, clearPatientCookie } from '@/lib/patient-auth'

const updateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional().nullable(),
})

export async function GET(req: NextRequest) {
  const { patient, error } = await requirePatient(req)
  if (error) return error
  return NextResponse.json({
    id: patient.id,
    email: patient.email,
    firstName: patient.firstName,
    lastName: patient.lastName,
    phone: patient.phone,
    createdAt: patient.createdAt,
  })
}

export async function PUT(req: NextRequest) {
  const { patient, error } = await requirePatient(req)
  if (error) return error

  const body = updateSchema.safeParse(await req.json())
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 })
  }

  const updated = await prisma.patient.update({
    where: { id: patient.id },
    data: body.data,
  })

  return NextResponse.json({
    id: updated.id,
    email: updated.email,
    firstName: updated.firstName,
    lastName: updated.lastName,
    phone: updated.phone,
  })
}

export async function DELETE(req: NextRequest) {
  const { patient, error } = await requirePatient(req)
  if (error) return error

  // GDPR: anonymise linked records, then hard-delete the patient row
  const ANON_NAME = 'Deleted User'
  const ANON_EMAIL = `deleted-${patient.id}@anonymised.local`

  await prisma.$transaction([
    // Anonymise bookings
    prisma.booking.updateMany({
      where: { patientId: patient.id },
      data: {
        patientName: ANON_NAME,
        patientEmail: ANON_EMAIL,
        patientPhone: '',
        patientId: null,
      },
    }),
    // Anonymise chat sessions
    prisma.chatSession.updateMany({
      where: { patientId: patient.id },
      data: {
        patientName: ANON_NAME,
        patientEmail: ANON_EMAIL,
        patientId: null,
      },
    }),
    // Anonymise leads
    prisma.consultationLead.updateMany({
      where: { patientId: patient.id },
      data: {
        patientName: ANON_NAME,
        patientEmail: ANON_EMAIL,
        patientId: null,
      },
    }),
    // Hard delete the patient (cascades OTPs)
    prisma.patient.delete({ where: { id: patient.id } }),
  ])

  const res = NextResponse.json({ ok: true })
  clearPatientCookie(res)
  return res
}
