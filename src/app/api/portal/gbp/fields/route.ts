import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { guardGbpPortal } from '@/lib/gbp/portal-guard'
import { gbpFieldsSchema } from '@/lib/schemas/gbp.schema'
import { persistGbpFields } from '@/lib/gbp/persist-fields'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await guardGbpPortal()
  if (!guard.ok) return guard.response

  const clinic = await prisma.clinic.findUnique({
    where: { id: guard.clinicId },
    select: {
      name: true,
      slug: true,
      website: true,
      aboutSection: true,
      placeId: true,
      gmapsUrl: true,
      gmapsAddress: true,
      gbpPrimaryPhone: true,
      additionalPhones: true,
      gbpPrimaryCategoryId: true,
      gbpPrimaryCategoryName: true,
      gbpAdditionalCategories: true,
      gbpServiceArea: true,
      gbpBookingUrl: true,
      gbpFieldsUpdatedAt: true,
      address: true,
      hourPeriods: { orderBy: { sortOrder: 'asc' } },
      services: { orderBy: { sortOrder: 'asc' } },
      gbpConnection: { select: { status: true, locationName: true, newReviewUri: true, googleEmail: true } },
    },
  })
  if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })

  return NextResponse.json({ ...clinic, plan: guard.plan, idVerified: guard.idVerified })
}

export async function PATCH(request: Request) {
  const guard = await guardGbpPortal()
  if (!guard.ok) return guard.response
  if (!guard.idVerified) {
    return NextResponse.json({ error: 'Profile editing requires ID verification' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = gbpFieldsSchema.safeParse(body)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.errors) {
      const key = issue.path.join('.')
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return NextResponse.json({ error: 'Please fix the highlighted fields', fieldErrors }, { status: 400 })
  }

  try {
    await persistGbpFields(guard.clinicId, parsed.data, { source: 'manual' })
    revalidatePath('/portal/clinic/google')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[portal/gbp/fields] update failed:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
