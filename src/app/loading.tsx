import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="min-h-screen">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-76px)] px-6 gap-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full max-w-2xl" />
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-12 w-full max-w-3xl rounded-full" />
      </div>

      <section className="py-15 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <Skeleton className="h-6 w-64 mx-auto mb-16" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-4">
                <Skeleton className="w-[100px] h-[100px] rounded-lg" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
