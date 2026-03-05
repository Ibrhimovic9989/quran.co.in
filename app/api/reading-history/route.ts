// Reading History API Route
// Handle reading history operations (GET, POST)

import { auth } from '@/app/api/auth/[...nextauth]/route';
import { ReadingHistoryRepository } from '@/lib/repositories/reading-history.repository';
import { UserRepository } from '@/lib/repositories/user.repository';
import { NextResponse } from 'next/server';

// GET - Get latest reading history for current user
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

    const historyRepo = new ReadingHistoryRepository();
    const latest = await historyRepo.getLatest(user.id);

    return NextResponse.json({ readingHistory: latest });
  } catch (error) {
    console.error('Error fetching reading history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update reading history
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
    const { surahNumber, ayahNumber } = body;

    if (!surahNumber) {
      return NextResponse.json(
        { error: 'surahNumber is required' },
        { status: 400 }
      );
    }

    const historyRepo = new ReadingHistoryRepository();
    const history = await historyRepo.upsert({
      userId: user.id,
      surahNumber,
      ayahNumber,
    });

    return NextResponse.json({ readingHistory: history }, { status: 201 });
  } catch (error) {
    console.error('Error creating reading history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
