export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requirePatient } from '@/lib/patient-auth'

export async function POST(req: NextRequest) {
  const { patient, error } = await requirePatient(req)
  if (error) return error

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { clinicSlug, rating, reviewText, treatment } = body

  if (!clinicSlug || !rating || !reviewText?.trim()) {
    return NextResponse.json(
      { error: 'clinicSlug, rating, and reviewText are required' },
      { status: 400 },
    )
  }

  const ratingInt = Math.round(Number(rating))
  if (ratingInt < 1 || ratingInt > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }

  const clinic = await prisma.clinic.findFirst({ where: { slug: clinicSlug } })
  if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })

  // Verified patient = they have a completed booking at this clinic
  const hasCompletedBooking = await prisma.booking.findFirst({
    where: { clinicId: clinic.id, patientId: patient.id, status: 'completed' },
  })

  const review = await prisma.platformReview.create({
    data: {
      clinicId: clinic.id,
      patientName: [patient.firstName, patient.lastName].filter(Boolean).join(' ') || patient.email,
      rating: ratingInt,
      reviewText: reviewText.trim(),
      treatment: treatment?.trim() || null,
      isVerifiedPatient: Boolean(hasCompletedBooking),
    },
  })

  return NextResponse.json({ review }, { status: 201 })
}
