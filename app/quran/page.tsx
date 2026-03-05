// Quran List Page
// Displays all surahs

import { SurahList } from '@/components/quran/surah-list';
import { QuranCacheService } from '@/lib/services/quran-cache.service';

// Force dynamic rendering - don't try to fetch at build time
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour (surahs don't change)

export default async function QuranPage() {
  try {
    const cacheService = new QuranCacheService();
    const surahs = await cacheService.getAllSurahs('TEMPORARY_API');

    return (
      <div className="min-h-screen bg-black">
        <SurahList surahs={surahs} />
      </div>
    );
  } catch (error) {
    console.error('Error loading surahs:', error);
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-2xl mb-4">Error Loading Quran</h1>
        <p className="text-gray-400">
          {error instanceof Error ? error.message : 'Failed to load surahs'}
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Please refresh the page or try again later.
        </p>
      </div>
    );
  }
}
