export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { requirePatient, clearPatientCookie } from '@/lib/patient-auth'

const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/

const updateSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional().nullable(),
  lastName: z.string().trim().min(1).max(100).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable()
    .refine((v) => !v || UK_PHONE_RE.test(v.replace(/\s/g, '')), 'Please enter a valid UK phone number.'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
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
    dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.toISOString().slice(0, 10) : null,
    createdAt: patient.createdAt,
  }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PUT(req: NextRequest) {
  const { patient, error } = await requirePatient(req)
  if (error) return error

  const body = updateSchema.safeParse(await req.json())
  if (!body.success) {
    const message = body.error.issues[0]?.message ?? 'Please check the form and try again.'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const { dateOfBirth, ...rest } = body.data
  const updated = await prisma.patient.update({
    where: { id: patient.id },
    data: {
      ...rest,
      ...(dateOfBirth !== undefined
        ? { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }
        : {}),
    },
  })

  return NextResponse.json({
    id: updated.id,
    email: updated.email,
    firstName: updated.firstName,
    lastName: updated.lastName,
    phone: updated.phone,
    dateOfBirth: updated.dateOfBirth ? updated.dateOfBirth.toISOString().slice(0, 10) : null,
  }, { headers: { 'Cache-Control': 'no-store' } })
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
