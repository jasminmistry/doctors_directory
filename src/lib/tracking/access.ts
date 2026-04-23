export function trackingDashboardTokenOk(token: string | null): boolean {
  const expected = process.env.TRACKING_DASHBOARD_TOKEN
  if (!expected) return true
  return Boolean(token && token === expected)
}
