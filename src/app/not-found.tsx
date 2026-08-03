import Link from 'next/link'
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center bg-white px-4 py-16 text-center">
      <p className="text-4xl font-semibold text-foreground">404</p>
      <p className="mt-2 text-base text-muted-foreground">This page could not be found.</p>
      <Link href="/" prefetch={false} className="mt-8 inline-flex items-center gap-3 text-sm hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to Directory
      </Link>
    </main>
  )
}
