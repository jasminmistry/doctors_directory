'use client'

import { useEffect, useState } from 'react'
import { attributionParams, track, trackOnce } from '@/lib/analytics/track'
import { StepDetails } from './step-email'
import { StepVerifyOtp, VerificationBadge } from './step-check-email'
import { StepChoosePlan } from './step-choose-plan'
import { StepPending } from './step-pending'
import { StepConsentzExists } from './step-consentz-exists'

type Step = 'details' | 'verify-otp' | 'plan' | 'pending' | 'consentz-exists'
type Mode = 'claim' | 'register'

interface ClinicProps {
  entityType: 'clinic'
  mode?: Mode
  entityName: string
  clinicSlug?: string
  initialStep?: string | null
  initialClaimId?: number | null
  consentzLoginUrl: string
}

interface PractitionerProps {
  entityType: 'practitioner'
  mode?: Mode
  entityName: string
  practitionerSlug?: string
  initialStep?: string | null
  initialClaimId?: number | null
  consentzLoginUrl: string
}

type Props = ClinicProps | PractitionerProps

const VALID_STEPS = new Set<Step>(['details', 'verify-otp', 'plan', 'pending', 'consentz-exists'])

function toStep(value?: string | null): Step {
  // Support legacy step names from old magic-link flow
  if (value === 'email') return 'details'
  if (value === 'check-email') return 'verify-otp'
  if (value && VALID_STEPS.has(value as Step)) return value as Step
  return 'details'
}

const STEP_NUM: Record<Step, number> = { details: 1, 'verify-otp': 2, plan: 3, pending: 4, 'consentz-exists': 0 }

export function ClaimWizard(props: Readonly<Props>) {
  const { entityType, initialStep, initialClaimId, consentzLoginUrl } = props
  const mode = props.mode ?? 'claim'

  const [step, setStep] = useState<Step>(toStep(initialStep))
  const [claimId, setClaimId] = useState<number | null>(initialClaimId ?? null)
  const [claimerEmail, setClaimerEmail] = useState('')
  const [linkToken, setLinkToken] = useState('')
  const [domainVerified, setDomainVerified] = useState(false)
  const [affiliated, setAffiliated] = useState(false)
  const [entityName, setEntityName] = useState(props.entityName)

  // GA4 sign-up funnel. `funnelParams` carries acquisition context on every step
  // so each event can be split by source in GA.
  const funnelParams = () => ({ entity_type: entityType, mode, ...attributionParams() })

  function handleSent(id: number, email: string, name?: string, consentzExists?: boolean, token?: string) {
    setClaimId(id)
    setClaimerEmail(email)
    if (name) setEntityName(name)
    if (consentzExists && token) {
      setLinkToken(token)
      setStep('consentz-exists')
    } else {
      track('sign_up_start', funnelParams())
      setStep('verify-otp')
    }
  }

  function handleVerified(dv: boolean, aff: boolean) {
    setDomainVerified(dv)
    setAffiliated(aff)
    track('sign_up_otp_verified', funnelParams())
    setStep('plan')
  }

  useEffect(() => {
    if (step === 'pending') {
      // `trackOnce` keyed by claim so a refresh on ?step=pending doesn't re-fire.
      trackOnce(`sign_up:${claimId ?? 'unknown'}`, 'sign_up', funnelParams())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const entitySlug =
    entityType === 'practitioner'
      ? (props as PractitionerProps).practitionerSlug
      : (props as ClinicProps).clinicSlug

  return (
    <div className="w-full max-w-lg mx-auto">
      {step !== 'pending' && step !== 'consentz-exists' && (
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
            mode={mode}
            entityName={entityName}
            clinicSlug={(props as ClinicProps).clinicSlug}
            onSent={handleSent}
          />
        ) : (
          <StepDetails
            entityType="practitioner"
            mode={mode}
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
            entitySlug={entityType === 'practitioner' ? `practitioner/${entitySlug ?? ''}` : entitySlug ?? ''}
            onPlanSelected={(plan) => track('sign_up_plan_selected', { ...funnelParams(), plan })}
            onPending={() => setStep('pending')}
          />
        </div>
      )}

      {step === 'consentz-exists' && claimId !== null && (
        <StepConsentzExists
          entityName={entityName}
          entitySlug={entitySlug ?? ''}
          entityType={entityType}
          linkToken={linkToken}
          consentzLoginUrl={consentzLoginUrl}
          onBack={() => setStep('details')}
        />
      )}

      {step === 'pending' && (
        <StepPending entityName={entityName} entityType={entityType} mode={mode} />
      )}
    </div>
  )
}
