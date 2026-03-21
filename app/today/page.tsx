'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { BookOpen, Copy, Check, Share2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface DailyAyah {
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translationText: string | null;
  englishName: string;
  englishNameTranslation: string | null;
}

function toArabicIndicNumber(n: number) {
  return n.toString().replace(/\d/g, (d) => String.fromCharCode(0x0660 + Number(d)));
}

export default function TodayPage() {
  const [ayah, setAyah] = useState<DailyAyah | null>(null);
  const [type, setType] = useState<'personalised' | 'daily'>('daily');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [date, setDate] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quran/ayah-of-the-day');
      if (res.ok) {
        const data = await res.json();
        setAyah(data.ayah);
        setType(data.type);
        setDate(data.date);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const shareUrl = ayah
    ? `https://quran.co.in/quran/${ayah.surahNumber}?ayah=${ayah.ayahNumber}`
    : 'https://quran.co.in/today';

  const shareText = ayah
    ? `"${ayah.translationText ?? ''}" — Quran ${ayah.surahNumber}:${ayah.ayahNumber} (${ayah.englishName})\n\nRead more: ${shareUrl}`
    : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Quran — Verse of the Day', text: shareText, url: shareUrl }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${ayah?.translationText ?? ''}" — Quran ${ayah?.surahNumber}:${ayah?.ayahNumber}\n\n`)}&url=${encodeURIComponent(shareUrl)}`;

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0d2218] via-[#0d2218] to-[#0a1a12]">
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[90vh] py-16 text-center">

          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/60 bg-emerald-900/40 px-4 py-1.5 text-xs font-medium text-emerald-300 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {type === 'personalised' ? 'Personalised for you' : 'Verse of the Day'}
            </div>
            {formattedDate && (
              <p className="text-xs text-emerald-600">{formattedDate}</p>
            )}
          </div>

          {/* Ayah card */}
          {loading ? (
            <div className="w-full max-w-2xl space-y-6 animate-pulse">
              <div className="h-32 bg-emerald-900/30 rounded-3xl" />
              <div className="h-4 bg-emerald-900/20 rounded-full w-3/4 mx-auto" />
              <div className="h-4 bg-emerald-900/20 rounded-full w-1/2 mx-auto" />
            </div>
          ) : ayah ? (
            <div className="w-full max-w-2xl space-y-8">
              {/* Arabic text */}
              <div className="rounded-3xl border border-emerald-800/40 bg-emerald-950/60 px-8 py-10 backdrop-blur-sm shadow-2xl">
                {/* Decorative rule */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-amber-700/30" />
                  <span className="text-amber-600/50 text-sm">✦</span>
                  <div className="flex-1 h-px bg-amber-700/30" />
                </div>

                <p
                  dir="rtl"
                  lang="ar"
                  className="font-mushaf text-3xl md:text-5xl leading-[2] md:leading-[2.1] text-amber-100"
                >
                  {ayah.arabicText}
                  <span className="inline-flex items-center justify-center align-middle mx-2">
                    <span className="relative inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10">
                      <svg viewBox="0 0 32 32" className="absolute inset-0 w-full h-full" aria-hidden="true">
                        <circle cx="16" cy="16" r="14.5" fill="none" stroke="#9a7c4f" strokeWidth="1" />
                        <circle cx="16" cy="16" r="11" fill="none" stroke="#9a7c4f" strokeWidth="0.5" opacity="0.6" />
                      </svg>
                      <span className="relative font-mushaf text-[11px] md:text-[13px] text-amber-300 leading-none select-none">
                        {toArabicIndicNumber(ayah.ayahNumber)}
                      </span>
                    </span>
                  </span>
                </p>

                <div className="flex items-center gap-3 mt-6">
                  <div className="flex-1 h-px bg-amber-700/30" />
                  <span className="text-amber-600/50 text-sm">✦</span>
                  <div className="flex-1 h-px bg-amber-700/30" />
                </div>
              </div>

              {/* Translation */}
              {ayah.translationText && (
                <blockquote className="text-lg md:text-2xl leading-9 md:leading-10 text-emerald-100/90 italic font-light px-2">
                  &ldquo;{ayah.translationText}&rdquo;
                </blockquote>
              )}

              {/* Reference */}
              <p className="text-sm text-emerald-400/80 font-medium">
                — {ayah.englishName}{ayah.englishNameTranslation ? ` (${ayah.englishNameTranslation})` : ''}, {ayah.surahNumber}:{ayah.ayahNumber}
              </p>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {/* Read full surah */}
                <Link
                  href={`/quran/${ayah.surahNumber}?ayah=${ayah.ayahNumber}`}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  Read in context
                </Link>

                {/* Copy */}
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-700/60 bg-emerald-900/40 px-4 py-2.5 text-sm font-medium text-emerald-300 hover:bg-emerald-800/40 transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy verse'}
                </button>

                {/* Share (native or WhatsApp) */}
                <button
                  onClick={handleNativeShare}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-700/60 bg-emerald-900/40 px-4 py-2.5 text-sm font-medium text-emerald-300 hover:bg-emerald-800/40 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>

                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-green-800/60 bg-green-900/30 px-4 py-2.5 text-sm font-medium text-green-300 hover:bg-green-800/40 transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>

                {/* Twitter/X */}
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-sky-800/60 bg-sky-900/30 px-4 py-2.5 text-sm font-medium text-sky-300 hover:bg-sky-800/40 transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Post
                </a>
              </div>

              {/* Refresh */}
              <button
                onClick={load}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-400 transition-colors mt-2"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </button>
            </div>
          ) : (
            <p className="text-emerald-400">Unable to load today&apos;s verse. Please try again.</p>
          )}

          {/* Bottom links */}
          <div className="mt-16 flex gap-6 text-xs text-emerald-700">
            <Link href="/quran" className="hover:text-emerald-400 transition-colors">Browse all Surahs</Link>
            <Link href="/ask" className="hover:text-emerald-400 transition-colors">Ask the Quran</Link>
            <Link href="/topics" className="hover:text-emerald-400 transition-colors">Explore topics</Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
