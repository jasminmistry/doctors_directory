'use client'

import { useState } from 'react'
import { StepDetails } from './step-email'
import { StepVerifyOtp, VerificationBadge } from './step-check-email'
import { StepChoosePlan } from './step-choose-plan'
import { StepPending } from './step-pending'

type Step = 'details' | 'verify-otp' | 'plan' | 'pending'

interface ClinicProps {
  entityType: 'clinic'
  entityName: string
  clinicSlug: string
  initialStep?: string | null
  initialClaimId?: number | null
}

interface PractitionerProps {
  entityType: 'practitioner'
  entityName: string
  practitionerSlug: string
  initialStep?: string | null
  initialClaimId?: number | null
}

type Props = ClinicProps | PractitionerProps

const VALID_STEPS = new Set<Step>(['details', 'verify-otp', 'plan', 'pending'])

function toStep(value?: string | null): Step {
  // Support legacy step names from old magic-link flow
  if (value === 'email') return 'details'
  if (value === 'check-email') return 'verify-otp'
  if (value && VALID_STEPS.has(value as Step)) return value as Step
  return 'details'
}

const STEP_NUM: Record<Step, number> = { details: 1, 'verify-otp': 2, plan: 3, pending: 4 }

export function ClaimWizard(props: Readonly<Props>) {
  const { entityType, entityName, initialStep, initialClaimId } = props

  const [step, setStep] = useState<Step>(toStep(initialStep))
  const [claimId, setClaimId] = useState<number | null>(initialClaimId ?? null)
  const [claimerEmail, setClaimerEmail] = useState('')
  const [domainVerified, setDomainVerified] = useState(false)
  const [affiliated, setAffiliated] = useState(false)

  function handleSent(id: number, email: string) {
    setClaimId(id)
    setClaimerEmail(email)
    setStep('verify-otp')
  }

  function handleVerified(dv: boolean, aff: boolean) {
    setDomainVerified(dv)
    setAffiliated(aff)
    setStep('plan')
  }

  const entitySlug =
    entityType === 'practitioner'
      ? (props as PractitionerProps).practitionerSlug
      : (props as ClinicProps).clinicSlug

  return (
    <div className="w-full max-w-lg mx-auto">
      {step !== 'pending' && (
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                  STEP_NUM[step] >= n
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground',
                ].join(' ')}
              >
                {n}
              </div>
              {n < 3 && (
                <div
                  className={[
                    'h-px flex-1 w-8',
                    STEP_NUM[step] > n ? 'bg-foreground' : 'bg-muted',
                  ].join(' ')}
                />
              )}
            </div>
          ))}
          <span className="ml-2 text-xs text-muted-foreground">
            {step === 'details' || step === 'verify-otp' ? 'Verify identity' : 'Choose plan'}
          </span>
        </div>
      )}

      {step === 'details' && (
        entityType === 'clinic' ? (
          <StepDetails
            entityType="clinic"
            entityName={entityName}
            clinicSlug={(props as ClinicProps).clinicSlug}
            onSent={handleSent}
          />
        ) : (
          <StepDetails
            entityType="practitioner"
            entityName={entityName}
            practitionerSlug={(props as PractitionerProps).practitionerSlug}
            onSent={handleSent}
          />
        )
      )}

      {step === 'verify-otp' && claimId !== null && (
        <div className="flex flex-col gap-4">
          <StepVerifyOtp
            email={claimerEmail}
            claimId={claimId}
            entityType={entityType}
            onVerified={handleVerified}
            onResend={() => setStep('details')}
          />
        </div>
      )}

      {step === 'plan' && claimId !== null && (
        <div className="flex flex-col gap-4">
          <VerificationBadge
            entityType={entityType}
            domainVerified={domainVerified}
            affiliated={affiliated}
          />
          <StepChoosePlan
            claimId={claimId}
            entitySlug={entityType === 'practitioner' ? `practitioner/${entitySlug}` : entitySlug}
            onPending={() => setStep('pending')}
          />
        </div>
      )}

      {step === 'pending' && (
        <StepPending entityName={entityName} entityType={entityType} />
      )}
    </div>
  )
}
