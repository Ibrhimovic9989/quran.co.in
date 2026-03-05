// Quran List Page
// Displays all surahs with tab navigation (Surah/Juz/Revelation Order)

import { Suspense } from 'react';
import { QuranPageClient } from '@/components/quran/quran-page-client';
import { QuranCacheService } from '@/lib/services/quran-cache.service';
import { Spinner } from '@/components/ui/atoms';
import { LoadingMessage } from '@/components/ui/loading-message';

// Force dynamic rendering - don't try to fetch at build time
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour (surahs don't change)

export default async function QuranPage() {
  try {
    const cacheService = new QuranCacheService();
    const surahs = await cacheService.getAllSurahs('TEMPORARY_API');

    return (
      <main>
        <Suspense
          fallback={
            <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Spinner size="lg" />
                <LoadingMessage />
              </div>
            </div>
          }
        >
          <QuranPageClient surahs={surahs} />
        </Suspense>
      </main>
    );
  } catch (error) {
    console.error('Error loading surahs:', error);
    return (
      <main className="min-h-screen bg-white text-black p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Error Loading Quran</h1>
          <p className="text-gray-600 text-lg">
            {error instanceof Error ? error.message : 'Failed to load surahs'}
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Please refresh the page or try again later.
          </p>
        </div>
      </main>
    );
  }
}
