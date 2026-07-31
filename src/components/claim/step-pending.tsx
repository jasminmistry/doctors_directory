import { ClockIcon } from 'lucide-react'

interface Props {
  entityName: string
  entityType: 'clinic' | 'practitioner'
  mode?: 'claim' | 'register'
}

export function StepPending({ entityName, entityType, mode = 'claim' }: Readonly<Props>) {
  const isRegister = mode === 'register'
  return (
    <div className="flex flex-col items-center gap-6 text-center py-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
        <ClockIcon className="w-8 h-8 text-muted-foreground" />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">{isRegister ? 'Application submitted' : 'Claim submitted'}</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {isRegister ? (
            <>Your registration for <strong>{entityName}</strong> is under review by the Consentz team.</>
          ) : (
            <>Your claim for <strong>{entityName}</strong> is under review by the Consentz team.</>
          )}{' '}
          We aim to approve {entityType === 'practitioner' ? 'practitioner' : 'clinic'} {isRegister ? 'listings' : 'claims'}
          {' '}within <strong>24 hours</strong>.
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        You&apos;ll receive a confirmation email once your profile is live.
      </p>
    </div>
  )
}
