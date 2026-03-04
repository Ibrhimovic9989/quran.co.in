// Quran List Page
// Displays all surahs

import { SurahList } from '@/components/quran/surah-list';
import { QuranService } from '@/lib/services';

export default async function QuranPage() {
  try {
    const quranService = new QuranService('TEMPORARY_API');
    const surahs = await quranService.getAllSurahs();

    // Add surah numbers
    const surahsWithNumbers = surahs.map((surah, index) => ({
      ...surah,
      surahNo: index + 1,
    }));

    return (
      <div className="min-h-screen bg-black">
        <SurahList surahs={surahsWithNumbers} />
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
          Please check the API endpoint and try again.
        </p>
      </div>
    );
  }
}
