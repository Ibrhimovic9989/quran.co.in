// Bookmark API Route - Specific bookmark operations
// Handle DELETE for specific bookmark

import { auth } from '@/app/api/auth/[...nextauth]/route';
import { BookmarkRepository } from '@/lib/repositories/bookmark.repository';
import { UserRepository } from '@/lib/repositories/user.repository';
import { NextResponse } from 'next/server';

// DELETE - Delete a bookmark
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ surahNumber: string; ayahNumber?: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const surahNumber = parseInt(resolvedParams.surahNumber);
    const ayahNumber = resolvedParams.ayahNumber 
      ? parseInt(resolvedParams.ayahNumber) 
      : undefined;

    if (isNaN(surahNumber)) {
      return NextResponse.json(
        { error: 'Invalid surahNumber' },
        { status: 400 }
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
    await bookmarkRepo.delete(user.id, surahNumber, ayahNumber);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
