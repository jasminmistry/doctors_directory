import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyEmailTrackingToken } from '@/lib/email-open-tracking'

// 1x1 transparent GIF
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7', 'base64')

function pixelResponse() {
  return new NextResponse(new Uint8Array(PIXEL), {
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': String(PIXEL.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const claims = verifyEmailTrackingToken(params.token)

  if (claims) {
    try {
      if (claims.kind === 'lead') {
        await prisma.consultationLead.updateMany({
          where: { id: claims.id, notificationEmailReadAt: null },
          data: { notificationEmailReadAt: new Date() },
        })
      } else {
        await prisma.clinic.updateMany({
          where: { id: claims.id, campaignEmailReadAt: null },
          data: { campaignEmailReadAt: new Date() },
        })
      }
    } catch (error) {
      console.error('[track/email-open] failed to record open:', error)
    }
  }

  return pixelResponse()
}
