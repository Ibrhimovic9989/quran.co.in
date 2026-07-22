// API Route: Get ayahs for a surah (on-demand loading)
// NETFLIX-STYLE: Load remaining ayahs on demand

import { NextResponse } from 'next/server';
import { QuranRepository } from '@/lib/repositories';

// Cache for 1 hour
export const revalidate = 3600;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const { number } = await params;
    const { searchParams } = new URL(request.url);
    const surahNo = parseInt(number, 10);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10) || 20, 1), 300);

    if (isNaN(surahNo) || surahNo < 1 || surahNo > 114) {
      return NextResponse.json(
        { error: 'Invalid surah number. Must be between 1 and 114.' },
        { status: 400 }
      );
    }

    const repository = new QuranRepository();

    // Read only the requested page from the DB (skip+take) instead of fetching
    // offset+limit rows and slicing in JS.
    const [paginatedAyahs, total] = await Promise.all([
      repository.findAyahsBySurah(surahNo, 'TEMPORARY_API', limit, offset),
      repository.countAyahsBySurah(surahNo, 'TEMPORARY_API'),
    ]);

    const hasMore = offset + paginatedAyahs.length < total;

    return NextResponse.json(
      { ayahs: paginatedAyahs, hasMore },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching ayahs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ayahs' },
      { status: 500 }
    );
  }
}
