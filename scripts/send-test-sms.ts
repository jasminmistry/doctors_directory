/**
 * Standalone SMS smoke test — exercises the SAME send path the lead-notification
 * flow uses (`src/lib/sms` → `sendLeadNotificationSms` → the active provider
 * adapter), including the signed tracked link built exactly as `notifyClinicBySms`
 * builds it. Works with whichever provider `SMS_PROVIDER` selects (default plivo).
 *
 *   npx tsx scripts/send-test-sms.ts                 # → default number below
 *   npx tsx scripts/send-test-sms.ts +447700900123   # → override recipient
 *   npm run sms:test -- +447700900123
 *
 * Reads .env (dotenv/config). Nothing is written to the database.
 */
import 'dotenv/config'

import {
  activeProviderName,
  getActiveProvider,
  isSmsConfigured,
  sendLeadNotificationSms,
  smsStatusCallbackUrl,
} from '../src/lib/sms'
import { signSmsTrackingToken } from '../src/lib/sms-tracking'

const DEFAULT_TO = '+919601277532'
const to = process.argv[2]?.trim() || DEFAULT_TO

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
// Same shape as the real notification: /directory/api/track/sms-click/<signed token>/
const FAKE_LEAD_ID = 0
const trackedUrl = `${BASE_URL}/directory/api/track/sms-click/${signSmsTrackingToken('lead', FAKE_LEAD_ID)}/`

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function senderSummary(): string {
  const name = activeProviderName()
  if (name === 'twilio') {
    if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
      return `messagingServiceSid ${process.env.TWILIO_MESSAGING_SERVICE_SID.slice(0, 6)}…`
    }
    return process.env.TWILIO_FROM_NUMBER ? `from ${process.env.TWILIO_FROM_NUMBER}` : '(missing)'
  }
  if (name === 'plivo') {
    if (process.env.PLIVO_POWERPACK_UUID) {
      return `powerpack ${process.env.PLIVO_POWERPACK_UUID.slice(0, 8)}…`
    }
    return process.env.PLIVO_FROM_NUMBER ? `src ${process.env.PLIVO_FROM_NUMBER}` : '(missing)'
  }
  return '(SMS disabled — SMS_PROVIDER=off)'
}

/** Best-effort provider poll so you can watch the message reach "delivered". */
async function pollStatus(sid: string): Promise<void> {
  const name = activeProviderName()
  for (let i = 1; i <= 6; i++) {
    await sleep(3000)
    try {
      if (name === 'twilio') {
        const twilio = (await import('twilio')).default
        const msg = await twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
          .messages(sid)
          .fetch()
        console.log(
          `  [${i}] status=${msg.status}` +
            (msg.errorCode ? ` errorCode=${msg.errorCode} (${msg.errorMessage})` : ''),
        )
        if (['delivered', 'undelivered', 'failed', 'read'].includes(msg.status)) break
      } else if (name === 'plivo') {
        const plivo = await import('plivo')
        const client = new plivo.Client(process.env.PLIVO_AUTH_ID!, process.env.PLIVO_AUTH_TOKEN!)
        const msg = await client.messages.get(sid)
        console.log(
          `  [${i}] state=${msg.messageState}` +
            (msg.errorCode ? ` errorCode=${msg.errorCode}` : ''),
        )
        if (['delivered', 'undelivered', 'failed', 'rejected'].includes(msg.messageState)) break
      }
    } catch (err) {
      console.log(`  [${i}] poll failed:`, (err as Error).message)
      break
    }
  }
}

async function main() {
  console.log('── SMS smoke test ────────────────────────────────────')
  console.log('provider          :', activeProviderName() ?? 'off')
  console.log('configured        :', isSmsConfigured())
  console.log('sender            :', senderSummary())
  console.log('status callback   :', smsStatusCallbackUrl() ?? '(omitted — non-public base URL)')
  console.log('recipient         :', to)
  console.log('tracked link      :', trackedUrl)
  console.log('──────────────────────────────────────────────────────')

  const provider = getActiveProvider()
  if (!provider) {
    console.error('\n✗ SMS_PROVIDER is off — set it to "plivo" or "twilio".')
    process.exit(1)
  }
  if (!isSmsConfigured()) {
    console.error(
      `\n✗ Provider "${provider.name}" is not fully configured. Set:` +
        (provider.name === 'plivo'
          ? '\n   PLIVO_AUTH_ID, PLIVO_AUTH_TOKEN, and PLIVO_POWERPACK_UUID (or PLIVO_FROM_NUMBER)'
          : '\n   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_MESSAGING_SERVICE_SID (or TWILIO_FROM_NUMBER)'),
    )
    process.exit(1)
  }
  if (process.env.TWILIO_FROM_NUMBER === '+441234567890' || process.env.PLIVO_FROM_NUMBER === '+441234567890') {
    console.error('\n✗ A *_FROM_NUMBER is still the example placeholder (+441234567890). Set a real number you own.')
    process.exit(1)
  }

  const result = await sendLeadNotificationSms({
    to,
    clinicName: 'Test Clinic (smoke test)',
    leadSource: 'consultation',
    trackedUrl,
  })

  if (!result) {
    console.error('\n✗ send() returned null — provider treated as not configured.')
    process.exit(1)
  }

  console.log(`\n✓ Accepted by ${result.provider} — id ${result.sid}, initial status "${result.status}"`)

  await pollStatus(result.sid)

  console.log('\nDone. Check the handset and the provider console message logs.')
}

main().catch((err) => {
  const code = (err as { code?: number }).code
  if (code === 20003) {
    console.error(
      '\n✗ Twilio auth failed (20003). Check that:\n' +
        '   • TWILIO_ACCOUNT_SID is the real Account SID (starts "AC…"), not an API Key SID ("SK…")\n' +
        '   • TWILIO_AUTH_TOKEN is the current primary auth token, with no quotes/whitespace in .env\n' +
        '   • the token has not been rotated in the Twilio Console',
    )
  } else if (code === 21212 || code === 21606 || code === 21659) {
    console.error(`\n✗ Twilio sender problem (${code}) — TWILIO_FROM_NUMBER must be a Twilio number on this account, SMS-capable, in E.164.`)
  } else {
    console.error('\n✗ Error:', err)
  }
  process.exit(1)
})
