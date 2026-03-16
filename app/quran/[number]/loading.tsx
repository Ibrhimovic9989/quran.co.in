// Loading state for surah detail page
// Shows skeleton placeholders while surah data is being fetched

import { SurahPageSkeleton } from '@/components/ui/skeleton';
import { LoadingMessage } from '@/components/ui/loading-message';

export default function SurahLoading() {
  return (
    <div>
      <div className="pt-10 pb-2">
        <LoadingMessage />
      </div>
      <SurahPageSkeleton />
    </div>
  );
}
