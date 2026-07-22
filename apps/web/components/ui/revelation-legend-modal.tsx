'use client';

import { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import { PERIOD_LABELS, PERIOD_COLORS, PERIOD_DESCRIPTIONS, APPROXIMATION_NOTE } from '@/lib/data/revelation-periods';
import type { RevelationPeriod } from '@/lib/data/revelation-periods';
import { cn } from '@/lib/utils/cn';

const PERIODS: RevelationPeriod[] = ['early-meccan', 'middle-meccan', 'late-meccan', 'madinan'];

export function RevelationLegendModal({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors',
          className
        )}
        aria-label="Learn about revelation periods"
      >
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span>What are these periods?</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9990] flex flex-col justify-end md:items-center md:justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          {/* Sheet / Modal */}
          <div className={cn(
            // Mobile: full-width bottom sheet with rounded top corners
            'w-full bg-white rounded-t-3xl shadow-2xl',
            // Desktop: centered card
            'md:rounded-2xl md:max-w-lg md:w-full md:mx-4',
            // Animate up on mobile
            'animate-in slide-in-from-bottom-4 duration-300 md:animate-in md:fade-in md:zoom-in-95 md:duration-200'
          )}>
            {/* Drag handle (mobile only) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Revelation Periods</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 -mr-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body — scrollable, safe area aware */}
            <div className="px-5 py-4 space-y-5 overflow-y-auto max-h-[70vh] pb-safe">
              <p className="text-sm text-gray-600 leading-relaxed">
                The Quran was revealed over{' '}
                <span className="font-semibold text-gray-800">23 years</span> (610–632 CE).
                Scholars grouped surahs into four periods based on when and where they were revealed:
              </p>

              {PERIODS.map((period) => {
                const full = PERIOD_DESCRIPTIONS[period];
                const colonIdx = full.indexOf(': ');
                const header = full.slice(0, colonIdx);
                const body = full.slice(colonIdx + 2);

                return (
                  <div key={period} className="flex gap-3">
                    {/* Badge */}
                    <div className="mt-0.5 shrink-0">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold whitespace-nowrap',
                        PERIOD_COLORS[period].badge
                      )}>
                        <span className={cn('w-2 h-2 rounded-full', PERIOD_COLORS[period].dot)} />
                        {PERIOD_LABELS[period]}
                      </span>
                    </div>
                    {/* Text */}
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-gray-400 mb-1 leading-none">{header}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{body}</p>
                    </div>
                  </div>
                );
              })}

              {/* Approximation note */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <span className="font-semibold text-gray-600">* About the years:</span>{' '}
                  {APPROXIMATION_NOTE}
                </p>
              </div>

              {/* Bottom safe-area spacer on mobile */}
              <div className="h-2 md:h-0" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
