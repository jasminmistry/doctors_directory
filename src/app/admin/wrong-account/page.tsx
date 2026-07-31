import { RoleMismatchNotice } from '@/components/auth/role-mismatch-notice'

export const dynamic = 'force-dynamic'

export default function AdminWrongAccountPage({
  searchParams,
}: {
  searchParams: { next?: string }
}) {
  return <RoleMismatchNotice requiredRole="admin" next={searchParams.next || '/admin'} />
}
