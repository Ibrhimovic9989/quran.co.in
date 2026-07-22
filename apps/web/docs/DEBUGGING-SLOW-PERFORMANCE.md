# Debugging Slow Performance Guide

If pages are taking 5-6 seconds to load, follow this guide to identify the bottleneck.

## Step 1: Check Server Logs

### On Vercel:
1. Go to Vercel Dashboard → Your Project → Functions
2. Check the function logs for your requests
3. Look for:
   - Query execution times
   - Cold start warnings
   - Database connection times

### On Local:
1. Check terminal output when running `npm run dev`
2. Look for query logs (if enabled)
3. Check for warnings about slow queries

## Step 2: Identify the Bottleneck

### Check Query Times

Add this to your page temporarily:

```typescript
// app/quran/page.tsx
export default async function QuranPage() {
  const startTime = Date.now();
  const cacheService = new QuranCacheService();
  const surahs = await cacheService.getAllSurahs('TEMPORARY_API');
  const queryTime = Date.now() - startTime;
  
  console.log(`[PERF] Surah list query: ${queryTime}ms`);
  
  // ... rest of code
}
```

### Check Database Connection

1. **Verify Connection Pooling**:
   - Check `DATABASE_URL` uses Supabase connection pooler (port 6543)
   - Format: `postgresql://...@...:6543/...?pgbouncer=true`

2. **Test Connection Speed**:
   ```sql
   -- Run in Supabase SQL Editor
   SELECT NOW();
   ```
   If this is slow, it's a network/connection issue.

### Check Cold Starts

- **First request after deployment**: Can be 2-5 seconds (cold start)
- **Subsequent requests**: Should be <1 second
- **Solution**: Use Vercel Edge Functions or keep functions warm

## Step 3: Common Issues & Solutions

### Issue 1: Cold Starts (Vercel)

**Symptoms**: First request is slow, subsequent requests are fast

**Solution**:
1. Use Edge Runtime for static pages
2. Keep functions warm with cron jobs
3. Use ISR (Incremental Static Regeneration)

### Issue 2: Database Connection Latency

**Symptoms**: All requests are slow, even cached data

**Solution**:
1. Verify `DATABASE_URL` uses connection pooling
2. Check Supabase region matches Vercel region
3. Use `DIRECT_URL` only for migrations

### Issue 3: Large Metadata Fields

**Symptoms**: Query is fast but processing is slow

**Solution**:
1. Don't fetch metadata if not needed
2. Parse metadata lazily
3. Cache processed results

### Issue 4: Missing Indexes

**Symptoms**: Database queries are slow

**Solution**:
1. Run index migration: `npm run db:index`
2. Verify indexes exist:
   ```sql
   SELECT * FROM pg_indexes WHERE tablename IN ('surahs', 'ayahs');
   ```

### Issue 5: Network Latency

**Symptoms**: Database is fast locally but slow on Vercel

**Solution**:
1. Deploy Vercel functions in same region as Supabase
2. Use Supabase connection pooler
3. Enable Vercel Edge Network

## Step 4: Performance Testing

### Test Locally:
```bash
# Time the query
time curl http://localhost:3000/quran
```

### Test on Vercel:
1. Open browser DevTools → Network tab
2. Navigate to `/quran`
3. Check:
   - **TTFB (Time to First Byte)**: Should be <500ms
   - **Total Load Time**: Should be <2 seconds
   - **Database Query Time**: Check server logs

## Step 5: Quick Fixes

### 1. Enable Response Caching

Already implemented:
- Page cache: 1 hour (`revalidate = 3600`)
- API route cache: 5 minutes

### 2. Reduce Query Logging

In production, Prisma only logs errors (already configured).

### 3. Use Edge Runtime (if applicable)

For static pages, consider Edge Runtime for faster cold starts.

## Step 6: Monitor Performance

### Add Performance Monitoring:

```typescript
// lib/utils/performance.ts
export function logPerformance(label: string, fn: () => Promise<any>) {
  return async () => {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    
    if (duration > 1000) {
      console.warn(`[PERF] ${label}: ${duration}ms (SLOW)`);
    } else {
      console.log(`[PERF] ${label}: ${duration}ms`);
    }
    
    return result;
  };
}
```

## Expected Performance

### With Optimizations:
- **Surah List**: <500ms (database query <100ms)
- **Surah Detail (small)**: <1s (database query <200ms)
- **Surah Detail (large)**: <2s (database query <500ms)

### If Still Slow:

1. **Check Vercel Function Logs**:
   - Look for cold start warnings
   - Check database query times
   - Look for timeout errors

2. **Check Supabase Dashboard**:
   - Go to Database → Query Performance
   - Look for slow queries
   - Check connection pool usage

3. **Test Database Directly**:
   ```sql
   -- Test query speed
   EXPLAIN ANALYZE 
   SELECT * FROM surahs 
   WHERE "apiProvider" = 'TEMPORARY_API' 
   ORDER BY number;
   ```

## Next Steps

If performance is still slow after these checks:

1. **Consider Edge Functions**: For static content
2. **Use CDN Caching**: Cache API responses
3. **Database Optimization**: Add more indexes, partition tables
4. **Connection Pooling**: Use PgBouncer or Supabase pooler
5. **Reduce Metadata Size**: Store only essential data in metadata
