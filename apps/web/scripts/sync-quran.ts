// Quran Data Sync Script
// CLI script to sync all Quran data from API to database

import { QuranSyncService } from '@/lib/services/quran-sync.service';

async function main() {
  console.log('🚀 Starting Quran data sync...\n');

  const syncService = new QuranSyncService('TEMPORARY_API');

  try {
    await syncService.syncAll({
      includeAudio: true,
      includeTafsir: true,
      onProgress: (progress) => {
        const bar = '█'.repeat(Math.floor(progress.percentage / 2));
        const empty = '░'.repeat(50 - Math.floor(progress.percentage / 2));
        process.stdout.write(
          `\r${progress.stage}: [${bar}${empty}] ${progress.percentage}% (${progress.processed}/${progress.total})`
        );
      },
    });

    console.log('\n\n✅ Quran data sync completed successfully!');
  } catch (error) {
    console.error('\n\n❌ Error during sync:', error);
    process.exit(1);
  }
}

main();
