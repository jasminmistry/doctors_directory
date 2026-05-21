/**
 * Consentz Core — Directory Inbox Chat integration.
 * Base: {CONSENTZ_AUTH_API_URL origin}/api/core-lite/clinics/{coreClinicId}/inbox/...
 * Auth: none — all endpoints are public.
 */

export interface NormalizedMessage {
  id: number
  sender: 'patient' | 'clinic'
  content: string
  createdAt: string // ISO-8601
}

interface ConsentzMessage {
  id: number
  message: string
  sender: 'visitor' | 'clinic'
  created_at: number // Unix seconds
}

function getChatBase(): string {
  const authUrl = process.env.CONSENTZ_AUTH_API_URL
  if (!authUrl) throw new Error('CONSENTZ_AUTH_API_URL is not configured')
  return `${new URL(authUrl).origin}/api/core-lite`
}

function normalize(m: ConsentzMessage): NormalizedMessage {
  return {
    id: m.id,
    sender: m.sender === 'visitor' ? 'patient' : 'clinic',
    content: m.message,
    createdAt: new Date(m.created_at * 1000).toISOString(),
  }
}

/**
 * Start a new inbox conversation (patient's first message).
 * Returns the Consentz conversation_id, or null if the call fails.
 */
export async function startCoreConversation(payload: {
  coreClinicId: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  message: string
}): Promise<number | null> {
  try {
    const res = await fetch(
      `${getChatBase()}/clinics/${payload.coreClinicId}/inbox/start`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: payload.firstName,
          last_name: payload.lastName,
          email: payload.email,
          ...(payload.phone ? { phone: payload.phone } : {}),
          message: payload.message,
        }),
      },
    )
    if (!res.ok) {
      console.error('[consentz-chat] inbox/start failed', res.status, await res.text().catch(() => ''))
      return null
    }
    const data: { conversation_id: number } = await res.json()
    return data.conversation_id ?? null
  } catch (err) {
    console.error('[consentz-chat] inbox/start error', err)
    return null
  }
}

/**
 * Send a follow-up message in an existing conversation.
 * Returns the Consentz message id, or null if the call fails.
 */
export async function sendCoreMessage(payload: {
  coreClinicId: number
  conversationId: number
  message: string
}): Promise<number | null> {
  try {
    const res = await fetch(
      `${getChatBase()}/clinics/${payload.coreClinicId}/inbox/${payload.conversationId}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: payload.message }),
      },
    )
    if (!res.ok) {
      console.error('[consentz-chat] send message failed', res.status)
      return null
    }
    const data: { id: number } = await res.json()
    return data.id ?? null
  } catch (err) {
    console.error('[consentz-chat] send message error', err)
    return null
  }
}

/**
 * Poll for messages in a conversation.
 * Pass `after` as a Unix timestamp to fetch only messages newer than that point.
 * Returns normalized messages (sender mapped from "visitor"→"patient").
 */
export async function pollCoreMessages(payload: {
  coreClinicId: number
  conversationId: number
  after?: number // Unix seconds
}): Promise<NormalizedMessage[]> {
  try {
    const url = new URL(
      `${getChatBase()}/clinics/${payload.coreClinicId}/inbox/${payload.conversationId}/messages`,
    )
    if (payload.after) url.searchParams.set('after', String(payload.after))

    const res = await fetch(url.toString(), { headers: { 'Content-Type': 'application/json' } })
    if (!res.ok) {
      console.error('[consentz-chat] poll messages failed', res.status)
      return []
    }
    const data: { messages: ConsentzMessage[] } = await res.json()
    return (data.messages ?? []).map(normalize)
  } catch (err) {
    console.error('[consentz-chat] poll messages error', err)
    return []
  }
}
