// Loading state for /quran page
// Shows while surah list is being fetched

import { Spinner } from '@/components/ui/atoms';
import { LoadingMessage } from '@/components/ui/loading-message';

export default function QuranLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
          <Spinner size="lg" />
          <LoadingMessage />
        </div>
      </div>
    </div>
  );
}
