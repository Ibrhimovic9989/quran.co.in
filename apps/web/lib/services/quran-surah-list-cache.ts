import { unstable_cache } from 'next/cache';
import type { ApiProvider } from '@prisma/client';
import { QuranApiClient } from '@/lib/api/quran-api-client';
import { getApiBaseUrl } from '@/lib/api/api-base-url';
import { QuranRepository } from '@/lib/repositories';
import type { SurahInfo } from '@/types/quran-api';
import {
  mapApiSurahToUpsert,
  mapApiSurahToListItem,
  mapDbSurahToListItem,
  type SurahListItem,
} from '@/lib/services/quran-mappers';

// Re-export for existing consumers that import the type from this module.
export type { SurahListItem };

const SURAH_LIST_REVALIDATE_SECONDS = 60 * 60;

async function syncSurahsToDatabase(
  repository: QuranRepository,
  surahs: SurahInfo[],
  apiProvider: ApiProvider
): Promise<void> {
  for (let index = 0; index < surahs.length; index += 1) {
    await repository.upsertSurah(mapApiSurahToUpsert(surahs[index], index + 1, apiProvider));
  }
}

async function loadSurahList(apiProvider: ApiProvider): Promise<SurahListItem[]> {
  const repository = new QuranRepository();
  const dbSurahs = await repository.findAllSurahs(apiProvider);

  if (dbSurahs.length > 0) {
    return dbSurahs.map(mapDbSurahToListItem);
  }

  const apiClient = new QuranApiClient(getApiBaseUrl(apiProvider));
  const apiSurahs = await apiClient.getSurahs();

  syncSurahsToDatabase(repository, apiSurahs, apiProvider).catch(console.error);

  return apiSurahs.map(mapApiSurahToListItem);
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
