// Loading state for /quran page
// Shows skeleton placeholders while surah list is being fetched

import { SurahListSkeleton } from '@/components/ui/skeleton';
import { LoadingMessage } from '@/components/ui/loading-message';

export default function QuranLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="py-6 md:py-20">
          {/* Header placeholder */}
          <div className="mb-6 md:mb-16 text-center space-y-3">
            <div className="h-8 md:h-14 w-48 mx-auto rounded-xl bg-gray-100 animate-pulse" />
            <div className="h-4 w-40 mx-auto rounded-lg bg-gray-100 animate-pulse" />
          </div>
          <LoadingMessage className="mb-10" />
          <SurahListSkeleton count={12} />
        </div>
      </div>
    </div>
  );
}
