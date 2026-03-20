'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils/cn';

interface AyahData {
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translationText: string | null;
  englishName: string;
  englishNameTranslation: string | null;
}

interface Response {
  ayah: AyahData | null;
  type: 'personalised' | 'daily';
  date: string;
}

export function AyahOfTheDay({ className }: { className?: string }) {
  const { status } = useSession();
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    setLoading(true);
    fetch('/api/quran/ayah-of-the-day')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  if (loading) {
    return (
      <div className={cn('rounded-2xl border border-amber-100 bg-amber-50/40 p-5 animate-pulse', className)}>
        <div className="h-3 w-32 bg-amber-100 rounded mb-4" />
        <div className="h-8 w-full bg-amber-100 rounded mb-3" />
        <div className="h-3 w-3/4 bg-amber-50 rounded" />
      </div>
    );
  }

  if (!data?.ayah) return null;

  const { ayah, type } = data;
  const isPersonalised = type === 'personalised';

  return (
    <div className={cn(
      'relative rounded-2xl border border-amber-200/70 overflow-hidden',
      'bg-gradient-to-br from-amber-50 via-white to-orange-50/30',
      className
    )}>
      {/* Top label */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-semibold text-amber-700">
            {isPersonalised ? 'Recommended for you' : "Ayah of the Day"}
          </span>
        </div>
        <span className="text-[10px] text-amber-500/70">
          {ayah.englishName} {ayah.surahNumber}:{ayah.ayahNumber}
        </span>
      </div>

      {/* Arabic */}
      <p
        lang="ar"
        dir="rtl"
        className="font-arabic text-right text-xl md:text-2xl leading-[2.1] text-gray-900 px-4 py-2"
      >
        {ayah.arabicText}
      </p>

      {/* Translation */}
      {ayah.translationText && (
        <p className="text-sm text-gray-600 leading-relaxed px-4 pb-3 italic">
          "{ayah.translationText}"
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 pt-2 pb-4 border-t border-amber-100/80">
        <span className="text-xs text-amber-700/60">
          {ayah.englishName}
          {ayah.englishNameTranslation && ` · ${ayah.englishNameTranslation}`}
        </span>
        <Link
          href={`/quran/${ayah.surahNumber}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
        >
          Read surah <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
