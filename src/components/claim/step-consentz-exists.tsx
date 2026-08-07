'use client'

import { Button } from '@/components/ui/button'
import { IconExternalLink } from '@tabler/icons-react'

interface Props {
  entityName: string
  entitySlug: string
  entityType: 'clinic' | 'practitioner'
  linkToken: string
  consentzLoginUrl: string
  onBack: () => void
}

export function StepConsentzExists({
  entityName,
  entitySlug,
  entityType,
  linkToken,
  consentzLoginUrl,
  onBack,
}: Readonly<Props>) {
  const slug = entityType === 'practitioner' ? `practitioner/${entitySlug}` : entitySlug

  // Point directly at the protected route — Symfony's firewall will save it as
  // _security.main.target_path and redirect to login automatically.
  const consentzOrigin = (() => { try { return new URL(consentzLoginUrl).origin } catch { return '' } })()
  const consentzUrl =
    `${consentzOrigin}/admin/directory-link` +
    `?slug=${encodeURIComponent(slug)}` +
    `&type=${encodeURIComponent(entityType)}` +
    `&token=${encodeURIComponent(linkToken)}`

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Already a Consentz user?</h2>
        <p className="text-sm text-muted-foreground">
          The email you entered is already registered with Consentz. Log in to your
          Consentz account to link <strong>{entityName}</strong> to the directory.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">What happens next</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click the button below to log in to Consentz</li>
          <li>Confirm which clinic to link</li>
          <li>You'll be redirected to your directory portal</li>
        </ol>
      </div>

      <Button asChild className="w-full gap-2">
        <a href={consentzUrl}>
          Go to Consentz to link
          <IconExternalLink stroke={1.5} className="h-4 w-4" />
        </a>
      </Button>

      <Button variant="ghost" size="sm" onClick={onBack} className="self-start -ml-1">
        ← Use a different email
      </Button>
    </div>
  )
}
