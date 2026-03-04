# Quran Data Sync System

## Overview

The sync system fetches all Quran data from the API and stores it in the database with optimizations for performance, parallel processing, and error handling.

## Features

- **Parallel Fetching**: Processes multiple surahs/ayahs concurrently
- **Batch Processing**: Groups operations for efficiency
- **Error Handling**: Automatic retries with exponential backoff
- **Progress Tracking**: Real-time progress updates
- **Database Indexing**: Optimized queries with proper indexes
- **Partitioning**: Handles large datasets efficiently

## Architecture

### Components

1. **BatchProcessor** (`lib/utils/batch-processor.ts`)
   - Handles parallel processing with concurrency control
   - Implements retry logic with exponential backoff
   - Processes items in batches

2. **QuranSyncService** (`lib/services/quran-sync.service.ts`)
   - Orchestrates the sync process
   - Syncs surahs, ayahs, audio, and tafsir
   - Provides progress callbacks

3. **QuranRepository** (`lib/repositories/quran.repository.ts`)
   - Database operations with upsert logic
   - Handles multiple API providers

## Usage

### 1. Add Database Indexes

First, add indexes for better query performance:

```bash
npm run db:index
```

Or manually run the SQL:

```bash
dotenv -e .env.local -- psql $DATABASE_URL -f prisma/migrations/add_indexes.sql
```

### 2. Run Full Sync

Sync all Quran data (surahs, ayahs, audio, tafsir):

```bash
npm run sync:quran
```

### 3. Programmatic Usage

```typescript
import { QuranSyncService } from '@/lib/services';

const syncService = new QuranSyncService('TEMPORARY_API');

// Sync everything
await syncService.syncAll({
  includeAudio: true,
  includeTafsir: true,
  onProgress: (progress) => {
    console.log(`${progress.stage}: ${progress.percentage}%`);
  },
});

// Or sync individually
await syncService.syncSurahs(onProgress);
await syncService.syncAyahs(onProgress);
await syncService.syncAudio(onProgress);
await syncService.syncTafsir(onProgress);
```

## Performance Optimizations

### 1. Database Indexing

Indexes are created on:
- `surahs(number, apiProvider)` - Fast surah lookup
- `ayahs(surahNumber, number, apiProvider)` - Fast ayah lookup
- Composite indexes for common query patterns

### 2. Parallel Processing

- **Batch Size**: 10 items per batch
- **Concurrency**: 5 parallel requests
- **Retries**: 3 attempts with exponential backoff

### 3. Upsert Operations

Uses Prisma's `upsert` to avoid duplicates and handle updates efficiently.

## Data Structure

### Surahs
- All 114 surahs with metadata
- Arabic and English names
- Revelation type (Meccan/Medinan)
- Number of ayahs

### Ayahs
- All ~6,236 ayahs
- Arabic text
- English translation
- Multiple language translations (Bengali, Urdu, Turkish, Uzbek)
- Audio URLs stored in metadata

### Audio
- Complete surah audio for 5 reciters
- Individual ayah audio
- Stored in surah/ayah metadata

### Tafsir
- Ibn Kathir
- Maarif Ul Quran
- Tazkirul Quran
- Stored in ayah metadata

## Monitoring

The sync script provides real-time progress:

```
Syncing Surahs: [████████████████████████████████████████] 100% (114/114)
Syncing Ayahs: [████████████████████░░░░░░░░░░░░░░░░░░░░] 50% (3118/6236)
Syncing Audio: [████████████████████████████████████████] 100% (114/114)
Syncing Tafsir: [████████████████████░░░░░░░░░░░░░░░░░░░░] 25% (1559/6236)
```

## Error Handling

- Automatic retries (3 attempts)
- Exponential backoff (1s, 2s, 3s delays)
- Continues processing on individual failures
- Logs errors for manual review

## Future Enhancements

- [ ] Incremental sync (only fetch changed data)
- [ ] Resume from last checkpoint
- [ ] Download and store audio files locally
- [ ] Vector embeddings for RAG
- [ ] Partitioning by surah for very large datasets
