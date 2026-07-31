import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createCoreBooking, isCoreConfigured } from '@/lib/core-api'
import { splitName, COOKIE_TOKEN } from '@/lib/auth'
import { generateConsentzPassword, getConsentzToken, initConsentzPatient } from '@/lib/patient-consentz'

const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const clinic = await prisma.clinic.findUnique({
    where: { slug: params.slug },
    select: { id: true, claimedPlan: true },
  })

  if (!clinic) {
    return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const bookings = await prisma.booking.findMany({
    where: {
      clinicId: clinic.id,
      ...(from || to
        ? {
            slotStart: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    orderBy: { slotStart: 'asc' },
  })

  return NextResponse.json({ bookings, plan: clinic.claimedPlan })
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const clinic = await prisma.clinic.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      coreClinicId: true,
      claimRequests: {
        where: { status: 'approved', consentzUserId: { not: null } },
        orderBy: { approvedAt: 'desc' },
        take: 1,
        select: { consentzUserId: true },
      },
    },
  })

  if (!clinic) {
    return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { patientName, patientPhone, patientEmail, treatment, notes, slotStart, slotEnd, status, coreBookingId } = body

  if (!patientName?.trim() || !slotStart || !slotEnd) {
    return NextResponse.json({ error: 'Patient name is required.' }, { status: 400 })
  }
  if (patientEmail?.trim() && !EMAIL_RE.test(patientEmail.trim())) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }
  if (patientPhone?.trim() && !UK_PHONE_RE.test(patientPhone.trim().replace(/\s/g, ''))) {
    return NextResponse.json({ error: 'Please enter a valid UK phone number.' }, { status: 400 })
  }
  if (new Date(slotEnd) <= new Date(slotStart)) {
    return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
  }

  const cleanEmail = patientEmail?.trim() || null

  // Resolve/create a local Patient record by email so Core can be told about a real
  // patient account (via patient_token/patient_password below) instead of just raw
  // contact strings — Core only appears to email a confirmation when it can link the
  // booking to a patient account, which is why staff-created bookings were silent.
  const patient = cleanEmail
    ? await prisma.patient.findUnique({ where: { email: cleanEmail } }).then((existing) => {
        if (existing) return existing
        const { firstName, lastName } = splitName(patientName.trim())
        return prisma.patient.create({
          data: { email: cleanEmail, firstName, lastName, phone: patientPhone?.trim() || null },
        })
      }).catch((err) => {
        console.error('[admin/bookings] failed to resolve patient record:', err)
        return null
      })
    : null

  const booking = await prisma.booking.create({
    data: {
      clinicId: clinic.id,
      patientName: patientName.trim(),
      patientPhone: patientPhone?.trim() ?? '',
      patientEmail: cleanEmail,
      treatment: treatment?.trim() || null,
      notes: notes?.trim() || null,
      slotStart: new Date(slotStart),
      slotEnd: new Date(slotEnd),
      status: status ?? 'confirmed',
      coreBookingId: coreBookingId ?? null,
      syncedFromCore: !!coreBookingId,
      lastSyncedAt: coreBookingId ? new Date() : null,
      ...(patient ? { patientId: patient.id } : {}),
    },
  })

  // Push to Consentz Core if configured and clinic has a Core account
  if (isCoreConfigured() && !coreBookingId) {
    const sessionToken = req.cookies.get(COOKIE_TOKEN)?.value
    const coreClinicId = clinic.coreClinicId
    const practitionerId = clinic.claimRequests[0]?.consentzUserId

    if (coreClinicId && practitionerId) {
      const { firstName, lastName } = splitName(patientName.trim())

      // Same account-provisioning handshake as the patient-facing booking route: send an
      // existing session token for a known Consentz patient, or a fresh password so Core
      // can create/link the account on this booking.
      let pendingPassword: string | null = null
      let patientToken: string | null = null
      if (patient) {
        if (patient.consentzPassword) {
          patientToken = await getConsentzToken(patient)
        } else {
          pendingPassword = generateConsentzPassword()
        }
      }

      try {
        const coreRes = await createCoreBooking(coreClinicId, {
          practitioner_id: practitionerId,
          slot_start: slotStart,
          slot_end: slotEnd,
          patient_first_name: firstName,
          patient_last_name: lastName,
          patient_email: cleanEmail || '',
          patient_phone: patientPhone?.trim() || '',
          ...(patientToken ? { patient_token: patientToken } : {}),
          ...(pendingPassword ? { patient_password: pendingPassword } : {}),
        }, sessionToken)

        if (patient && pendingPassword) {
          initConsentzPatient(patient.id, cleanEmail!, pendingPassword).catch(
            (err) => console.error('[admin/bookings] initConsentzPatient failed:', err),
          )
        }

        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            coreBookingId: String(coreRes.booking.id),
            syncedFromCore: true,
            lastSyncedAt: new Date(),
          },
        })
        booking.coreBookingId = String(coreRes.booking.id)
        booking.syncedFromCore = true
        console.info(`[admin/bookings] Synced booking ${booking.id} → Core booking ${coreRes.booking.id}`)
      } catch (err: unknown) {
        console.error('[admin/bookings] Core sync failed:', (err as { message?: string })?.message)
      }
    } else {
      console.info('[admin/bookings] Skipping Core sync — coreClinicId=%s practitionerId=%s', coreClinicId, practitionerId)
    }
  }

  return NextResponse.json({ booking }, { status: 201 })
}
