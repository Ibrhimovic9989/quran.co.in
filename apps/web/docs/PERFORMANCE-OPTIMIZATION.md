# Performance Optimization Guide

## Current Optimizations

### 1. Database Caching
- **Surah List**: Fetches from database first (<100ms)
- **Surah Detail**: Fetches from database first (<200ms even for 286 ayahs)
- Falls back to API only if not in database
- Background syncing doesn't block requests

### 2. Lazy Loading
- **Surah List**: Shows 30 surahs initially, loads more on scroll
- **Surah Detail**: Shows 20 ayahs initially, loads more on demand
- Uses `requestAnimationFrame` for instant UI updates

### 3. Database Indexes
Indexes are created for fast queries:
- `idx_surah_number` - Fast surah lookup
- `idx_ayah_surah_number` - Fast ayah lookup by surah
- `idx_ayah_surah_number_provider` - Composite index for queries

### 4. Query Optimization
- Selects only needed fields (no relationships)
- Uses indexed queries
- Minimal data transfer

### 5. Caching Strategy
- Page cache: 1 hour (`revalidate = 3600`)
- API route cache: 5 minutes with stale-while-revalidate
- Database as primary source

## Performance Targets

- **Surah List Page**: <1 second to interactive
- **Surah Detail (small)**: <1 second to interactive
- **Surah Detail (large, 286 ayahs)**: <3 seconds to interactive

## Testing Performance

### Test These Surahs:
1. **Surah 1 (Al-Fatiha)** - 7 ayahs (should be instant)
2. **Surah 2 (Al-Baqarah)** - 286 ayahs (should be <3 seconds)

### How to Test:
1. Open browser DevTools → Network tab
2. Navigate to `/quran/1` and `/quran/2`
3. Check:
   - Time to First Byte (TTFB)
   - Total load time
   - Database query time (check server logs)

## Troubleshooting Slow Loads

### If Surah 2 (286 ayahs) is still slow:

1. **Check Database Indexes**:
   ```sql
   -- Run in Supabase SQL Editor
   SELECT * FROM pg_indexes WHERE tablename = 'ayahs';
   ```

2. **Verify Index Usage**:
   ```sql
   EXPLAIN ANALYZE 
   SELECT * FROM ayahs 
   WHERE "surahNumber" = 2 AND "apiProvider" = 'TEMPORARY_API' 
   ORDER BY number;
   ```

3. **Check Data in Database**:
   ```sql
   SELECT COUNT(*) FROM ayahs WHERE "surahNumber" = 2;
   ```

### If Still Slow:

1. **Run Full Sync**:
   ```bash
   npm run sync:quran
   ```
   This populates the database with all surahs and ayahs.

2. **Check Connection Pooling**:
   - Verify `DATABASE_URL` uses connection pooling
   - Check Supabase connection pooler settings

3. **Monitor Query Performance**:
   - Check Vercel function logs
   - Look for slow database queries
   - Check Supabase query performance dashboard

## Expected Performance

### With Database Cached:
- **Surah 1 (7 ayahs)**: <500ms
- **Surah 2 (286 ayahs)**: <2 seconds
- **First 20 ayahs visible**: <1 second

### Without Database Cache (First Load):
- **Surah 1**: ~2-3 seconds (API fetch + DB sync)
- **Surah 2**: ~5-10 seconds (API fetch + DB sync)
- **Subsequent loads**: Fast (from database)

## Optimization Checklist

- [x] Database indexes created
- [x] Query optimization (select only needed fields)
- [x] Lazy loading (20 ayahs initially)
- [x] Database caching (prefer DB over API)
- [x] Background syncing (non-blocking)
- [x] Page caching (1 hour)
- [x] Instant UI updates (requestAnimationFrame)

## Next Steps for Further Optimization

If still slow, consider:
1. **Pagination**: Fetch ayahs in chunks from database
2. **Streaming**: Stream ayahs as they're fetched
3. **CDN Caching**: Cache surah data at CDN level
4. **Database Partitioning**: Partition ayahs table by surah number
