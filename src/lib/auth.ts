export const COOKIE_TOKEN = 'consentz_token'
export const COOKIE_REFRESH = 'consentz_refresh_token'

export const COOKIE_PATH = '/directory'

export const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: COOKIE_PATH,
}

export function getConsentzAuthUrl(): string {
  const url = process.env.CONSENTZ_AUTH_API_URL
  if (!url) throw new Error('CONSENTZ_AUTH_API_URL is not configured')
  return url
}

export function getApplicationId(): string {
  return process.env.CONSENTZ_APPLICATION_ID || 'admin'
}

// Extract tokens from Consentz response — shape: { user: { sessionToken, refreshToken } }
export function extractTokens(data: Record<string, any>) {
  return {
    token: data.user.sessionToken as string,
    refreshToken: data.user.refreshToken as string,
  }
}
