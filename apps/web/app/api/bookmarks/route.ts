// Bookmarks API Route
// Handle bookmark operations (GET, POST)

import { auth } from '@/app/api/auth/[...nextauth]/route';
import { BookmarkRepository } from '@/lib/repositories/bookmark.repository';
import { UserRepository } from '@/lib/repositories/user.repository';
import { NextResponse } from 'next/server';

// GET - Get all bookmarks for current user
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRepo = new UserRepository();
    const user = await userRepo.findByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const bookmarkRepo = new BookmarkRepository();
    const bookmarks = await bookmarkRepo.findByUserId(user.id);

    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a bookmark
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRepo = new UserRepository();
    const user = await userRepo.findByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { surahNumber, ayahNumber, note } = body;

    if (!surahNumber) {
      return NextResponse.json(
        { error: 'surahNumber is required' },
        { status: 400 }
      );
    }

    const bookmarkRepo = new BookmarkRepository();
    
    // Check if bookmark already exists
    const existing = await bookmarkRepo.findByUserAndAyah(
      user.id,
      surahNumber,
      ayahNumber
    );

    if (existing) {
      // Update existing bookmark
      const updated = await bookmarkRepo.update(
        user.id,
        surahNumber,
        ayahNumber,
        { note }
      );
      return NextResponse.json({ bookmark: updated });
    }

    // Delete all other bookmarks in the same surah (only one bookmark per surah)
    await bookmarkRepo.deleteAllInSurah(user.id, surahNumber);

    // Create new bookmark
    const bookmark = await bookmarkRepo.create({
      userId: user.id,
      surahNumber,
      ayahNumber,
      note,
    });

    return NextResponse.json({ bookmark }, { status: 201 });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
