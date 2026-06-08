import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center bg-white px-4 py-16 text-center">
      <p className="text-4xl font-semibold text-foreground">404</p>
      <p className="mt-2 text-base text-muted-foreground">This page could not be found.</p>
      <Link href="/" prefetch={false} className="mt-8">
        <Button variant="outline">Back to Directory</Button>
      </Link>
    </main>
  )
}
