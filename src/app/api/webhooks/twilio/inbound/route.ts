import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { prisma } from '@/lib/db'

/**
 * Inbound SMS webhook. Twilio's Messaging Service already suppresses delivery to
 * numbers that have replied STOP; this handler mirrors that into our own data by
 * flipping the matching clinic(s) to `smsNotifyMode = 'off'`, so the dashboard and
 * send logic agree with reality.
 */
const STOP_KEYWORDS = new Set(['stop', 'stopall', 'unsubscribe', 'cancel', 'end', 'quit'])
const START_KEYWORDS = new Set(['start', 'yes', 'unstop'])

const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'

function twiml() {
  return new NextResponse(EMPTY_TWIML, { status: 200, headers: { 'Content-Type': 'text/xml' } })
}

export async function POST(req: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const signature = req.headers.get('x-twilio-signature')
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const url = `${baseUrl}/directory/api/webhooks/twilio/inbound`

  const form = await req.formData()
  const params: Record<string, string> = {}
  for (const [key, value] of form.entries()) {
    params[key] = typeof value === 'string' ? value : ''
  }

  if (!authToken || !signature || !twilio.validateRequest(authToken, signature, url, params)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 403 })
  }

  const from = params.From
  const keyword = (params.Body || '').trim().toLowerCase().replace(/[^a-z]/g, '')
  if (!from || (!STOP_KEYWORDS.has(keyword) && !START_KEYWORDS.has(keyword))) {
    return twiml()
  }

  const mode = STOP_KEYWORDS.has(keyword) ? 'off' : null

  try {
    const leads = await prisma.consultationLead.findMany({
      where: { notificationSmsTo: from },
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
    console.error('[webhooks/twilio/inbound] failed to apply opt-out:', error)
  }

  return twiml()
}
