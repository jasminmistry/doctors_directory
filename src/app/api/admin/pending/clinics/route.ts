import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { updateClinic } from '@/lib/data-access/clinics'

export async function GET() {
  try {
    const records = await prisma.pendingClinic.findMany({
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
    console.error('Failed to get pending clinics:', error)
    return NextResponse.json({ error: 'Failed to get pending clinics' }, { status: 500 })
  }
}

function mapToPrismaClinic(data: any) {
  return {
    image: data.image ?? undefined,
    gmapsUrl: data.url ?? undefined,
    gmapsAddress: data.gmapsAddress ?? undefined,
    gmapsPhone: data.gmapsPhone ?? undefined,
    category: data.category ?? undefined,
    rating: data.rating ?? undefined,
    reviewCount: data.reviewCount ?? undefined,
    aboutSection: data.about_section ?? undefined,
    accreditations: data.accreditations ?? undefined,
    awards: data.awards ?? undefined,
    affiliations: data.affiliations ?? undefined,
    website: data.website ?? undefined,
    email: data.email ?? undefined,
    facebook: data.facebook ?? undefined,
    twitter: data.twitter ?? undefined,
    xTwitter: data.x_twitter ?? undefined,
    instagram: data.instagram ?? undefined,
    youtube: data.youtube ?? undefined,
    linkedin: data.Linkedin ?? undefined,
    isSaveFace: data.isSaveFace ?? undefined,
    isDoctor: data.isDoctor ?? undefined,
    isJccp: Array.isArray(data.isJCCP) ? data.isJCCP[0] : (data.isJCCP ?? undefined),
    isCqc: Array.isArray(data.isCQC) ? data.isCQC[0] : (data.isCQC ?? undefined),
    isHiw: Array.isArray(data.isHIW) ? data.isHIW[0] : (data.isHIW ?? undefined),
    isHis: Array.isArray(data.isHIS) ? data.isHIS[0] : (data.isHIS ?? undefined),
    isRqia: Array.isArray(data.isRQIA) ? data.isRQIA[0] : (data.isRQIA ?? undefined),
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    if (!data.slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 })
    }

    // Find matching pending record (slug is inside submittedData JSON)
    const allPending = await prisma.pendingClinic.findMany()
    const pending = allPending.find((r) => {
      try { return JSON.parse(r.submittedData).slug === data.slug } catch { return false }
    })

    if (pending) {
      await prisma.pendingClinic.update({
        where: { id: pending.id },
        data: { status: 'approved', reviewedAt: new Date() },
      })
    }

    // Update main clinic record with mapped scalar fields
    try {
      await updateClinic(data.slug, mapToPrismaClinic(data))
    } catch {
      console.error('Could not update main clinic record for slug:', data.slug)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to approve clinic:', error)
    return NextResponse.json({ error: 'Failed to approve clinic' }, { status: 500 })
  }
}