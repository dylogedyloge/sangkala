import { Card } from "@/components/shadcn/card"
import { Skeleton } from "@/components/shadcn/skeleton"

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row md:gap-8">
        {/* Image skeleton */}
        <div className="relative w-full md:w-[300px] h-[180px] md:h-[240px] flex-shrink-0">
          {/* Status badge skeleton */}
          <div className="absolute top-3 left-3 z-10">
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
          <Skeleton className="absolute inset-0" />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 md:pr-8 space-y-4 md:space-y-5">
          {/* Header with price */}
          <div className="flex justify-between items-start gap-4">
            <div>
              {/* Title */}
              <Skeleton className="h-7 w-[250px] mb-1.5 md:mb-2" />
              {/* Tags */}
              <div className="flex items-center flex-wrap gap-1.5 md:gap-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            {/* Price */}
            <div className="text-right">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-4 w-16 mt-1" />
            </div>
          </div>

          {/* Description */}
          <Skeleton className="h-[40px] w-full" />

          {/* Stats */}
          <div className="flex items-center gap-4 md:gap-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
            <div className="flex items-center gap-1 md:gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-4 rounded-full" />
              ))}
            </div>
          </div>

          {/* Overview */}
          <div className="pt-0.5 md:pt-1">
            <Skeleton className="h-6 w-24 mb-2.5 md:mb-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-3 md:gap-x-6 md:gap-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}