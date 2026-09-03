import twilio from 'twilio'

/**
 * Outbound SMS via Twilio — the lead-notification counterpart to `email.ts`.
 *
 * Sent alongside or instead of the clinic notification email depending on
 * `SMS_SEND_MODE` (env) / `Clinic.smsNotifyMode` (per-clinic override). Delivery
 * is tracked two ways:
 *   - carrier receipt  → status-callback webhook  → `notificationSmsDeliveredAt`
 *   - link tap ("read") → `/api/track/sms-click/[token]` → `notificationSmsReadAt`
 *
 * Required env: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and a sender — either
 * `TWILIO_MESSAGING_SERVICE_SID` (preferred: pooled senders + automatic
 * STOP/START opt-out handling) or a plain `TWILIO_FROM_NUMBER` in E.164. Without
 * them every send is a logged no-op so local dev and CI don't need a Twilio account.
 */

type TwilioClient = ReturnType<typeof twilio>

let cachedClient: TwilioClient | null = null

/** `messagingServiceSid` when set, otherwise `from`. Null when no sender is configured. */
function senderParams(): { messagingServiceSid: string } | { from: string } | null {
  if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
    return { messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID }
  }
  if (process.env.TWILIO_FROM_NUMBER) {
    return { from: process.env.TWILIO_FROM_NUMBER }
  }
  return null
}

export function isSmsConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && senderParams(),
  )
}

function getClient(): TwilioClient | null {
  if (!isSmsConfigured()) return null
  if (!cachedClient) {
    cachedClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
  }
  return cachedClient
}

/**
 * Twilio POSTs message status changes here (queued → sent → delivered / failed).
 * Returns null for a non-public base URL (local dev) — Twilio rejects a
 * statusCallback it can't reach, so we just omit it there.
 */
export function smsStatusCallbackUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  if (!/^https:\/\//.test(base) || /localhost|127\.0\.0\.1/.test(base)) return null
  return `${base}/directory/api/webhooks/twilio/sms`
}

export interface SmsSendResult {
  sid: string
  status: string
}

interface SendArgs {
  /** E.164 recipient. */
  to: string
  body: string
}

/**
 * Low-level send. Returns `null` when Twilio isn't configured (logged no-op);
 * throws on an actual Twilio API error so the caller can record the failure.
 */
async function send({ to, body }: SendArgs): Promise<SmsSendResult | null> {
  const client = getClient()
  const sender = senderParams()
  if (!client || !sender) {
    console.warn('[sms] Twilio not configured — skipping send to', to)
    return null
  }

  const statusCallback = smsStatusCallbackUrl()
  const msg = await client.messages.create({
    to,
    body,
    ...sender,
    ...(statusCallback ? { statusCallback } : {}),
  })

  return { sid: msg.sid, status: msg.status }
}

const OPT_OUT = 'Reply STOP to opt out.'

function sourceLabel(leadSource: string | undefined): string {
  return leadSource === 'pricing' ? 'pricing enquiry' : 'consultation request'
}

/** Full notification for a claimed clinic — the SMS twin of `sendLeadNotificationEmail`. */
export async function sendLeadNotificationSms({
  to,
  clinicName,
  leadSource,
  trackedUrl,
}: {
  to: string
  clinicName: string
  leadSource?: string
  /** Signed `/api/track/sms-click/…` link — tap = "read". */
  trackedUrl: string
}): Promise<SmsSendResult | null> {
  const body = `New ${sourceLabel(leadSource)} for ${clinicName} via Consentz Directory. View the lead: ${trackedUrl}\n\n${OPT_OUT}`
  return send({ to, body })
}

/** "Unlock to view" teaser for pay-per-lead / free clinics — twin of `sendPplLeadTeaserEmail`. */
export async function sendLeadTeaserSms({
  to,
  clinicName,
  leadSource,
  trackedUrl,
}: {
  to: string
  clinicName: string
  leadSource?: string
  trackedUrl: string
}): Promise<SmsSendResult | null> {
  const body = `New ${sourceLabel(leadSource)} for ${clinicName} via Consentz Directory. Open your portal to unlock the patient's details: ${trackedUrl}\n\n${OPT_OUT}`
  return send({ to, body })
}

/** "Claim your profile" hook for an unclaimed clinic — twin of `sendGhostLeadHook`. */
export async function sendGhostLeadSms({
  to,
  clinicName,
  trackedUrl,
}: {
  to: string
  clinicName: string
  trackedUrl: string
}): Promise<SmsSendResult | null> {
  const body = `A patient requested a consultation at ${clinicName} via Consentz Directory. Claim your free profile to respond: ${trackedUrl}\n\n${OPT_OUT}`
  return send({ to, body })
}
