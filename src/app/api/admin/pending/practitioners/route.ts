import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { updatePractitioner } from '@/lib/data-access/practitioners'

export async function GET() {
  try {
    const records = await prisma.pendingPractitioner.findMany({
      where: { status: 'pending' },
      orderBy: { submittedAt: 'desc' },
    })
    const items = records.map((r) => {
      try {
        const parsed = JSON.parse(r.submittedData)
        return { ...parsed, _pendingId: r.id, status: r.status, submittedAt: r.submittedAt }
      } catch {
        return { _pendingId: r.id, status: r.status, submittedAt: r.submittedAt }
      }
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error('Failed to get pending practitioners:', error)
    return NextResponse.json({ error: 'Failed to get pending practitioners' }, { status: 500 })
  }
}

function mapToPrismaPractitioner(data: any) {
  return {
    displayName: data.practitioner_name ?? undefined,
    title: data.practitioner_title ?? undefined,
    specialty: data.practitioner_specialty ?? undefined,
    imageUrl: data.practitioner_image_link ?? undefined,
    qualifications: data.practitioner_qualifications ? JSON.parse(data.practitioner_qualifications) : undefined,
    awards: data.practitioner_awards ? JSON.parse(data.practitioner_awards) : undefined,
    roles: data.practitioner_roles ? JSON.parse(data.practitioner_roles) : undefined,
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    if (!data.slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 })
    }

    // Find matching pending record (slug is inside submittedData JSON)
    const allPending = await prisma.pendingPractitioner.findMany()
    const pending = allPending.find((r) => {
      try { return JSON.parse(r.submittedData).slug === data.slug } catch { return false }
    })

    if (pending) {
      await prisma.pendingPractitioner.update({
        where: { id: pending.id },
        data: { status: 'approved', reviewedAt: new Date() },
      })
    }

    // Update main practitioner record with mapped scalar fields
    try {
      await updatePractitioner(data.slug, mapToPrismaPractitioner(data))
    } catch {
      console.error('Could not update main practitioner record for slug:', data.slug)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to approve practitioner:', error)
    return NextResponse.json({ error: 'Failed to approve practitioner' }, { status: 500 })
  }
}