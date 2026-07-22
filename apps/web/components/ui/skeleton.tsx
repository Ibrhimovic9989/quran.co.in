// Skeleton Loading Components
// Provides placeholder shapes while content loads

import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-100', className)}
      aria-hidden="true"
    />
  );
}

/** Skeleton for a single surah card */
export function SurahCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 p-4 md:p-5 space-y-3" aria-hidden="true">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-6 w-32 ml-auto" />
    </div>
  );
}

/** Skeleton grid for the surah list */
export function SurahListSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6" aria-label="Loading surahs...">
      {Array.from({ length: count }).map((_, i) => (
        <SurahCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton for a single ayah row */
export function AyahSkeleton() {
  return (
    <div className="py-6 border-b border-gray-100 space-y-4" aria-hidden="true">
      {/* Arabic text */}
      <Skeleton className="h-8 w-3/4 ml-auto" />
      <Skeleton className="h-8 w-1/2 ml-auto" />
      {/* Translation */}
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

/** Skeleton for surah detail page */
export function SurahPageSkeleton() {
  return (
    <div className="min-h-screen bg-white" aria-label="Loading surah...">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-20 space-y-8">
        {/* Header */}
        <div className="space-y-3 text-center">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
        {/* Audio player */}
        <Skeleton className="h-16 w-full rounded-2xl" />
        {/* Ayahs */}
        {Array.from({ length: 5 }).map((_, i) => (
          <AyahSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
