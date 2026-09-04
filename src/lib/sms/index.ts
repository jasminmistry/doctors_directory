import { plivoProvider } from './plivo'
import { twilioProvider } from './twilio'
import type {
  SmsProvider,
  SmsProviderName,
  SmsSendResult,
  SmsWebhookRequest,
} from './provider'

/**
 * Outbound SMS — the lead-notification counterpart to `email.ts`, behind a
 * provider adapter (`SMS_PROVIDER` env: `plivo` default, `twilio`, or `off`).
 *
 * Sent alongside or instead of the clinic notification email depending on
 * `SMS_SEND_MODE` / `Clinic.smsNotifyMode` (see `lead-sms-notify.ts`). Delivery
 * is tracked two ways:
 *   - carrier receipt  → status webhook → `notificationSmsDeliveredAt`
 *   - link tap ("read") → `/api/track/sms-click/[token]` → `notificationSmsReadAt`
 *
 * With no provider configured every send is a logged no-op, so local dev and CI
 * need no SMS account.
 */

export type {
  SmsProvider,
  SmsProviderName,
  SmsSendResult,
  SmsDeliveryStatus,
  SmsStatusUpdate,
  SmsInboundMessage,
  SmsWebhookRequest,
} from './provider'

const PROVIDERS: Record<SmsProviderName, SmsProvider> = {
  twilio: twilioProvider,
  plivo: plivoProvider,
}

const DEFAULT_PROVIDER: SmsProviderName = 'plivo'

/** The provider `SMS_PROVIDER` selects — default `plivo`; `off`/`none`/`disabled` → null. */
export function activeProviderName(): SmsProviderName | null {
  const raw = (process.env.SMS_PROVIDER ?? DEFAULT_PROVIDER).trim().toLowerCase()
  if (raw === 'off' || raw === 'none' || raw === 'disabled' || raw === '') return null
  if (raw === 'twilio' || raw === 'plivo') return raw
  console.warn(`[sms] unknown SMS_PROVIDER "${raw}" — falling back to ${DEFAULT_PROVIDER}`)
  return DEFAULT_PROVIDER
}

export function getActiveProvider(): SmsProvider | null {
  const name = activeProviderName()
  return name ? PROVIDERS[name] : null
}

export function isSmsConfigured(): boolean {
  const provider = getActiveProvider()
  return provider ? provider.isConfigured() : false
}

/**
 * Public URL the provider POSTs delivery-status updates to. Returns null for a
 * non-public base URL (local dev) — providers reject a callback they can't reach,
 * so we just omit it there.
 */
export function smsStatusCallbackUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  if (!/^https:\/\//.test(base) || /localhost|127\.0\.0\.1/.test(base)) return null
  return `${base}/directory/api/webhooks/sms/status`
}

/** URL the provider POSTs inbound messages (STOP/START replies) to — used for signature checks. */
export function smsInboundWebhookUrl(): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  return `${base}/directory/api/webhooks/sms/inbound`
}

/** Verify an SMS webhook against the active provider. */
export function verifySmsWebhook(req: SmsWebhookRequest): boolean {
  return getActiveProvider()?.verifyWebhook(req) ?? false
}

export function parseSmsStatus(params: Record<string, string>) {
  return getActiveProvider()?.parseStatus(params) ?? null
}

export function parseSmsInbound(params: Record<string, string>) {
  return getActiveProvider()?.parseInbound(params) ?? null
}

interface SendArgs {
  /** E.164 recipient. */
  to: string
  body: string
}

/**
 * Low-level send. Returns `null` when SMS is disabled or the active provider
 * isn't configured (logged no-op); throws on an actual provider API error so the
 * caller can record the failure.
 */
async function send({ to, body }: SendArgs): Promise<SmsSendResult | null> {
  const provider = getActiveProvider()
  if (!provider || !provider.isConfigured()) {
    console.warn(`[sms] provider "${activeProviderName() ?? 'off'}" not configured — skipping send to`, to)
    return null
  }
  return provider.send({ to, body, statusCallback: smsStatusCallbackUrl() })
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
