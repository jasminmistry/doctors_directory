import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifySmsTrackingToken } from '@/lib/sms-tracking'
import { sendMpEvents, syntheticClientId } from '@/lib/analytics/measurement-protocol'

/**
 * Tracked link inside a lead-notification SMS. Tapping it stamps
 * `notificationSmsReadAt` (the SMS analogue of the email open pixel), then
 * redirects the clinic on to where they can act on the lead.
 */
export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const fallback = `${baseUrl}/directory/portal/clinic/prospects`

  const claims = verifySmsTrackingToken(params.token)
  if (!claims) {
    return NextResponse.redirect(fallback, { status: 302 })
  }

  let destination = fallback
  try {
    const lead = await prisma.consultationLead.findUnique({
      where: { id: claims.id },
      select: {
        notificationSmsReadAt: true,
        clinic: { select: { slug: true, claimed: true, gaClientId: true, id: true } },
      },
    })

    if (lead) {
      destination = lead.clinic.claimed
        ? `${baseUrl}/directory/portal/clinic/prospects`
        : `${baseUrl}/directory/claim/${lead.clinic.slug}`

      if (!lead.notificationSmsReadAt) {
        await prisma.consultationLead.updateMany({
          where: { id: claims.id, notificationSmsReadAt: null },
          data: { notificationSmsReadAt: new Date() },
        })
        await sendMpEvents(
          lead.clinic.gaClientId ?? syntheticClientId(`clinic-${lead.clinic.id}`),
          [{ name: 'sms_notification_read', params: { clinic_slug: lead.clinic.slug, ghost: !lead.clinic.claimed } }],
        )
      }
    }
  } catch (error) {
    console.error('[track/sms-click] failed to record read:', error)
  }

  return NextResponse.redirect(destination, { status: 302 })
}
