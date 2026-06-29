import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export interface BreadcrumbSkeletonItem {
  label?: string
  href?: string
  isLoading?: boolean
  skeletonWidth?: string
}

export interface BreadcrumbSkeletonProps {
  items: BreadcrumbSkeletonItem[]
}

export function BreadcrumbSkeleton({ items }: BreadcrumbSkeletonProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <>
            <BreadcrumbItem key={index}>
              {item.isLoading ? (
                <Skeleton className={`h-4 ${item.skeletonWidth || 'w-20'}`} />
              ) : (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function PractitionerCardSkeleton() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex items-start gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function PractitionerListSkeleton() {
  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <div className="flex gap-6">
          <Skeleton className="h-20 w-20 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="flex flex-wrap gap-1">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="px-4 md:px-0 space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Skeleton className="h-32 w-32 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  )
}

export function StatsCardSkeleton() {
  return (
    <div className="border border-[#e0e0e0]  rounded-xl p-6 space-y-6">
      <div className="flex flex-row gap-2 items-center justify-center">
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-4 w-4 rounded-sm" />
          ))}
        </div>
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="border-t border-[#e0e0e0] "></div>
      <div className="flex justify-center">
        <Skeleton className="h-48 w-48 rounded-full" />
      </div>
    </div>
  )
}

export function HoursSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-20" />
      <div className="space-y-2">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PaymentOptionsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  )
}

export function GoogleMapsSkeleton() {
  return (
    <div className="w-full aspect-video">
      <Skeleton className="w-full h-full rounded-lg" />
    </div>
  )
}

export function ReviewsSkeleton() {
  return (
    <div className="col-span-1 lg:col-span-6 space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, j) => (
                  <Skeleton key={j} className="h-3 w-3 rounded-sm" />
                ))}
              </div>
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  )
}

export function ContentSectionsSkeleton() {
  return (
    <div className="order-2 lg:order-1 col-span-1 lg:col-span-6 space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-36 rounded-full" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-36" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  )
}

export function SidebarSkeleton() {
  return (
    <div className="order-1 lg:order-2 col-span-1 lg:col-span-4 space-y-6">
      <StatsCardSkeleton />
      <HoursSkeleton />
      <PaymentOptionsSkeleton />
      <GoogleMapsSkeleton />
    </div>
  )
}

export function TreatmentHeroSkeleton() {
  return (
    <div className="text-center space-y-6">
      <Skeleton className="h-12 w-96 mx-auto" />
      <Skeleton className="h-6 w-64 mx-auto" />
      
      <div className="flex justify-center">
        <Skeleton className="h-64 w-96 rounded-lg" />
      </div>
    </div>
  )
}

export function TreatmentStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="text-center space-y-2">
          <Skeleton className="h-8 w-16 mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
      ))}
    </div>
  )
}

export function TreatmentContentSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-6 w-36" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-52" />
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-6 w-6 rounded-full flex-shrink-0 mt-1" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 9 }, (_, index) => (
        <Card key={index} className="gap-0 w-100 h-full relative px-4 md:px-0 shadow-none group transition-all duration-300 border-b border-t-0 border-[#C4C4C4] md:border-t-[1px] rounded-27 md:border md:border-[var(--alto)] cursor-pointer">
          <CardHeader className="pb-2 px-2">
            <div className="flex items-start gap-4">
              <div className="text-center flex-1 min-w-0 items-center flex flex-col">
                <div className="flex w-full flex-row items-start border-b border-[#C4C4C4] md:border-0 md:flex-col md:items-center">
                  <div className="w-[80px] h-[80px] md:w-[150px] md:h-[150px] flex items-center justify-center overflow-hidden rounded-lg bg-gray-300 md:mb-4 mr-0">
                    <Skeleton className="w-full h-full rounded-lg" />
                  </div>

                  <div className="flex items-start md:items-center flex-col pl-4 md:pl-0 w-[calc(100%-80px)] md:w-full space-y-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 px-0 md:px-4 space-y-4">
            <div className="flex md:items-center md:justify-center gap-2 text-[11px] text-gray-600">
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex flex-wrap md:items-center md:justify-center gap-1">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-6 w-16 rounded-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
