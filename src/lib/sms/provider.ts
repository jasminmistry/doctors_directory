/**
 * SMS provider adapter contract.
 *
 * The lead-notification flow talks only to `@/lib/sms` (index) — never to a
 * concrete provider. Each provider (`twilio.ts`, `plivo.ts`) implements this
 * interface; `index.ts` picks the active one from `SMS_PROVIDER` (default
 * `plivo`). Adding a third provider is a new file + one line in `PROVIDERS`.
 */

export type SmsProviderName = 'twilio' | 'plivo'

/** Every provider's delivery vocabulary mapped onto one canonical set. */
export type SmsDeliveryStatus =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'undelivered'
  | 'failed'
  | 'read'
  | 'unknown'

export interface SmsSendResult {
  /** Provider message id — Twilio SID / Plivo MessageUUID. Stored on the lead. */
  sid: string
  /** Raw provider status from the send call (before any mapping). */
  status: string
  provider: SmsProviderName
}

export interface SmsStatusUpdate {
  sid: string
  status: SmsDeliveryStatus
  /** Raw provider status string, persisted verbatim for debugging. */
  raw: string
}

export interface SmsInboundMessage {
  /** Sender in E.164 (the clinic replying STOP/START). */
  from: string
  body: string
}

export interface SmsWebhookRequest {
  /** The exact public URL the provider was configured to call — signatures are computed over it. */
  url: string
  headers: Headers
  /** Parsed form-encoded request body. */
  params: Record<string, string>
}

export interface SmsProvider {
  readonly name: SmsProviderName
  /** True when every env var this provider needs in order to send is present. */
  isConfigured(): boolean
  /**
   * Send one SMS. Throws on a provider API error so the caller can record the
   * failure. Callers guarantee `isConfigured()` first — this never no-ops.
   */
  send(args: { to: string; body: string; statusCallback: string | null }): Promise<SmsSendResult>
  /** Verify a status-callback / inbound webhook genuinely came from the provider. */
  verifyWebhook(req: SmsWebhookRequest): boolean
  /** Extract `{ sid, status }` from a delivery-status payload, or null if it isn't one. */
  parseStatus(params: Record<string, string>): SmsStatusUpdate | null
  /** Extract `{ from, body }` from an inbound-message payload, or null if it isn't one. */
  parseInbound(params: Record<string, string>): SmsInboundMessage | null
}
