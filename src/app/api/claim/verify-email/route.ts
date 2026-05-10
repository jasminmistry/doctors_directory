import { NextRequest, NextResponse } from 'next/server'

// Magic-link verification removed — claims now use email OTP entered inline.
export function GET(req: NextRequest) {
  return NextResponse.redirect(new URL('/directory', req.url))
}
