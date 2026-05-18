import { NextResponse } from 'next/server'
import { COOKIE_TOKEN, COOKIE_REFRESH, COOKIE_USERNAME, COOKIE_ROLE, COOKIE_PATH } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_TOKEN, '', { path: COOKIE_PATH, maxAge: 0 })
  response.cookies.set(COOKIE_REFRESH, '', { path: COOKIE_PATH, maxAge: 0 })
  response.cookies.set(COOKIE_USERNAME, '', { path: COOKIE_PATH, maxAge: 0 })
  response.cookies.set(COOKIE_ROLE, '', { path: COOKIE_PATH, maxAge: 0 })
  return response
}
