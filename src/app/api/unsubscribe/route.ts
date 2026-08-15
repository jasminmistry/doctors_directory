import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyUnsubscribeToken } from '@/lib/campaign-unsubscribe'
import { sendDirectoryRemovalRequestNotification } from '@/lib/email'

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
    return htmlPage('Invalid link', 'This unsubscribe link is missing a token.', 400)
  }

  const claims = verifyUnsubscribeToken(token)
  if (!claims) {
    return htmlPage(
      'Invalid or expired link',
      'This link could not be verified. Please contact care@consentz.com and we\'ll unsubscribe you manually.',
      400,
    )
  }

  if (claims.action === 'unsubscribe') {
    try {
      const clinic = await prisma.clinic.update({
        where: { id: claims.clinicId },
        data: { campaignOptedOut: true },
        select: { name: true },
      })
      return htmlPage(
        'You have been unsubscribed',
        `${clinic.name ?? 'Your clinic'} will no longer receive outreach emails from the Consentz Directory. If this was a mistake, contact care@consentz.com.`,
      )
    } catch {
      return htmlPage('Clinic not found', 'We could not find this listing. Please contact care@consentz.com.', 404)
    }
  }

  // action === 'remove'
  const clinic = await prisma.clinic.findUnique({
    where: { id: claims.clinicId },
    select: { name: true, slug: true, directoryRemovalRequestedAt: true, isHidden: true },
  })
  if (!clinic) {
    return htmlPage('Clinic not found', 'We could not find this listing. Please contact care@consentz.com.', 404)
  }

  const isNewRequest = !clinic.directoryRemovalRequestedAt && !clinic.isHidden
  const requestedAt = new Date()

  await prisma.clinic.update({
    where: { id: claims.clinicId },
    data: {
      campaignOptedOut: true,
      ...(isNewRequest ? { directoryRemovalRequestedAt: requestedAt } : {}),
    },
  })

  if (isNewRequest) {
    sendDirectoryRemovalRequestNotification({
      clinicName: clinic.name ?? clinic.slug,
      clinicSlug: clinic.slug,
      requestedAt,
    }).catch((err) => console.error('Failed to send directory removal notification email:', err))
  }

  return htmlPage(
    'Removal request received',
    `${clinic.name ?? 'Your clinic'} has been unsubscribed from outreach emails, and we've received your request to remove this listing from the Consentz Directory. Our team will review and action it shortly. If this was a mistake, contact care@consentz.com.`,
  )
}
