import { NextResponse } from 'next/server'
import {
  COOKIE_TOKEN,
  COOKIE_REFRESH,
  COOKIE_USERNAME,
  COOKIE_ROLE,
  COOKIE_OPTS,
  consentzFetch,
  getConsentzAuthUrl,
  getApplicationId,
  extractTokens,
} from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    let authApiUrl: string
    try {
      authApiUrl = getConsentzAuthUrl()
    } catch {
      return NextResponse.json({ error: 'Auth service not configured' }, { status: 500 })
    }

    const res = await consentzFetch(`${authApiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-APPLICATION-ID': getApplicationId(),
      },
      body: JSON.stringify({ username, password, confirmLogin: true }),
    })

    const data = await res.json()

    if (!res.ok || data.error) {
      const message = data.error?.message || 'Invalid credentials'
      return NextResponse.json({ error: message }, { status: 401 })
    }

    const { token, refreshToken } = extractTokens(data)

    const claim = await prisma.claimRequest.findFirst({
      where: { consentzUsername: username },
      select: { id: true },
    })
    const role = claim ? 'portal' : 'admin'

    const response = NextResponse.json({ success: true, role })
    response.cookies.set(COOKIE_TOKEN, token, COOKIE_OPTS)
    response.cookies.set(COOKIE_USERNAME, username, COOKIE_OPTS)
    response.cookies.set(COOKIE_ROLE, role, COOKIE_OPTS)
    if (refreshToken) {
      response.cookies.set(COOKIE_REFRESH, refreshToken, COOKIE_OPTS)
    }

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
