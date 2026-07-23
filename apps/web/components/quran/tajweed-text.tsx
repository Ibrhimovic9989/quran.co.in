'use client';

// Renders an ayah as colored tajwīd spans. Each colored letter is a button that
// opens a "learn the rule" popover. Also exports a legend button. Mirrors the
// mobile TajweedAyah / legend sheet.

import { useState } from 'react';
import { X } from 'lucide-react';
import { TAJWEED_RULES, TAJWEED_LEGEND_ORDER, type TajweedRun } from '@/lib/data/tajweed-rules';

function toArabicNumeral(n: number): string {
  return n.toString().replace(/\d/g, (d) => String.fromCharCode(0x0660 + Number(d)));
}

export function TajweedText({ runs, ayahNo }: { runs: TajweedRun[]; ayahNo: number }) {
  const [activeRule, setActiveRule] = useState<string | null>(null);
  const rule = activeRule ? TAJWEED_RULES[activeRule] : null;

  return (
    <>
      <p
        className="text-right font-arabic text-[1.9rem] leading-[2.1] text-ink md:text-[2.5rem] md:leading-[2.2]"
        dir="rtl"
        lang="ar"
      >
        {runs.map((run, i) => {
          const r = run.r ? TAJWEED_RULES[run.r] : null;
          if (!r) return <span key={i}>{run.t}</span>;
          return (
            <span
              key={i}
              role="button"
              tabIndex={0}
              title={r.name}
              onClick={() => setActiveRule(run.r)}
              onKeyDown={(e) => e.key === 'Enter' && setActiveRule(run.r)}
              style={{ color: r.color, cursor: 'pointer' }}
            >
              {run.t}
            </span>
          );
        })}
        <span className="inline-flex items-center justify-center align-middle mx-1.5">
          <span className="relative inline-flex items-center justify-center w-7 h-7 md:w-9 md:h-9">
            <svg viewBox="0 0 32 32" className="absolute inset-0 w-full h-full" aria-hidden="true">
              <circle cx="16" cy="16" r="14.5" fill="none" stroke="var(--gold)" strokeWidth="1" />
              <circle cx="16" cy="16" r="11" fill="none" stroke="var(--gold)" strokeWidth="0.5" opacity="0.5" />
            </svg>
            <span className="relative font-mushaf text-[10px] md:text-[12px] text-gold-text leading-none select-none">
              {toArabicNumeral(ayahNo)}
            </span>
          </span>
        </span>
      </p>

      {rule && (
        <RuleCard
          swatch={rule.color}
          title={rule.name}
          arabic={rule.arabic}
          how={rule.how}
          onClose={() => setActiveRule(null)}
        />
      )}
    </>
  );
}

function RuleCard({
  swatch, title, arabic, how, onClose,
}: { swatch: string; title: string; arabic: string; how: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 md:items-center md:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl border border-line bg-surface p-6 shadow-card md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 h-8 w-8 shrink-0 rounded-lg" style={{ backgroundColor: swatch }} />
          <div className="flex-1">
            <div className="text-lg font-bold text-ink">{title}</div>
            <div className="font-arabic text-lg text-ink-muted" dir="rtl">{arabic}</div>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-4 leading-relaxed text-ink-soft">{how}</p>
      </div>
    </div>
  );
}

/** Self-contained legend button + modal (shown in the header when tajwīd is on). */
export function TajweedLegendButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Tajwīd colour legend"
        className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-muted transition-colors hover:text-ink"
      >
        Legend
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center md:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-line bg-surface p-6 shadow-card md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-widest text-gold-text">Tajwīd Rules</div>
              <button onClick={() => setOpen(false)} className="text-ink-muted hover:text-ink" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-ink-muted">Tap any colored letter while reading to learn its rule.</p>
            <ul className="space-y-3">
              {TAJWEED_LEGEND_ORDER.filter((k) => TAJWEED_RULES[k]).map((k) => {
                const r = TAJWEED_RULES[k];
                return (
                  <li key={k} className="flex items-start gap-3">
                    <span className="mt-0.5 h-5 w-5 shrink-0 rounded" style={{ backgroundColor: r.color }} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-ink">{r.name}</span>
                        <span className="font-arabic text-sm text-ink-muted" dir="rtl">{r.arabic}</span>
                      </div>
                      <p className="text-[13px] leading-snug text-ink-muted">{r.how}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
