import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, User, CheckCircle2 } from 'lucide-react'
import { RegisterForm } from '@/components/register/RegisterForm'
import { toDirectoryCanonical } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Register as a Practitioner — Consentz Directory',
  description: 'List your aesthetic practice on the Consentz Directory. Connect with patients looking for your specialty.',
  alternates: { canonical: toDirectoryCanonical('/register/practitioner') },
}

const BENEFITS = [
  'Appear in searches for your specialty and city',
  'Display your qualifications and accreditations',
  'Receive patient leads directly',
  'Build trust with a verified profile badge',
]

export default function RegisterPractitionerPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to directory
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">For Practitioners</span>
          </div>
          <h1 className="text-2xl font-bold mb-3">Register as a practitioner</h1>
          <p className="text-sm text-muted-foreground">
            Submit your details below. Our team will review your application and create your listing within 1–2 business days.
          </p>

          <ul className="mt-4 space-y-2">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-sm text-muted-foreground">
            Already listed?{' '}
            <Link href="/practitioners" className="text-foreground underline underline-offset-2">
              Find your profile
            </Link>{' '}
            and use the &quot;Claim this profile&quot; link.
          </p>
        </div>

        <div className="rounded-xl border border-border p-6">
          <RegisterForm entityType="practitioner" />
        </div>
      </div>
    </main>
  )
}
