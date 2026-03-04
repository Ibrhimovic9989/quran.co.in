// Quran Sync Service
// Orchestrates syncing all Quran data from API to database

import { QuranService } from './quran.service';
import { QuranRepository } from '@/lib/repositories';
import { BatchProcessor } from '@/lib/utils/batch-processor';
import type { ApiProvider } from '@prisma/client';

export interface SyncProgress {
  stage: string;
  processed: number;
  total: number;
  percentage: number;
}

export class QuranSyncService {
  private quranService: QuranService;
  private repository: QuranRepository;
  private batchProcessor: BatchProcessor<any, any>;

  constructor(apiProvider: ApiProvider = 'TEMPORARY_API') {
    this.quranService = new QuranService(apiProvider);
    this.repository = new QuranRepository();
    this.batchProcessor = new BatchProcessor({
      batchSize: 10,
      concurrency: 5,
      retries: 3,
      retryDelay: 1000,
    });
  }

  /**
   * Sync all surahs
   */
  async syncSurahs(
    onProgress?: (progress: SyncProgress) => void
  ): Promise<void> {
    const surahs = await this.quranService.getAllSurahs();
    
    await this.batchProcessor.processBatches(
      surahs.map((surah, index) => ({
        ...surah,
        surahNo: index + 1,
      })),
      async (surah) => {
        await this.repository.upsertSurah({
          number: surah.surahNo,
          name: surah.surahName,
          englishName: surah.surahNameTranslation,
          arabicName: surah.surahNameArabic,
          englishNameTranslation: surah.surahNameTranslation,
          numberOfAyahs: surah.totalAyah,
          revelationType: surah.revelationPlace === 'Mecca' ? 'MECCAN' : 'MEDINAN',
          apiProvider: 'TEMPORARY_API',
          metadata: {
            surahNameArabicLong: surah.surahNameArabicLong,
          },
        });
        return surah;
      },
      (processed, total) => {
        if (onProgress) {
          onProgress({
            stage: 'Syncing Surahs',
            processed,
            total,
            percentage: Math.round((processed / total) * 100),
          });
        }
      }
    );
  }

  /**
   * Sync all ayahs for all surahs
   */
  async syncAyahs(
    onProgress?: (progress: SyncProgress) => void
  ): Promise<void> {
    const surahs = await this.repository.findAllSurahs('TEMPORARY_API');
    let totalProcessed = 0;
    const totalAyahs = surahs.reduce((sum, s) => sum + s.numberOfAyahs, 0);

    for (const surah of surahs) {
      try {
        const surahData = await this.quranService.getSurah(surah.number);
        
        // Sync all ayahs for this surah
        for (let i = 0; i < surahData.english.length; i++) {
          await this.repository.upsertAyah({
            surahId: surah.id,
            surahNumber: surah.number,
            number: i + 1,
            apiProvider: 'TEMPORARY_API',
            arabicText: surahData.arabic1[i],
            translationText: surahData.english[i],
            transliteration: surahData.arabic2[i],
            metadata: {
              bengali: surahData.bengali?.[i],
              urdu: surahData.urdu?.[i],
              turkish: surahData.turkish?.[i],
              uzbek: surahData.uzbek?.[i],
            },
          });
          
          totalProcessed++;
          
          if (onProgress && totalProcessed % 10 === 0) {
            onProgress({
              stage: `Syncing Ayahs (Surah ${surah.number})`,
              processed: totalProcessed,
              total: totalAyahs,
              percentage: Math.round((totalProcessed / totalAyahs) * 100),
            });
          }
        }
      } catch (error) {
        console.error(`Error syncing surah ${surah.number}:`, error);
      }
    }

    if (onProgress) {
      onProgress({
        stage: 'Syncing Ayahs',
        processed: totalProcessed,
        total: totalAyahs,
        percentage: 100,
      });
    }
  }

  /**
   * Sync all audio data
   */
  async syncAudio(
    onProgress?: (progress: SyncProgress) => void
  ): Promise<void> {
    const surahs = await this.repository.findAllSurahs('TEMPORARY_API');
    let processed = 0;
    const total = surahs.length;

    await this.batchProcessor.processBatches(
      surahs,
      async (surah) => {
        try {
          const audioData = await this.quranService.getSurahAudio(surah.number);
          
          // Store audio URLs in metadata or create audio records
          await this.repository.updateSurah(surah.id, {
            metadata: {
              ...(surah.metadata as object || {}),
              audio: audioData,
            },
          });
        } catch (error) {
          console.error(`Error syncing audio for surah ${surah.number}:`, error);
        }
      },
      (processedCount, totalCount) => {
        processed = processedCount;
        if (onProgress) {
          onProgress({
            stage: 'Syncing Audio',
            processed: processedCount,
            total: totalCount,
            percentage: Math.round((processedCount / totalCount) * 100),
          });
        }
      }
    );
  }

  /**
   * Sync all tafsir data
   */
  async syncTafsir(
    onProgress?: (progress: SyncProgress) => void
  ): Promise<void> {
    const surahs = await this.repository.findAllSurahs('TEMPORARY_API');
    let totalAyahs = 0;
    let processed = 0;

    // Calculate total ayahs
    for (const surah of surahs) {
      totalAyahs += surah.numberOfAyahs;
    }

    for (const surah of surahs) {
      for (let ayahNo = 1; ayahNo <= surah.numberOfAyahs; ayahNo++) {
        try {
          const tafsirData = await this.quranService.getTafsir(surah.number, ayahNo);
          
          // Store tafsir in ayah metadata or create tafsir records
          const ayah = await this.repository.findAyah(
            surah.number,
            ayahNo,
            'TEMPORARY_API'
          );
          
          if (ayah) {
            await this.repository.updateAyah(ayah.id, {
              metadata: {
                ...(ayah.metadata as object || {}),
                tafsir: tafsirData.tafsirs,
              },
            });
          }
          
          processed++;
          
          if (onProgress && processed % 10 === 0) {
            onProgress({
              stage: `Syncing Tafsir (Surah ${surah.number})`,
              processed,
              total: totalAyahs,
              percentage: Math.round((processed / totalAyahs) * 100),
            });
          }
        } catch (error) {
          console.error(`Error syncing tafsir for ${surah.number}:${ayahNo}:`, error);
        }
      }
    }

    if (onProgress) {
      onProgress({
        stage: 'Syncing Tafsir',
        processed,
        total: totalAyahs,
        percentage: 100,
      });
    }
  }

  /**
   * Full sync - syncs everything
   */
  async syncAll(
    options: {
      includeAudio?: boolean;
      includeTafsir?: boolean;
      onProgress?: (progress: SyncProgress) => void;
    } = {}
  ): Promise<void> {
    const { includeAudio = true, includeTafsir = true, onProgress } = options;

    // 1. Sync surahs
    await this.syncSurahs(onProgress);

    // 2. Sync ayahs
    await this.syncAyahs(onProgress);

    // 3. Sync audio (optional)
    if (includeAudio) {
      await this.syncAudio(onProgress);
    }

    // 4. Sync tafsir (optional)
    if (includeTafsir) {
      await this.syncTafsir(onProgress);
    }

    if (onProgress) {
      onProgress({
        stage: 'Sync Complete',
        processed: 100,
        total: 100,
        percentage: 100,
      });
    }
  }
}
