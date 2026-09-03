import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { prisma } from '@/lib/db'
import { smsStatusCallbackUrl } from '@/lib/sms'
import { sendMpEvents, syntheticClientId } from '@/lib/analytics/measurement-protocol'

/**
 * Twilio message status callback. Fires on every state change
 * (queued → sent → delivered / undelivered / failed, plus `read` on RCS/WhatsApp).
 * We record the carrier delivery receipt as `notificationSmsDeliveredAt` — the
 * "read" timestamp comes from the tracked link tap, not from here.
 */
export async function POST(req: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const signature = req.headers.get('x-twilio-signature')

  const form = await req.formData()
  const params: Record<string, string> = {}
  for (const [key, value] of form.entries()) {
    params[key] = typeof value === 'string' ? value : ''
  }

  // Reject anything not genuinely from Twilio. Signature is computed over the
  // exact callback URL Twilio was given — use the configured one, falling back to
  // the request URL.
  const callbackUrl = smsStatusCallbackUrl() ?? req.url
  if (
    !authToken ||
    !signature ||
    !twilio.validateRequest(authToken, signature, callbackUrl, params)
  ) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 403 })
  }

  const sid = params.MessageSid || params.SmsSid
  const status = params.MessageStatus || params.SmsStatus
  if (!sid || !status) {
    return new NextResponse(null, { status: 204 })
  }

  try {
    const lead = await prisma.consultationLead.findFirst({
      where: { notificationSmsSid: sid },
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
      } = { notificationSmsStatus: status }

      if ((status === 'delivered' || status === 'read') && !lead.notificationSmsDeliveredAt) {
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
    console.error('[webhooks/twilio/sms] failed to record status:', error)
  }

  return new NextResponse(null, { status: 204 })
}
