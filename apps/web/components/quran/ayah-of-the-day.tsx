'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import { backendUrl } from '@/lib/api/backend';
import { useSession } from '@/components/auth/auth-client';
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
    fetch(backendUrl('/api/quran/ayah-of-the-day'), { cache: 'no-store', credentials: 'include' })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  if (loading) {
    return (
      <div className={cn('animate-pulse rounded-2xl border border-line bg-surface p-5', className)}>
        <div className="mb-4 h-3 w-32 rounded-full bg-line" />
        <div className="mb-3 h-8 w-full rounded-lg bg-line-soft" />
        <div className="h-3 w-3/4 rounded-full bg-line-soft" />
      </div>
    );
  }

  if (!data?.ayah) return null;

  const { ayah, type } = data;
  const isPersonalised = type === 'personalised';

  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-card',
      className
    )}>
      {/* Top label */}
      <div className="flex items-center justify-between gap-2 border-b border-line-soft bg-tint-sun/50 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-gold-text" strokeWidth={1.6} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-text">
            {isPersonalised ? 'Recommended for you' : "Ayah of the Day"}
          </span>
        </div>
        <span className="shrink-0 text-[10px] text-ink-muted">
          {ayah.englishName} {ayah.surahNumber}:{ayah.ayahNumber}
        </span>
      </div>

      {/* Arabic */}
      <p
        lang="ar"
        dir="rtl"
        className="font-arabic text-right text-xl md:text-2xl leading-[2.1] text-ink px-4 py-2"
      >
        {ayah.arabicText}
      </p>

      {/* Translation */}
      {ayah.translationText && (
        <p className="px-4 pb-3 text-[13px] leading-[1.75] text-ink-soft">
          "{ayah.translationText}"
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 border-t border-line-soft px-4 pb-4 pt-3">
        <span className="min-w-0 truncate text-[11px] text-ink-muted">
          {ayah.englishName}
          {ayah.englishNameTranslation && ` · ${ayah.englishNameTranslation}`}
        </span>
        <Link
          href={`/quran/${ayah.surahNumber}`}
          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-accent-strong transition-colors hover:text-accent"
        >
          Read surah <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
