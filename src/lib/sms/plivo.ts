import * as plivo from 'plivo'

import type {
  SmsDeliveryStatus,
  SmsInboundMessage,
  SmsProvider,
  SmsStatusUpdate,
  SmsWebhookRequest,
} from './provider'

/**
 * Plivo adapter — the default provider.
 *
 * Env: `PLIVO_AUTH_ID`, `PLIVO_AUTH_TOKEN`, and a sender — either
 * `PLIVO_POWERPACK_UUID` (preferred: a number pool with built-in STOP/opt-out
 * suppression) or a plain `PLIVO_FROM_NUMBER` in E.164.
 */

let cachedClient: plivo.Client | null = null

function getClient(): plivo.Client {
  if (!cachedClient) {
    cachedClient = new plivo.Client(process.env.PLIVO_AUTH_ID!, process.env.PLIVO_AUTH_TOKEN!)
  }
  return cachedClient
}

/** Powerpack UUID when set, otherwise a single source number. Null when neither is configured. */
function senderParams(): { powerpackUUID: string } | { src: string } | null {
  if (process.env.PLIVO_POWERPACK_UUID) {
    return { powerpackUUID: process.env.PLIVO_POWERPACK_UUID }
  }
  if (process.env.PLIVO_FROM_NUMBER) {
    return { src: process.env.PLIVO_FROM_NUMBER }
  }
  return null
}

// https://www.plivo.com/docs/sms/api/message#the-message-object — delivery report Status
const STATUS_MAP: Record<string, SmsDeliveryStatus> = {
  queued: 'queued',
  sent: 'sent',
  delivered: 'delivered',
  undelivered: 'undelivered',
  failed: 'failed',
  rejected: 'failed',
}

export const plivoProvider: SmsProvider = {
  name: 'plivo',

  isConfigured() {
    return Boolean(process.env.PLIVO_AUTH_ID && process.env.PLIVO_AUTH_TOKEN && senderParams())
  },

  async send({ to, body, statusCallback }) {
    const sender = senderParams()!
    const optionalParams: Record<string, string> = {}
    if (statusCallback) {
      optionalParams.url = statusCallback
      optionalParams.method = 'POST'
    }

    const src = 'src' in sender ? sender.src : ''
    const powerpackUUID = 'powerpackUUID' in sender ? sender.powerpackUUID : undefined

    const res = await getClient().messages.create(src, to, body, optionalParams, powerpackUUID)
    const sid = Array.isArray(res.messageUuid)
      ? res.messageUuid[0]
      : String((res as { messageUuid?: unknown }).messageUuid ?? '')

    // Plivo's create call doesn't return a status — it's always freshly queued.
    return { sid, status: 'queued', provider: 'plivo' }
  },

  verifyWebhook({ url, headers, params }: SmsWebhookRequest) {
    const authToken = process.env.PLIVO_AUTH_TOKEN
    const signature = headers.get('x-plivo-signature-v3')
    const nonce = headers.get('x-plivo-signature-v3-nonce')
    if (!authToken || !signature || !nonce) return false
    try {
      return Boolean(plivo.validateV3Signature('POST', url, nonce, authToken, signature, params))
    } catch {
      return false
    }
  },

  parseStatus(params): SmsStatusUpdate | null {
    const sid = params.MessageUUID
    const raw = params.Status
    if (!sid || !raw) return null
    return { sid, status: STATUS_MAP[raw.toLowerCase()] ?? 'unknown', raw }
  },

  parseInbound(params): SmsInboundMessage | null {
    const from = params.From
    if (!from) return null
    return { from, body: params.Text ?? '' }
  },
}
