import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; sessionId: string } },
) {
  try {
    const visitorToken = req.nextUrl.searchParams.get('visitorToken') ?? ''
    const id = parseInt(params.sessionId, 10)
    if (isNaN(id)) return NextResponse.json({ unread: 0 })

    const session = await prisma.chatSession.findFirst({
      where: { id, visitorToken, clinic: { slug: params.slug } },
      select: { patientLastReadAt: true },
    })
    if (!session) return NextResponse.json({ unread: 0 })

    const unread = await prisma.chatMessage.count({
      where: {
        sessionId: id,
        sender: 'clinic',
        ...(session.patientLastReadAt ? { createdAt: { gt: session.patientLastReadAt } } : {}),
      },
    })

    return NextResponse.json({ unread })
  } catch (err) {
    console.error('[chat/unread GET]', err)
    return NextResponse.json({ unread: 0 })
  }
}
