'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { SeasonalTheme } from '@/lib/utils/seasonal-theme/seasonal-theme';
import { cn } from '@/lib/utils/cn';

interface BannerConfig {
  arabicGreeting: string;
  englishGreeting: string;
  subtext: string;
  icon: string;
  bg: string;
  border: string;
  text: string;
  subTextColor: string;
  closeColor: string;
}

const BANNER_CONFIG: Record<Exclude<SeasonalTheme, 'none'>, BannerConfig> = {
  'ramadan': {
    arabicGreeting: 'رَمَضَانُ مُبَارَكٌ',
    englishGreeting: 'Ramadan Mubarak',
    subtext: 'May Allah accept your fasting, prayers, and recitation this blessed month.',
    icon: '🌙',
    bg: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    border: 'border-emerald-500',
    text: 'text-white',
    subTextColor: 'text-emerald-100',
    closeColor: 'text-emerald-200 hover:text-white hover:bg-emerald-700',
  },
  'eid-ul-fitr': {
    arabicGreeting: 'عِيدُ الفِطْرِ مُبَارَكٌ',
    englishGreeting: 'Eid ul Fitr Mubarak',
    subtext: 'Taqabbal Allahu minna wa minkum — May Allah accept from us and from you.',
    icon: '✨',
    bg: 'bg-gradient-to-r from-amber-500 to-yellow-500',
    border: 'border-amber-400',
    text: 'text-white',
    subTextColor: 'text-amber-100',
    closeColor: 'text-amber-200 hover:text-white hover:bg-amber-600',
  },
  'eid-ul-adha': {
    arabicGreeting: 'عِيدُ الأَضْحَى مُبَارَكٌ',
    englishGreeting: 'Eid ul Adha Mubarak',
    subtext: 'May Allah accept the Hajj of the pilgrims and the sacrifices of the believers.',
    icon: '🕌',
    bg: 'bg-gradient-to-r from-lime-600 to-green-600',
    border: 'border-lime-500',
    text: 'text-white',
    subTextColor: 'text-lime-100',
    closeColor: 'text-lime-200 hover:text-white hover:bg-lime-700',
  },
};

// Dismiss key encodes the theme + today's date so it re-shows the next day/event
function getDismissKey(theme: SeasonalTheme): string {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `seasonal-banner-dismissed:${theme}:${today}`;
}

interface SeasonalBannerProps {
  theme: SeasonalTheme;
}

export function SeasonalBanner({ theme }: SeasonalBannerProps) {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

  useEffect(() => {
    if (theme === 'none') return;
    const key = getDismissKey(theme);
    const alreadyDismissed = localStorage.getItem(key) === '1';
    setDismissed(alreadyDismissed);
  }, [theme]);

  if (theme === 'none' || dismissed) return null;

  const config = BANNER_CONFIG[theme];

  const handleDismiss = () => {
    localStorage.setItem(getDismissKey(theme), '1');
    setDismissed(true);
  };

  return (
    <div
      role="banner"
      aria-label={config.englishGreeting}
      className={cn(
        'relative w-full z-[100] px-4 py-3 md:py-3.5',
        config.bg,
      )}
    >
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        {/* Icon */}
        <span className="text-xl md:text-2xl shrink-0 select-none" aria-hidden="true">
          {config.icon}
        </span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className={cn('font-arabic text-base md:text-lg font-bold leading-snug', config.text)}>
              {config.arabicGreeting}
            </span>
            <span className={cn('text-sm md:text-base font-semibold', config.text)}>
              — {config.englishGreeting}
            </span>
          </div>
          <p className={cn('text-xs md:text-sm mt-0.5 leading-snug', config.subTextColor)}>
            {config.subtext}
          </p>
        </div>

        {/* Dismiss */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className={cn(
            'shrink-0 p-1.5 rounded-full transition-colors',
            config.closeColor
          )}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
