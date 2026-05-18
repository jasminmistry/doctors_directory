import { ClockIcon } from 'lucide-react'

interface Props {
  entityName: string
  entityType: 'clinic' | 'practitioner'
}

export function StepPending({ entityName, entityType }: Readonly<Props>) {
  return (
    <div className="flex flex-col items-center gap-6 text-center py-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
        <ClockIcon className="w-8 h-8 text-muted-foreground" />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Claim submitted</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your claim for <strong>{entityName}</strong> is under review by the Consentz team.
          We aim to approve {entityType === 'practitioner' ? 'practitioner' : 'clinic'} claims
          within <strong>24 hours</strong>.
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        You&apos;ll receive a confirmation email once your profile is live.
      </p>
    </div>
  )
}
