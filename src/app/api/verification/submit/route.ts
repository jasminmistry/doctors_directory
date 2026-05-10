import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

async function saveFile(file: File, dir: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin'
  const filename = `${randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(dir, filename), buffer)
  return filename
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const entityType = formData.get('entityType') as string | null
    const entitySlug = formData.get('entitySlug') as string | null
    const claimerName = formData.get('claimerName') as string | null
    const claimerEmail = formData.get('claimerEmail') as string | null
    const proofType = formData.get('proofType') as string | null

    if (!entityType || !entitySlug || !claimerName || !claimerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (entityType !== 'clinic' && entityType !== 'practitioner') {
      return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 })
    }

    const govIdFile = formData.get('govId') as File | null
    const selfieFile = formData.get('selfie') as File | null
    const proofFile = formData.get('proof') as File | null

    if (!govIdFile) {
      return NextResponse.json({ error: 'Government ID is required' }, { status: 400 })
    }
    if (govIdFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Government ID file is too large (max 10 MB)' }, { status: 400 })
    }

    // Create per-request upload directory
    const uploadDir = join(process.cwd(), 'uploads', 'verification', randomUUID())
    await mkdir(uploadDir, { recursive: true })

    const govIdFilename = await saveFile(govIdFile, uploadDir)
    const selfieFilename = selfieFile && selfieFile.size > 0 ? await saveFile(selfieFile, uploadDir) : null
    const proofFilename = proofFile && proofFile.size > 0 ? await saveFile(proofFile, uploadDir) : null

    const record = await prisma.verificationRequest.create({
      data: {
        entityType: entityType as 'clinic' | 'practitioner',
        entitySlug,
        claimerName,
        claimerEmail,
        govIdFile: `${uploadDir.split('/uploads/verification/')[1]}/${govIdFilename}`,
        selfieFile: selfieFilename ? `${uploadDir.split('/uploads/verification/')[1]}/${selfieFilename}` : null,
        proofType: proofType ?? null,
        proofFile: proofFilename ? `${uploadDir.split('/uploads/verification/')[1]}/${proofFilename}` : null,
      },
    })

    return NextResponse.json({ id: record.id, message: 'Verification request submitted' })
  } catch (error) {
    console.error('Verification submit error:', error)
    return NextResponse.json({ error: 'Failed to submit verification request' }, { status: 500 })
  }
}
