// Script to update existing ayahs with translations and tafsir
// Run this after initial sync to populate missing translations

import { QuranSyncService } from '@/lib/services/quran-sync.service';
import { ApiProvider } from '@prisma/client';

async function main() {
  console.log('Starting translation and tafsir update...');
  const syncService = new QuranSyncService(ApiProvider.TEMPORARY_API);

  const onProgress = (progress: {
    stage: string;
    processed: number;
    total: number;
    percentage: number;
  }) => {
    console.log(
      `[${progress.stage}] Processed: ${progress.processed}/${progress.total} (${progress.percentage}%)`
    );
  };

  try {
    console.log('Updating Ayahs with translations...');
    // Re-sync ayahs to update metadata with translations
    await syncService.syncAyahs(onProgress);
    console.log('Translations updated successfully.');

    console.log('Syncing Tafsir...');
    await syncService.syncTafsir(onProgress);
    console.log('Tafsir synced successfully.');

    console.log('Translation and tafsir update completed!');
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }
}

main();
