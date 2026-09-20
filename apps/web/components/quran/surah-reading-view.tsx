'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { ChevronDown, ChevronUp, Play, Maximize2, X, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { AudioPlayer } from './audio-player';
import { ReciterSelector } from '@/components/ui/molecules';
import { cn } from '@/lib/utils/cn';
import { useOptionalSurahPlayback } from './surah-playback-provider';
import { useToast } from '@/components/ui/toast';
import { useBookmarks } from './bookmarks-provider';
import { getRevelationInfo, PERIOD_LABELS, PERIOD_COLORS, PERIOD_DESCRIPTIONS, APPROXIMATION_NOTE } from '@/lib/data/revelation-periods';

interface SurahReadingViewProps {
  surahNumber: number;
  surahNameArabic: string;
  surahNameTranslation: string;
  revelationPlace: 'Mecca' | 'Madina';
  totalAyah: number;
  loadedAyahs: {
    english: string[];
    arabic1: string[];
    arabic2: string[];
  };
  visibleAyahs: number;
  audioData: Record<string, { reciter: string; url: string; originalUrl: string }>;
  selectedReciter: string | null;
  onReciterChange: (reciterId: string) => void;
}

type ReadingTextMode = 'arabic' | 'transliteration' | 'translation';
type QuranFontStyle = 'uthmani' | 'indopak';
type QuranFontSize = 'sm' | 'md' | 'lg' | 'xl';

const FONT_STYLES: { id: QuranFontStyle; label: string; sublabel: string; cssClass: string }[] = [
  { id: 'uthmani', label: 'Saudi',    sublabel: 'عثماني',  cssClass: 'font-mushaf' },
  { id: 'indopak', label: 'Indo-Pak', sublabel: 'ہندی',    cssClass: 'font-mushaf-indopak' },
];

const FONT_SIZE_CLASSES: Record<QuranFontSize, string> = {
  sm: 'text-[1.2rem] md:text-[1.5rem] leading-[2.1] md:leading-[2.3]',
  md: 'text-[1.5rem] md:text-[2rem] leading-[2.3] md:leading-[2.45]',
  lg: 'text-[1.8rem] md:text-[2.4rem] leading-[2.4] md:leading-[2.6]',
  xl: 'text-[2.1rem] md:text-[2.8rem] leading-[2.5] md:leading-[2.7]',
};

const FONT_STYLE_KEY = 'quran-font-style';
const FONT_SIZE_KEY = 'quran-font-size';
const PREFS_NOTICE_KEY = 'quran-prefs-notice-shown';
const SURAH_WITHOUT_BISMILLAH = 9;
const SURAH_FATIHA = 1;
const AYAHS_PER_PAGE = 8;

function toArabicIndicNumber(n: number) {
  return n.toString().replace(/\d/g, (d) => String.fromCharCode(0x0660 + Number(d)));
}

/** Compact ayah-end medallion — smaller, inline. Gold-soft fill when bookmarked, pulsing ring when targeted. */
function AyahMedallion({ n, bookmarked, pulsing }: { n: number; bookmarked?: boolean; pulsing?: boolean }) {
  return (
    <span
      className="inline-flex items-center justify-center align-middle mx-1"
      aria-label={`Verse ${n}`}
    >
      <span className="relative inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8">
        {pulsing && (
          <span className="absolute inset-0 animate-ping rounded-full bg-gold/50" aria-hidden="true" />
        )}
        <svg viewBox="0 0 32 32" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <circle cx="16" cy="16" r="14.5" fill={bookmarked || pulsing ? 'var(--gold-soft)' : 'none'} stroke="var(--gold)" strokeWidth="1" />
          <circle cx="16" cy="16" r="11"   fill="none" stroke="var(--gold)" strokeWidth="0.5" opacity="0.5" />
        </svg>
        <span className="relative select-none font-mushaf text-[9px] leading-none text-gold-text md:text-[11px]">
          {toArabicIndicNumber(n)}
        </span>
      </span>
    </span>
  );
}

/** Page separator — thin rule with page number */
function PageSeparator({ pageNum }: { pageNum: number }) {
  return (
    <div className="flex items-center gap-3 py-5 md:py-7" role="separator">
      <div className="h-px flex-1 bg-gold/40" />
      <span className="font-mushaf text-xs tabular-nums text-gold-text md:text-sm">
        {toArabicIndicNumber(pageNum)}
      </span>
      <div className="h-px flex-1 bg-gold/40" />
    </div>
  );
}

export function SurahReadingView({
  surahNumber,
  surahNameArabic,
  surahNameTranslation,
  revelationPlace,
  totalAyah,
  loadedAyahs,
  visibleAyahs,
  audioData,
  selectedReciter,
  onReciterChange,
}: SurahReadingViewProps) {
  const [textMode, setTextMode] = useState<ReadingTextMode>('arabic');
  const [showAudioControls, setShowAudioControls] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const [fontStyle, setFontStyle] = useState<QuranFontStyle>(() => {
    if (typeof window === 'undefined') return 'uthmani';
    return (localStorage.getItem(FONT_STYLE_KEY) as QuranFontStyle) ?? 'uthmani';
  });

  const [fontSize, setFontSize] = useState<QuranFontSize>(() => {
    if (typeof window === 'undefined') return 'md';
    return (localStorage.getItem(FONT_SIZE_KEY) as QuranFontSize) ?? 'md';
  });

  const sharedPlayback = useOptionalSurahPlayback();
  const { info } = useToast();
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();
  const [selectedAyahNo, setSelectedAyahNo] = useState<number | null>(null);

  const showBismillah = surahNumber !== SURAH_FATIHA && surahNumber !== SURAH_WITHOUT_BISMILLAH;
  const isMadinan = revelationPlace === 'Madina';
  const fontClass = FONT_STYLES.find((f) => f.id === fontStyle)?.cssClass ?? 'font-mushaf';
  const revelation = getRevelationInfo(surahNumber);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(min-width: 768px)').matches) setShowAudioControls(true);
  }, []);

  const handleFontStyleChange = useCallback((style: QuranFontStyle) => {
    setFontStyle(style);
    if (typeof window !== 'undefined') {
      localStorage.setItem(FONT_STYLE_KEY, style);
      if (!localStorage.getItem(PREFS_NOTICE_KEY)) {
        localStorage.setItem(PREFS_NOTICE_KEY, '1');
        setTimeout(() => info("We'll remember your preferences on this device."), 200);
      }
    }
  }, [info]);

  const handleFontSizeChange = useCallback((size: QuranFontSize) => {
    setFontSize(size);
    if (typeof window !== 'undefined') localStorage.setItem(FONT_SIZE_KEY, size);
  }, []);

  const FONT_SIZE_ORDER: QuranFontSize[] = ['sm', 'md', 'lg', 'xl'];

  const allAyahs = useMemo(() => {
    const n = Math.min(visibleAyahs, loadedAyahs.arabic1.length, loadedAyahs.english.length);
    return Array.from({ length: n }, (_, i) => ({
      ayahNo: i + 1,
      arabic: loadedAyahs.arabic1[i] || '',
      transliteration: loadedAyahs.arabic2[i] || '',
      translation: loadedAyahs.english[i] || '',
    }));
  }, [loadedAyahs.arabic1, loadedAyahs.arabic2, loadedAyahs.english, visibleAyahs]);

  // Split into pages
  const pages = useMemo(() => {
    const result: typeof allAyahs[] = [];
    for (let i = 0; i < allAyahs.length; i += AYAHS_PER_PAGE) {
      result.push(allAyahs.slice(i, i + AYAHS_PER_PAGE));
    }
    return result;
  }, [allAyahs]);

  // Scroll active ayah into view
  useEffect(() => {
    const activeAyah = sharedPlayback?.activeAyahNumber;
    if (!activeAyah) return;
    const el = document.getElementById(`ayah-${surahNumber}-${activeAyah}`);
    if (!el) return;
    const t = window.setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
    return () => window.clearTimeout(t);
  }, [sharedPlayback?.activeAyahNumber, surahNumber]);

  const controlsBar = (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setShowAudioControls((v) => !v)}
        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-[13px] font-semibold text-ink-soft transition-colors hover:border-accent/30 hover:text-accent-strong"
        aria-expanded={showAudioControls}
      >
        <Play className="h-4 w-4 text-accent" aria-hidden="true" />
        Audio
        {showAudioControls
          ? <ChevronUp className="h-4 w-4 text-ink-muted" aria-hidden="true" />
          : <ChevronDown className="h-4 w-4 text-ink-muted" aria-hidden="true" />
        }
      </button>

      {/* Arabic / Transliteration / Translation toggle */}
      <div className="inline-flex shrink-0 rounded-full border border-line bg-surface p-1">
        {([
          { id: 'arabic', label: 'Arabic', beta: false },
          { id: 'transliteration', label: 'Translit', beta: true },
          { id: 'translation', label: 'Translation', beta: false },
        ] as const).map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setTextMode(mode.id)}
            className={cn(
              'flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors',
              textMode === mode.id ? 'bg-accent text-white' : 'text-ink-muted hover:text-ink'
            )}
          >
            {mode.label}
            {mode.beta && (
              <span className={cn(
                'rounded px-1 py-0.5 text-[8px] font-bold leading-none tracking-wider',
                textMode === mode.id ? 'bg-white/25 text-white' : 'bg-tint-lavender text-ink-soft'
              )}>BETA</span>
            )}
          </button>
        ))}
      </div>

      {/* Font style selector — arabic only */}
      {textMode === 'arabic' && (
        <div className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-line bg-surface p-1">
          {FONT_STYLES.map((fs) => (
            <button
              key={fs.id}
              type="button"
              onClick={() => handleFontStyleChange(fs.id)}
              title={`${fs.label} script`}
              className={cn(
                'flex flex-col items-center rounded-full px-3 py-1 text-[11px] font-semibold leading-tight transition-colors',
                fontStyle === fs.id
                  ? 'bg-accent text-white'
                  : 'text-ink-muted hover:bg-accent-soft/60 hover:text-accent-strong'
              )}
            >
              <span>{fs.label}</span>
              <span className={cn(
                'text-[10px] leading-none mt-0.5',
                fontStyle === fs.id ? 'opacity-80' : 'opacity-60',
                fs.id === 'indopak' ? 'font-mushaf-indopak' : 'font-mushaf'
              )}>
                {fs.sublabel}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Font size A− / A+ */}
      {textMode === 'arabic' && (
        <div className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-line bg-surface px-2 py-1">
          <button
            type="button"
            onClick={() => {
              const idx = FONT_SIZE_ORDER.indexOf(fontSize);
              if (idx > 0) handleFontSizeChange(FONT_SIZE_ORDER[idx - 1]);
            }}
            disabled={fontSize === 'sm'}
            aria-label="Decrease font size"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold text-ink-soft transition-colors hover:bg-accent-soft/60 hover:text-accent-strong disabled:cursor-not-allowed disabled:opacity-30"
          >
            A<span className="text-[9px]">−</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const idx = FONT_SIZE_ORDER.indexOf(fontSize);
              if (idx < FONT_SIZE_ORDER.length - 1) handleFontSizeChange(FONT_SIZE_ORDER[idx + 1]);
            }}
            disabled={fontSize === 'xl'}
            aria-label="Increase font size"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold text-ink-soft transition-colors hover:bg-accent-soft/60 hover:text-accent-strong disabled:cursor-not-allowed disabled:opacity-30"
          >
            A<span className="text-[11px]">+</span>
          </button>
        </div>
      )}

      {/* Focus mode button */}
      {textMode === 'arabic' && (
        <button
          type="button"
          onClick={() => setFocusMode(true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-2 text-[11px] font-semibold text-ink-muted transition-colors hover:border-accent/30 hover:text-accent-strong"
          aria-label="Enter focus mode"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Focus
        </button>
      )}
    </div>
  );

  const audioPanel = showAudioControls && Object.keys(audioData).length > 0 && (
    <div className="mb-4 rounded-2xl border border-line bg-surface p-3 md:p-4">
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Listen</span>
        <ReciterSelector
          audioData={audioData}
          selectedReciter={selectedReciter}
          onReciterChange={onReciterChange}
          hideLabel minimal
          className="min-w-[13rem] flex-1 md:max-w-sm md:flex-none"
        />
        <AudioPlayer
          audioData={audioData}
          surahNo={surahNumber}
          selectedReciter={selectedReciter}
          onReciterChange={onReciterChange}
          enableSharedPlayback minimal
          className="flex-1 md:flex-none"
        />
      </div>
    </div>
  );

  const mushafBody = textMode !== 'translation' ? (
    <div className="mushaf-paper rounded-2xl md:rounded-3xl px-4 py-8 md:px-12 md:py-12">

      {/* Surah header — shown once at top */}
      <div className="mb-6 md:mb-10 text-center">
        {/* Top rule */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-gold/40" />
          <span className="text-sm text-gold" aria-hidden="true">✦</span>
          <div className="h-px flex-1 bg-gold/40" />
        </div>

        <p lang="ar" className={`${fontClass} text-2xl md:text-4xl font-bold text-ink leading-tight`}>
          {surahNameArabic}
        </p>
        <p className="mt-1.5 text-[11px] uppercase tracking-[0.16em] text-ink-muted md:text-xs">
          {surahNameTranslation}
        </p>

        {/* Revelation info row */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {/* Meccan / Madinan Arabic badge */}
          <span className={cn(
            `${fontClass} text-xs md:text-sm px-3 py-0.5 rounded-full border`,
            isMadinan
              ? 'border-transparent bg-tint-sage text-accent-strong'
              : 'border-transparent bg-tint-sun text-gold-text'
          )}>
            {isMadinan ? 'مَدَنِيَّة' : 'مَكِّيَّة'}
          </span>

          {/* Ayah count */}
          <span lang="ar" className={`${fontClass} text-xs md:text-sm text-ink-muted`}>
            {toArabicIndicNumber(totalAyah)} آيَة
          </span>

          {/* Period + year info */}
          {revelation && (
            <>
              <span className="text-xs text-gold">•</span>
              <span
                title={`${PERIOD_DESCRIPTIONS[revelation.period]}\n\n${APPROXIMATION_NOTE}`}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] md:text-xs font-medium cursor-help',
                  PERIOD_COLORS[revelation.period].badge
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', PERIOD_COLORS[revelation.period].dot)} />
                {PERIOD_LABELS[revelation.period]}
              </span>
              <span title={APPROXIMATION_NOTE} className="cursor-help text-[11px] font-medium text-ink-muted md:text-xs">
                {revelation.yearCE} CE*
              </span>
              <span className="text-xs text-gold">•</span>
              <span title={APPROXIMATION_NOTE} className="cursor-help text-[11px] text-ink-muted md:text-xs">
                {revelation.yearProphethood}
              </span>
            </>
          )}
        </div>

        {/* Bottom rule */}
        <div className="mt-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-gold/40" />
          <span className="text-sm text-gold" aria-hidden="true">✦</span>
          <div className="h-px flex-1 bg-gold/40" />
        </div>
      </div>

      {/* Bismillah — once, after header */}
      {showBismillah && (
        <div className="mb-6 md:mb-10 text-center">
          {textMode === 'arabic' ? (
            <p
              dir="rtl"
              lang="ar"
              className={`${fontClass} text-2xl md:text-[2rem] text-ink leading-loose`}
              aria-label="Bismillah ir-Rahman ir-Raheem"
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
          ) : (
            <p className="text-lg leading-loose text-ink-soft md:text-2xl">
              Bismi Allāhi r-raḥmāni r-raḥīm
            </p>
          )}
          <p className="mt-1 text-[11px] text-ink-muted md:text-xs">
            In the Name of Allah—the Most Compassionate, Most Merciful
          </p>
        </div>
      )}

      {/* All pages — continuous vertical scroll */}
      {pages.map((pageAyahs, pageIndex) => (
        <div key={pageIndex}>
          {textMode === 'arabic' ? (
            <div className={`mushaf-text ${fontClass} ${FONT_SIZE_CLASSES[fontSize]} text-ink`}>
              {pageAyahs.map((ayah) => (
                <span
                  key={ayah.ayahNo}
                  id={`ayah-${surahNumber}-${ayah.ayahNo}`}
                  className={cn(
                    'inline transition-all duration-300 rounded px-0.5',
                    sharedPlayback?.activeAyahNumber === ayah.ayahNo &&
                      'bg-accent-soft ring-1 ring-accent/25'
                  )}
                >
                  {ayah.arabic}
                  <button
                    type="button"
                    onClick={() => setSelectedAyahNo(ayah.ayahNo === selectedAyahNo ? null : ayah.ayahNo)}
                    aria-label={`Actions for verse ${ayah.ayahNo}`}
                    className="inline align-middle cursor-pointer"
                  >
                    <AyahMedallion n={ayah.ayahNo} bookmarked={isBookmarked(surahNumber, ayah.ayahNo)} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="mushaf-text text-base md:text-xl leading-[2.4] md:leading-[2.6] text-ink-soft italic">
              {pageAyahs.map((ayah) => (
                <span
                  key={ayah.ayahNo}
                  id={`ayah-${surahNumber}-${ayah.ayahNo}`}
                  className={cn(
                    'inline transition-all duration-300 rounded px-0.5',
                    sharedPlayback?.activeAyahNumber === ayah.ayahNo &&
                      'bg-accent-soft ring-1 ring-accent/25'
                  )}
                >
                  {ayah.transliteration}
                  <button
                    type="button"
                    onClick={() => setSelectedAyahNo(ayah.ayahNo === selectedAyahNo ? null : ayah.ayahNo)}
                    aria-label={`Actions for verse ${ayah.ayahNo}`}
                    className="inline align-middle cursor-pointer"
                  >
                    <AyahMedallion n={ayah.ayahNo} bookmarked={isBookmarked(surahNumber, ayah.ayahNo)} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Page separator (not after the last page) */}
          {pageIndex < pages.length - 1 && (
            <PageSeparator pageNum={pageIndex + 1} />
          )}
        </div>
      ))}

      {/* Final page number */}
      {pages.length > 0 && (
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gold/40" />
          <span className="font-mushaf text-xs text-gold-text md:text-sm">
            {toArabicIndicNumber(pages.length)}
          </span>
          <div className="h-px flex-1 bg-gold/40" />
        </div>
      )}
    </div>
  ) : (
    /* ── Translation — continuous scroll ── */
    <div className="space-y-2 rounded-2xl border border-line bg-surface px-3 py-4 md:space-y-4 md:px-8 md:py-6">
      {showBismillah && (
        <p className="mb-4 border-b border-line pb-3 text-center text-[13px] text-ink-muted md:text-sm">
          In the Name of Allah—the Most Compassionate, Most Merciful
        </p>
      )}
      {allAyahs.map((ayah) => (
        <p
          key={ayah.ayahNo}
          id={`ayah-${surahNumber}-${ayah.ayahNo}`}
          className={cn(
            'rounded-xl px-3 py-2 text-[15px] leading-8 text-ink transition-colors duration-300 md:text-lg md:leading-10',
            sharedPlayback?.activeAyahNumber === ayah.ayahNo &&
              'bg-accent-soft ring-1 ring-accent/25'
          )}
        >
          <span className="font-heading font-bold text-accent-strong">{ayah.ayahNo}.</span>{' '}
          {ayah.translation}
        </p>
      ))}
    </div>
  );

  return (
    <>
      {/* ── Normal view ── */}
      <div className={focusMode ? 'hidden' : undefined}>
        {controlsBar}
        {audioPanel}
        {mushafBody}
      </div>

      {/* ── Ayah action sheet — appears when medallion is tapped ── */}
      {selectedAyahNo !== null && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setSelectedAyahNo(null)}
          />
          {/* Bottom sheet */}
          <div className="fixed inset-x-0 bottom-20 z-50 px-2 animate-in slide-in-from-bottom-4 duration-200 md:bottom-0 md:px-0">
            <div className="mx-auto max-w-lg rounded-2xl border border-line bg-surface px-5 py-4 shadow-card-hover md:rounded-b-none md:rounded-t-2xl">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-heading text-[13px] font-bold tracking-[-0.025em] text-ink">
                  {surahNameTranslation} — Verse {selectedAyahNo}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedAyahNo(null)}
                  className="rounded-full p-1 text-ink-muted transition-colors hover:bg-accent-soft/60 hover:text-accent-strong"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toggleBookmark({ surahNumber, ayahNumber: selectedAyahNo });
                    setSelectedAyahNo(null);
                  }}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors',
                    isBookmarked(surahNumber, selectedAyahNo)
                      ? 'bg-gold-soft text-gold-text hover:bg-gold/30'
                      : 'bg-tint-sun text-gold-text hover:bg-gold-soft'
                  )}
                >
                  {isBookmarked(surahNumber, selectedAyahNo)
                    ? <><BookmarkCheck className="h-4 w-4" /> Bookmarked</>
                    : <><Bookmark className="h-4 w-4" /> Bookmark</>
                  }
                </button>
                <Link
                  href={`/quran/${surahNumber}?ayah=${selectedAyahNo}`}
                  onClick={() => setSelectedAyahNo(null)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-[13px] font-semibold text-accent-strong transition-colors hover:bg-accent-soft/60"
                >
                  <ExternalLink className="h-4 w-4" />
                  Verse view
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Focus mode overlay ── */}
      {focusMode && (
        <div className="fixed inset-0 z-50 overflow-y-auto theme-focus-overlay px-4 py-12">
          <button
            type="button"
            onClick={() => setFocusMode(false)}
            className="fixed right-4 top-4 z-[60] inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/90 px-3 py-1.5 text-[11px] font-semibold text-ink-soft shadow-card backdrop-blur-sm transition-colors hover:bg-surface hover:text-accent-strong"
          >
            <X className="h-3.5 w-3.5" />
            Exit focus
          </button>
          <div className="max-w-3xl mx-auto">
            {mushafBody}
          </div>
        </div>
      )}
    </>
  );
}
