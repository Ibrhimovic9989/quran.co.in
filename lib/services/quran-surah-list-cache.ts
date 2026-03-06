import { unstable_cache } from 'next/cache';
import type { ApiProvider } from '@prisma/client';
import { QuranApiClient } from '@/lib/api/quran-api-client';
import { QuranRepository } from '@/lib/repositories';
import type { SurahInfo } from '@/types/quran-api';

export type SurahListItem = SurahInfo & { surahNo: number };

const SURAH_LIST_REVALIDATE_SECONDS = 60 * 60;

function getApiBaseUrl(provider: ApiProvider): string {
  switch (provider) {
    case 'QURAN_COM':
      return process.env.QURAN_COM_API_URL || 'https://quranapi.pages.dev';
    case 'CUSTOM':
    case 'TEMPORARY_API':
    default:
      return 'https://quranapi.pages.dev';
  }
}

function mapDbSurahsToList(dbSurahs: any[]): SurahListItem[] {
  return dbSurahs.map((surah) => ({
    surahName: surah.name,
    surahNameArabic: surah.arabicName,
    surahNameArabicLong: (surah.metadata as any)?.surahNameArabicLong || surah.arabicName,
    surahNameTranslation: surah.englishNameTranslation || surah.englishName,
    revelationPlace: (surah.revelationType === 'MECCAN' ? 'Mecca' : 'Madina') as 'Mecca' | 'Madina',
    totalAyah: surah.numberOfAyahs,
    surahNo: surah.number,
  }));
}

function mapApiSurahsToList(apiSurahs: SurahInfo[]): SurahListItem[] {
  return apiSurahs.map((surah, index) => ({
    ...surah,
    surahNo: index + 1,
  }));
}

async function syncSurahsToDatabase(
  repository: QuranRepository,
  surahs: SurahInfo[],
  apiProvider: ApiProvider
): Promise<void> {
  for (let index = 0; index < surahs.length; index += 1) {
    const surah = surahs[index];

    await repository.upsertSurah({
      number: index + 1,
      name: surah.surahName,
      englishName: surah.surahNameTranslation,
      arabicName: surah.surahNameArabic,
      englishNameTranslation: surah.surahNameTranslation,
      numberOfAyahs: surah.totalAyah,
      revelationType: surah.revelationPlace === 'Mecca' ? 'MECCAN' : 'MEDINAN',
      apiProvider,
      metadata: {
        surahNameArabicLong: surah.surahNameArabicLong,
      } as any,
    });
  }
}

async function loadSurahList(apiProvider: ApiProvider): Promise<SurahListItem[]> {
  const repository = new QuranRepository();
  const dbSurahs = await repository.findAllSurahs(apiProvider);

  if (dbSurahs.length > 0) {
    return mapDbSurahsToList(dbSurahs);
  }

  const apiClient = new QuranApiClient(getApiBaseUrl(apiProvider));
  const apiSurahs = await apiClient.getSurahs();

  syncSurahsToDatabase(repository, apiSurahs, apiProvider).catch(console.error);

  return mapApiSurahsToList(apiSurahs);
}

const surahListLoaders: Record<ApiProvider, () => Promise<SurahListItem[]>> = {
  TEMPORARY_API: unstable_cache(
    () => loadSurahList('TEMPORARY_API'),
    ['surah-list', 'TEMPORARY_API'],
    {
      revalidate: SURAH_LIST_REVALIDATE_SECONDS,
      tags: ['surah-list', 'surah-list:TEMPORARY_API'],
    }
  ),
  QURAN_COM: unstable_cache(
    () => loadSurahList('QURAN_COM'),
    ['surah-list', 'QURAN_COM'],
    {
      revalidate: SURAH_LIST_REVALIDATE_SECONDS,
      tags: ['surah-list', 'surah-list:QURAN_COM'],
    }
  ),
  CUSTOM: unstable_cache(
    () => loadSurahList('CUSTOM'),
    ['surah-list', 'CUSTOM'],
    {
      revalidate: SURAH_LIST_REVALIDATE_SECONDS,
      tags: ['surah-list', 'surah-list:CUSTOM'],
    }
  ),
};

export async function getCachedSurahList(
  apiProvider: ApiProvider = 'TEMPORARY_API'
): Promise<SurahListItem[]> {
  return surahListLoaders[apiProvider]();
}
