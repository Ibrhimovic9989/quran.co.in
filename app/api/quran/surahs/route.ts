// API Route: Get all surahs
// Returns list of all surahs from the Quran (cached)

import { NextResponse } from 'next/server';
import { QuranCacheService } from '@/lib/services/quran-cache.service';

// Cache for 60 seconds
export const revalidate = 60;

export async function GET() {
  try {
    const cacheService = new QuranCacheService();
    const surahs = await cacheService.getAllSurahs('TEMPORARY_API');
    
    return NextResponse.json(
      { surahs },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching surahs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch surahs' },
      { status: 500 }
    );
  }
}
