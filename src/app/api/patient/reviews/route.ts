export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requirePatient } from '@/lib/patient-auth'

export async function GET(req: NextRequest) {
  const { patient, error } = await requirePatient(req)
  if (error) return error

  const clinicSlug = req.nextUrl.searchParams.get('clinicSlug')
  if (!clinicSlug) {
    return NextResponse.json({ error: 'clinicSlug is required' }, { status: 400 })
  }

  const clinic = await prisma.clinic.findFirst({ where: { slug: clinicSlug } })
  if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })

  const review = await prisma.platformReview.findFirst({
    where: { clinicId: clinic.id, patientId: patient.id },
  })

  return NextResponse.json({ review }, { headers: { 'Cache-Control': 'no-store' } })
}

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

  const existing = await prisma.platformReview.findFirst({
    where: { clinicId: clinic.id, patientId: patient.id },
  })
  if (existing) {
    return NextResponse.json({ error: "You've already reviewed this clinic." }, { status: 409 })
  }

  // Verified patient = they have a completed booking at this clinic
  const hasCompletedBooking = await prisma.booking.findFirst({
    where: { clinicId: clinic.id, patientId: patient.id, status: 'completed' },
  })

  try {
    const review = await prisma.platformReview.create({
      data: {
        clinicId: clinic.id,
        patientId: patient.id,
        patientName: [patient.firstName, patient.lastName].filter(Boolean).join(' ') || patient.email,
        rating: ratingInt,
        reviewText: reviewText.trim(),
        treatment: treatment?.trim() || null,
        isVerifiedPatient: Boolean(hasCompletedBooking),
      },
    })
    return NextResponse.json({ review }, { status: 201 })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: "You've already reviewed this clinic." }, { status: 409 })
    }
    throw err
  }
}
