import 'dotenv/config'

import { prisma } from '../src/lib/db'
import { sendClaimInviteEmail } from '../src/lib/email'
import { signUnsubscribeToken } from '../src/lib/campaign-unsubscribe'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
const CADENCE_DAYS = 30 // don't re-email a clinic within this window
const SEND_DELAY_MS = 500 // throttle between sends to stay under SMTP relay rate limits

function parseArgs() {
  const args = process.argv.slice(2)
  const send = args.includes('--send')
  const limitArg = args.find((a) => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 50
  return { send, limit }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const { send, limit } = parseArgs()
  const cutoff = new Date(Date.now() - CADENCE_DAYS * 24 * 60 * 60 * 1000)

  const clinics = await prisma.clinic.findMany({
    where: {
      claimed: false,
      isHidden: false,
      campaignOptedOut: false,
      name: { not: null },
      email: { not: null },
      OR: [{ campaignEmailedAt: null }, { campaignEmailedAt: { lt: cutoff } }],
    },
    select: { id: true, slug: true, name: true, email: true },
    take: limit,
    orderBy: { id: 'asc' },
  })

  console.log(
    `[send-claim-invites] mode=${send ? 'SEND' : 'DRY-RUN'} eligible=${clinics.length} limit=${limit} cadenceDays=${CADENCE_DAYS}`,
  )

  let sent = 0
  let failed = 0

  for (const clinic of clinics) {
    const claimUrl = `${BASE_URL}/directory/claim/${clinic.slug}`
    const manageUrl = `${BASE_URL}/directory/api/unsubscribe?token=${signUnsubscribeToken(clinic.id)}`

    console.log(`${send ? 'Sending' : '[dry-run] Would send'} to ${clinic.email} (${clinic.name}, id=${clinic.id})`)

    if (!send) continue

    try {
      await sendClaimInviteEmail({ to: clinic.email!, clinicName: clinic.name!, claimUrl, manageUrl })
      await prisma.clinic.update({ where: { id: clinic.id }, data: { campaignEmailedAt: new Date() } })
      sent++
    } catch (err) {
      failed++
      console.error(`  ✗ Failed for clinic ${clinic.id}:`, err)
    }

    await sleep(SEND_DELAY_MS)
  }

  console.log(`[send-claim-invites] done. sent=${sent} failed=${failed} dryRun=${!send}`)
}

main()
  .catch((err) => {
    console.error('send-claim-invites failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
