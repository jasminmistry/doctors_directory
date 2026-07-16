export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { clearPatientCookie } from '@/lib/patient-auth'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  clearPatientCookie(res)
  return res
}

export async function GET(req: NextRequest) {
  const home = new URL('/directory', req.nextUrl.origin)
  const res = NextResponse.redirect(home)
  clearPatientCookie(res)
  return res
}
