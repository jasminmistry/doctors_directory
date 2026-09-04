import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { sendMpEvents, syntheticClientId } from '@/lib/analytics/measurement-protocol'
import { parseSmsStatus, smsStatusCallbackUrl, verifySmsWebhook } from '@/lib/sms'

/**
 * SMS delivery-status callback (provider-agnostic — routed through the active
 * adapter). Fires on every state change; we record the carrier delivery receipt
 * as `notificationSmsDeliveredAt`. The "read" timestamp comes from the tracked
 * link tap (`/api/track/sms-click/[token]`), not from here.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData()
  const params: Record<string, string> = {}
  for (const [key, value] of form.entries()) {
    params[key] = typeof value === 'string' ? value : ''
  }

  // Signature is computed over the exact callback URL the provider was given —
  // use the configured one, falling back to the request URL.
  const url = smsStatusCallbackUrl() ?? req.url
  if (!verifySmsWebhook({ url, headers: req.headers, params })) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 403 })
  }

  const update = parseSmsStatus(params)
  if (!update) {
    return new NextResponse(null, { status: 204 })
  }

  try {
    const lead = await prisma.consultationLead.findFirst({
      where: { notificationSmsSid: update.sid },
      select: {
        id: true,
        notificationSmsDeliveredAt: true,
        clinic: { select: { id: true, slug: true, gaClientId: true } },
      },
    })

    if (lead) {
      const data: {
        notificationSmsStatus: string
        notificationSmsDeliveredAt?: Date
      } = { notificationSmsStatus: update.raw }

      if (
        (update.status === 'delivered' || update.status === 'read') &&
        !lead.notificationSmsDeliveredAt
      ) {
        data.notificationSmsDeliveredAt = new Date()
      }

      await prisma.consultationLead.update({ where: { id: lead.id }, data })

      if (data.notificationSmsDeliveredAt) {
        await sendMpEvents(
          lead.clinic.gaClientId ?? syntheticClientId(`clinic-${lead.clinic.id}`),
          [{ name: 'sms_notification_delivered', params: { clinic_slug: lead.clinic.slug } }],
        )
      }
    }
  } catch (error) {
    console.error('[webhooks/sms/status] failed to record status:', error)
  }

  return new NextResponse(null, { status: 204 })
}
