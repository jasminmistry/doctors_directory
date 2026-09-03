/**
 * Standalone Twilio smoke test — exercises the SAME send path the lead-notification
 * flow uses (`src/lib/sms.ts` → `sendLeadNotificationSms` → Twilio `messages.create`),
 * including the signed tracked link built exactly as `notifyClinicBySms` builds it.
 *
 *   npx tsx scripts/send-test-sms.ts                 # → default number below
 *   npx tsx scripts/send-test-sms.ts +447700900123   # → override recipient
 *   npm run sms:test -- +447700900123
 *
 * Reads .env (dotenv/config). Nothing is written to the database.
 */
import 'dotenv/config'
import twilio from 'twilio'

import { isSmsConfigured, sendLeadNotificationSms, smsStatusCallbackUrl } from '../src/lib/sms'
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

async function main() {
  console.log('── Twilio SMS smoke test ─────────────────────────────')
  console.log('configured        :', isSmsConfigured())
  console.log('account sid       :', process.env.TWILIO_ACCOUNT_SID ? `${process.env.TWILIO_ACCOUNT_SID.slice(0, 6)}…` : '(missing)')
  console.log(
    'sender            :',
    process.env.TWILIO_MESSAGING_SERVICE_SID
      ? `messagingServiceSid ${process.env.TWILIO_MESSAGING_SERVICE_SID.slice(0, 6)}…`
      : process.env.TWILIO_FROM_NUMBER
        ? `from ${process.env.TWILIO_FROM_NUMBER}`
        : '(missing — will no-op)',
  )
  const token = process.env.TWILIO_AUTH_TOKEN ?? ''
  console.log('auth token        :', token ? `len ${token.length}${token !== token.trim() ? ' ⚠ has surrounding whitespace' : ''}` : '(missing)')
  console.log('status callback   :', smsStatusCallbackUrl() ?? '(omitted — non-public base URL)')
  console.log('recipient         :', to)
  console.log('tracked link      :', trackedUrl)
  console.log('──────────────────────────────────────────────────────')

  if (!isSmsConfigured()) {
    console.error('\n✗ Twilio env not fully set — set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and a sender.')
    process.exit(1)
  }
  if (process.env.TWILIO_FROM_NUMBER === '+441234567890') {
    console.error('\n✗ TWILIO_FROM_NUMBER is still the example placeholder (+441234567890). Set a real Twilio number you own.')
    process.exit(1)
  }

  const result = await sendLeadNotificationSms({
    to,
    clinicName: 'Test Clinic (smoke test)',
    leadSource: 'consultation',
    trackedUrl,
  })

  if (!result) {
    console.error('\n✗ send() returned null — Twilio treated as not configured.')
    process.exit(1)
  }

  console.log(`\n✓ Accepted by Twilio — SID ${result.sid}, initial status "${result.status}"`)

  // Poll the message resource a few times so you can see it progress to delivered.
  const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
  for (let i = 1; i <= 6; i++) {
    await sleep(3000)
    const msg = await client.messages(result.sid).fetch()
    console.log(
      `  [${i}] status=${msg.status}` +
        (msg.errorCode ? ` errorCode=${msg.errorCode} (${msg.errorMessage})` : ''),
    )
    if (['delivered', 'undelivered', 'failed', 'read'].includes(msg.status)) break
  }

  console.log('\nDone. Check the handset and the Twilio Console → Monitor → Logs → Messaging.')
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
    console.error(`\n✗ Sender number problem (${code}) — TWILIO_FROM_NUMBER must be a Twilio number on this account, SMS-capable, in E.164.`)
  } else {
    console.error('\n✗ Error:', err)
  }
  process.exit(1)
})
