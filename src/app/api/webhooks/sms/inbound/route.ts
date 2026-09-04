import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { parseSmsInbound, smsInboundWebhookUrl, verifySmsWebhook } from '@/lib/sms'

/**
 * Inbound SMS webhook (provider-agnostic). A Powerpack / Messaging Service
 * already suppresses delivery to numbers that replied STOP; this handler mirrors
 * that into our own data by flipping the matching clinic(s) to
 * `smsNotifyMode = 'off'` (and back to `null` on START), so the dashboard and
 * send logic agree with reality.
 */
const STOP_KEYWORDS = new Set(['stop', 'stopall', 'unsubscribe', 'cancel', 'end', 'quit'])
const START_KEYWORDS = new Set(['start', 'yes', 'unstop'])

// Empty response — valid for both Twilio (TwiML) and Plivo (Plivo XML).
const EMPTY_XML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'

function xml() {
  return new NextResponse(EMPTY_XML, { status: 200, headers: { 'Content-Type': 'text/xml' } })
}

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const params: Record<string, string> = {}
  for (const [key, value] of form.entries()) {
    params[key] = typeof value === 'string' ? value : ''
  }

  if (!verifySmsWebhook({ url: smsInboundWebhookUrl(), headers: req.headers, params })) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 403 })
  }

  const inbound = parseSmsInbound(params)
  const keyword = (inbound?.body ?? '').trim().toLowerCase().replace(/[^a-z]/g, '')
  if (!inbound?.from || (!STOP_KEYWORDS.has(keyword) && !START_KEYWORDS.has(keyword))) {
    return xml()
  }

  const mode = STOP_KEYWORDS.has(keyword) ? 'off' : null

  try {
    const leads = await prisma.consultationLead.findMany({
      where: { notificationSmsTo: inbound.from },
      select: { clinicId: true },
      distinct: ['clinicId'],
    })
    const clinicIds = leads.map((l) => l.clinicId)
    if (clinicIds.length) {
      await prisma.clinic.updateMany({
        where: { id: { in: clinicIds } },
        data: { smsNotifyMode: mode },
      })
    }
  } catch (error) {
    console.error('[webhooks/sms/inbound] failed to apply opt-out:', error)
  }

  return xml()
}
