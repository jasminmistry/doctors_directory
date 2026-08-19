import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cancelScheduledDeletion, verifyDeletionCancelToken } from '@/lib/account-deletion'

export const dynamic = 'force-dynamic'

function htmlPage(title: string, message: string, status = 200) {
  return new NextResponse(
    `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — Consentz Directory</title>
</head>
<body style="font-family:sans-serif;max-width:480px;margin:80px auto;padding:0 24px;color:#111;text-align:center;">
  <h2 style="margin-bottom:8px;">${title}</h2>
  <p style="color:#444;font-size:15px;line-height:1.5;">${message}</p>
</body>
</html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return htmlPage('Invalid link', 'This cancellation link is missing a token.', 400)
  }

  const claims = verifyDeletionCancelToken(token)
  if (!claims) {
    return htmlPage(
      'Invalid or expired link',
      'This link could not be verified. Please contact care@consentz.com and we\'ll cancel the deletion manually.',
      400,
    )
  }

  const entity =
    claims.entityType === 'clinic'
      ? await prisma.clinic.findUnique({ where: { id: claims.entityId }, select: { name: true, slug: true, scheduledDeletionAt: true } })
      : await prisma.practitioner.findUnique({ where: { id: claims.entityId }, select: { displayName: true, slug: true, scheduledDeletionAt: true } })

  if (!entity) {
    return htmlPage('Listing not found', 'We could not find this listing. Please contact care@consentz.com.', 404)
  }

  if (!entity.scheduledDeletionAt) {
    return htmlPage(
      'No deletion in progress',
      'This listing is not currently scheduled for deletion — either it was already cancelled, or it has already been permanently deleted.',
    )
  }

  await cancelScheduledDeletion(claims.entityType, claims.entityId)

  const name = 'name' in entity ? entity.name : entity.displayName
  return htmlPage(
    'Deletion cancelled',
    `${name ?? 'Your listing'} has been restored and is visible on the Consentz Directory again. You can log back in to the portal as normal.`,
  )
}
