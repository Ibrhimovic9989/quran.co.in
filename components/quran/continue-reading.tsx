// Continue Reading Component
// Shows the bookmarked surah/ayah for quick access

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ContinueReadingProps {
  className?: string;
}

interface Bookmark {
  surahNumber: number;
  ayahNumber?: number;
  surah: {
    arabicName: string;
    englishName: string;
    englishNameTranslation?: string;
  };
}

export function ContinueReading({ className }: ContinueReadingProps) {
  const { data: session, status } = useSession();
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchBookmark();
    } else {
      setIsLoading(false);
    }
  }, [status, session]);

  const fetchBookmark = async () => {
    try {
      const response = await fetch('/api/bookmarks');
      if (response.ok) {
        const data = await response.json();
        // Get the most recent bookmark (first one since they're ordered by createdAt desc)
        if (data.bookmarks && data.bookmarks.length > 0) {
          const latestBookmark = data.bookmarks[0];
          setBookmark({
            surahNumber: latestBookmark.surahNumber,
            ayahNumber: latestBookmark.ayahNumber,
            surah: latestBookmark.surah,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !bookmark) {
    return null;
  }

  const surahUrl = `/quran/${bookmark.surahNumber}${bookmark.ayahNumber ? `?ayah=${bookmark.ayahNumber}` : ''}`;
  const surahName = bookmark.surah.englishNameTranslation 
    ? `${bookmark.surah.englishName} (${bookmark.surah.englishNameTranslation})`
    : bookmark.surah.englishName;

  return (
    <div className={cn('mb-6 md:mb-8', className)}>
      <Heading level={2} className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
        Continue Reading
      </Heading>
      <Link href={surahUrl}>
        <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group">
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {/* Arabic Name */}
                <div className="text-2xl md:text-4xl text-right mb-2 md:mb-3 font-arabic text-gray-900">
                  {bookmark.surah.arabicName}
                </div>
                {/* English Name and Verse */}
                <div className="flex items-center gap-2 md:gap-3">
                  <Text className="text-sm md:text-base font-semibold text-gray-900">
                    {bookmark.surahNumber}. {surahName}
                  </Text>
                  {bookmark.ayahNumber && (
                    <>
                      <span className="text-gray-400">•</span>
                      <Text className="text-sm md:text-base text-gray-600">
                        Verse {bookmark.ayahNumber}
                      </Text>
                    </>
                  )}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-gray-900 transition-colors" />
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}
