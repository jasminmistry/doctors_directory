import { RoleMismatchNotice } from '@/components/auth/role-mismatch-notice'

export const dynamic = 'force-dynamic'

export default function PortalWrongAccountPage({
  searchParams,
}: {
  searchParams: { next?: string }
}) {
  return <RoleMismatchNotice requiredRole="portal" next={searchParams.next || '/portal'} />
}
