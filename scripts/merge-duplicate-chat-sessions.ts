import 'dotenv/config'

import { prisma } from '../src/lib/db'

// Dry-run by default — prints the merge plan without writing anything.
// Pass --apply to actually perform the merge.
const APPLY = process.argv.includes('--apply')

interface DupGroup {
  patientId: number
  clinicId: number
  cnt: bigint
}

async function main() {
  const groups = await prisma.$queryRaw<DupGroup[]>`
    SELECT patientId, clinicId, COUNT(*) as cnt
    FROM ChatSession
    WHERE patientId IS NOT NULL
    GROUP BY patientId, clinicId
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
  `

  console.log(`Found ${groups.length} patient/clinic pair(s) with duplicate chat sessions.`)
  console.log(APPLY ? 'Running in APPLY mode — changes will be written.' : 'Running in DRY-RUN mode — pass --apply to write changes.')
  console.log('')

  let sessionsMerged = 0
  let messagesMoved = 0
  let coreConflicts = 0

  for (const group of groups) {
    const sessions = await prisma.chatSession.findMany({
      where: { patientId: group.patientId, clinicId: group.clinicId },
      select: {
        id: true,
        coreConversationId: true,
        clinicLastReadAt: true,
        patientLastReadAt: true,
        createdAt: true,
        _count: { select: { messages: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { createdAt: true } },
      },
    })

    // "Most recent activity" — newest message timestamp, falling back to session
    // createdAt for sessions that never got a message.
    const activityOf = (s: (typeof sessions)[number]) => (s.messages[0]?.createdAt ?? s.createdAt).getTime()
    const sorted = [...sessions].sort((a, b) => activityOf(b) - activityOf(a))
    const primary = sorted[0]
    const dups = sorted.slice(1)
    const dupMessageCount = dups.reduce((sum, d) => sum + d._count.messages, 0)

    console.log(`Patient ${group.patientId} / Clinic ${group.clinicId}: ${sessions.length} sessions -> primary #${primary.id}, merging #${dups.map((d) => d.id).join(', #')} (${dupMessageCount} message(s))`)

    const dupCoreIds = dups.map((d) => d.coreConversationId).filter((id): id is string => id !== null)
    if (primary.coreConversationId && dupCoreIds.some((id) => id !== primary.coreConversationId)) {
      coreConflicts++
      console.warn(`  ⚠ core conversation id conflict — primary has ${primary.coreConversationId}, duplicate(s) have ${dupCoreIds.join(', ')}. Future replies will only sync to the primary's Core conversation.`)
    }
    const adoptedCoreConversationId = primary.coreConversationId ?? dupCoreIds[0] ?? null

    const mergedClinicLastReadAt = [primary, ...dups]
      .map((s) => s.clinicLastReadAt)
      .filter((d): d is Date => d !== null)
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? null
    const mergedPatientLastReadAt = [primary, ...dups]
      .map((s) => s.patientLastReadAt)
      .filter((d): d is Date => d !== null)
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? null

    sessionsMerged += dups.length
    messagesMoved += dupMessageCount

    if (!APPLY) continue

    await prisma.$transaction([
      ...dups.map((d) =>
        prisma.chatMessage.updateMany({ where: { sessionId: d.id }, data: { sessionId: primary.id } }),
      ),
      prisma.chatSession.update({
        where: { id: primary.id },
        data: {
          clinicLastReadAt: mergedClinicLastReadAt,
          patientLastReadAt: mergedPatientLastReadAt,
          ...(adoptedCoreConversationId ? { coreConversationId: adoptedCoreConversationId } : {}),
        },
      }),
      ...dups.map((d) => prisma.chatSession.update({ where: { id: d.id }, data: { status: 'closed' } })),
    ])
  }

  console.log('')
  console.log(`Done. ${groups.length} group(s), ${sessionsMerged} duplicate session(s) and ${messagesMoved} message(s) ${APPLY ? 'merged' : 'would be merged'}.`)
  if (coreConflicts > 0) {
    console.log(`${coreConflicts} group(s) had conflicting Core conversation IDs — check the warnings above.`)
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
