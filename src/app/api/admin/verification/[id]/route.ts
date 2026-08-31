import { NextRequest, NextResponse } from 'next/server'
import { rm } from 'fs/promises'
import { normalize, resolve } from 'path'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { invalidateSearchCache } from '@/lib/search-cache'
import { invalidatePractitionersSearchCache } from '@/lib/data-access/practitioners'

const reviewSchema = z.object({
  action: z.enum(['approve', 'reject']),
  adminNotes: z.string().optional(),
})

const UPLOAD_ROOT = resolve(process.cwd(), 'uploads', 'verification')

/**
 * GDPR: once a verification request has been reviewed, the uploaded identity
 * documents are no longer needed — purge them from disk. Each request stores its
 * files under a single per-request directory (`{uuid}/{filename}`), so removing
 * that directory clears the govId, selfie and proof files in one call.
 */
async function purgeVerificationFiles(files: Array<string | null>): Promise<void> {
  const dirs = new Set<string>()
  for (const stored of files) {
    if (!stored) continue
    const requestDir = normalize(stored).split('/')[0]
    if (requestDir && requestDir !== '..' && !requestDir.startsWith('.')) {
      dirs.add(requestDir)
    }
  }

  for (const dir of dirs) {
    const resolved = resolve(UPLOAD_ROOT, dir)
    if (resolved !== UPLOAD_ROOT && resolved.startsWith(UPLOAD_ROOT + '/')) {
      await rm(resolved, { recursive: true, force: true })
    }
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10)
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const parsed = reviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { action, adminNotes } = parsed.data

    const vr = await prisma.verificationRequest.findUnique({ where: { id } })
    if (!vr) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }
    if (vr.status !== 'pending') {
      return NextResponse.json({ error: 'Request already reviewed' }, { status: 400 })
    }

    await prisma.verificationRequest.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        adminNotes: adminNotes ?? null,
        reviewedAt: new Date(),
        // GDPR: drop references to the identity documents now the review is done.
        govIdFile: null,
        selfieFile: null,
        proofFile: null,
      },
    })

    // Best-effort disk cleanup — a filesystem error here must not fail the review.
    try {
      await purgeVerificationFiles([vr.govIdFile, vr.selfieFile, vr.proofFile])
    } catch (cleanupError) {
      console.error(`Failed to purge verification files for request ${id}:`, cleanupError)
    }

    if (action === 'approve') {
      if (vr.entityType === 'clinic') {
        await prisma.clinic.updateMany({
          where: { slug: vr.entitySlug },
          data: { idVerified: true, manualVerified: true },
        })
      } else {
        await prisma.practitioner.updateMany({
          where: { slug: vr.entitySlug },
          data: { idVerified: true, manualVerified: true },
        })
        await invalidatePractitionersSearchCache()
      }
      await invalidateSearchCache()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin verification review error:', error)
    return NextResponse.json({ error: 'Failed to update verification request' }, { status: 500 })
  }
}
