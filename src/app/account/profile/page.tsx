'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'

interface PatientProfile {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  createdAt: string
}

export default function AccountProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    fetch('/directory/api/patient/profile')
      .then((r) => r.ok ? r.json() : null)
      .then((data: PatientProfile | null) => {
        if (!data) return
        setProfile(data)
        setFirstName(data.firstName ?? '')
        setLastName(data.lastName ?? '')
        setPhone(data.phone ?? '')
      })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/directory/api/patient/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: firstName || null, lastName: lastName || null, phone: phone || null }),
      })
      if (!res.ok) throw new Error()
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to save — please try again')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch('/directory/api/patient/profile', { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Account deleted')
      router.push('/directory')
    } catch {
      toast.error('Failed to delete — please try again')
      setDeleting(false)
    }
  }

  if (!profile) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">{profile.email}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 rounded-xl bg-white border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">First name</label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Last name</label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+44 7xxx xxxxxx"
            className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <Button
          type="submit"
          disabled={saving}
          className="bg-black border border-black text-white hover:bg-white hover:text-black"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save changes'}
        </Button>
      </form>

      {/* GDPR delete */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-red-600">Delete account</h2>
        <p className="text-xs text-gray-500">
          Permanently delete your account and anonymise all associated bookings and consultations. This action cannot be undone.
        </p>
        {!confirmDelete ? (
          <Button
            variant="outline"
            size="sm"
            className="border-red-300 text-red-600 hover:bg-red-100 hover:text-red-700"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete my account
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Yes, delete permanently'}
            </Button>
            <button
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
