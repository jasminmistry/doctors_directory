import twilio from 'twilio'

import type {
  SmsDeliveryStatus,
  SmsInboundMessage,
  SmsProvider,
  SmsStatusUpdate,
  SmsWebhookRequest,
} from './provider'

/**
 * Twilio adapter.
 *
 * Env: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and a sender — either
 * `TWILIO_MESSAGING_SERVICE_SID` (preferred: pooled senders + automatic
 * STOP/START opt-out) or a plain `TWILIO_FROM_NUMBER` in E.164.
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

function getClient(): TwilioClient {
  if (!cachedClient) {
    cachedClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
  }
  return cachedClient
}

// https://www.twilio.com/docs/messaging/api/message-resource#message-status-values
const STATUS_MAP: Record<string, SmsDeliveryStatus> = {
  accepted: 'queued',
  scheduled: 'queued',
  queued: 'queued',
  sending: 'sent',
  sent: 'sent',
  delivered: 'delivered',
  read: 'read',
  receiving: 'sent',
  received: 'delivered',
  undelivered: 'undelivered',
  failed: 'failed',
  canceled: 'failed',
}

export const twilioProvider: SmsProvider = {
  name: 'twilio',

  isConfigured() {
    return Boolean(
      process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && senderParams(),
    )
  },

  async send({ to, body, statusCallback }) {
    const sender = senderParams()!
    const msg = await getClient().messages.create({
      to,
      body,
      ...sender,
      ...(statusCallback ? { statusCallback } : {}),
    })
    return { sid: msg.sid, status: msg.status, provider: 'twilio' }
  },

  verifyWebhook({ url, headers, params }: SmsWebhookRequest) {
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const signature = headers.get('x-twilio-signature')
    if (!authToken || !signature) return false
    return twilio.validateRequest(authToken, signature, url, params)
  },

  parseStatus(params): SmsStatusUpdate | null {
    const sid = params.MessageSid || params.SmsSid
    const raw = params.MessageStatus || params.SmsStatus
    if (!sid || !raw) return null
    return { sid, status: STATUS_MAP[raw.toLowerCase()] ?? 'unknown', raw }
  },

  parseInbound(params): SmsInboundMessage | null {
    const from = params.From
    if (!from) return null
    return { from, body: params.Body ?? '' }
  },
}
