// Loading state for surah detail page
// Shows an Islamic message prominently while surah data is being fetched

import { SurahPageSkeleton } from '@/components/ui/skeleton';
import { LoadingMessage } from '@/components/ui/loading-message';

export default function SurahLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Prominent loading message — centered, above the fold */}
      <div className="flex flex-col items-center justify-center pt-20 pb-10 px-4">
        <LoadingMessage className="max-w-xl" />
      </div>

      {/* Skeleton below */}
      <SurahPageSkeleton />
    </div>
  );
}
