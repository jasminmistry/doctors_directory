import { NextResponse } from 'next/server'
import { COOKIE_TOKEN, COOKIE_REFRESH } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(COOKIE_TOKEN)
  response.cookies.delete(COOKIE_REFRESH)
  return response
}
