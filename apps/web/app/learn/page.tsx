'use client';

// Learn to Read — the Noorani-Qāʿidah arc for readers coming from
// transliteration. Hub → lesson, mirrors the mobile module. Honest framing:
// transliteration is scaffolding to shed. Progress is local (localStorage),
// deliberately gentle — lessons completed, no streak.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, GraduationCap,
  Volume2, Lightbulb, BookOpen, X, Hand, AudioLines,
} from 'lucide-react';
import {
  LEARN_LESSONS, LETTERS, formsOf, letterAudioUrl, ayahAudioUrl,
  LETTER_AUDIO_READY, LETTER_AUDIO_CREDITS,
  type LearnLesson, type LearnToken, type QLetter,
} from '@/lib/data/learn-lessons';

const PROGRESS_KEY = 'quran-learn-done';
const STAGES: [string, number, number][] = [
  ['The Letters', 1, 3],
  ['Vowels & Sounds', 4, 9],
  ['Rests & Doubling', 10, 15],
  ['Reading the Qurʾān', 16, 17],
];

type View = { t: 'hub' } | { t: 'lesson'; i: number };

export default function LearnPage() {
  const [view, setView] = useState<View>({ t: 'hub' });
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) setDone(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((next: Set<string>) => {
    setDone(new Set(next));
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback((slug: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (!next.delete(slug)) next.add(slug);
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const markDone = useCallback((slug: string) => {
    setDone((prev) => {
      if (prev.has(slug)) return prev;
      const next = new Set(prev).add(slug);
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <main className="min-h-screen bg-paper pb-24 pt-8 md:pt-12">
      <div className="mx-auto max-w-3xl px-4">
        {view.t === 'hub' && <Hub done={done} onOpen={(i) => setView({ t: 'lesson', i })} />}
        {view.t === 'lesson' && (
          <Lesson
            index={view.i}
            done={done}
            onToggle={toggle}
            onMarkDone={markDone}
            onBack={() => setView({ t: 'hub' })}
            onGo={(i) => setView({ t: 'lesson', i })}
          />
        )}
      </div>
    </main>
  );
}

// ── Hub ──────────────────────────────────────────────────────────────────────
function Hub({ done, onOpen }: { done: Set<string>; onOpen: (i: number) => void }) {
  const count = LEARN_LESSONS.filter((l) => done.has(l.slug)).length;
  const pct = Math.round((count / LEARN_LESSONS.length) * 100);
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-widest text-gold-text">From transliteration to the script</p>
      <h1 className="mt-2 flex items-center gap-3 font-reading text-3xl font-bold text-ink md:text-4xl">
        <GraduationCap className="text-accent" size={30} /> Learn to Read
      </h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
        If you read the Qurʾān through English letters, this is the way off them. Step by step — the letters, their
        sounds, the vowels — until you read the script itself. Transliteration got you here; these lessons help you
        leave it behind.
      </p>

      <div className="mt-6 rounded-2xl bg-accent-soft/40 p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-extrabold text-ink">{count}</span>
            <span className="text-sm text-ink-muted"> / {LEARN_LESSONS.length} lessons</span>
          </div>
          {count > 0 && <span className="text-sm font-bold text-accent">{pct}%</span>}
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {STAGES.map(([label, from, to]) => (
        <div key={label} className="mt-8">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-text">{label}</p>
          <div className="mt-3 space-y-3">
            {LEARN_LESSONS.slice(from - 1, to).map((l) => {
              const i = l.number - 1;
              const isDone = done.has(l.slug);
              return (
                <button
                  key={l.slug}
                  onClick={() => onOpen(i)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-line bg-surface p-4 text-left shadow-card transition-colors hover:border-accent/40"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      isDone ? 'bg-accent text-white' : 'bg-accent-soft text-accent'
                    }`}
                  >
                    {isDone ? <Check size={20} /> : l.number}
                  </span>
                  <span className="flex-1">
                    <span className="block font-bold text-ink">{l.title}</span>
                    <span className="block font-arabic text-lg text-ink-muted" dir="rtl">{l.titleAr}</span>
                  </span>
                  <ChevronRight className="text-ink-muted" size={20} />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="mt-8 text-xs leading-relaxed text-ink-muted">
        Tajwīd always comes first — beautiful recitation is layered on top of correct reading.{' '}
        {LETTER_AUDIO_READY
          ? `Letter audio courtesy of ${LETTER_AUDIO_CREDITS.join(', ')}.`
          : 'Spoken audio for each letter is on the way.'}
      </p>
    </>
  );
}

// ── Lesson ───────────────────────────────────────────────────────────────────
function Lesson({
  index, done, onToggle, onMarkDone, onBack, onGo,
}: {
  index: number;
  done: Set<string>;
  onToggle: (slug: string) => void;
  onMarkDone: (slug: string) => void;
  onBack: () => void;
  onGo: (i: number) => void;
}) {
  const l = LEARN_LESSONS[index];
  const [letter, setLetter] = useState<QLetter | null>(null);
  const [token, setToken] = useState<LearnToken | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isLetters = l.kind === 'letters' || l.kind === 'forms';
  const isDone = done.has(l.slug);

  useEffect(() => {
    setLetter(null);
    setToken(null);
  }, [index]);

  const play = useCallback((ref: string) => {
    try {
      if (!audioRef.current) audioRef.current = new Audio();
      audioRef.current.src = ayahAudioUrl(ref);
      void audioRef.current.play();
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={16} /> All lessons
      </button>

      <p className="text-xs font-bold uppercase tracking-widest text-gold-text">Lesson {l.number} / 17</p>
      <h1 className="mt-1 flex flex-wrap items-baseline gap-3">
        <span className="font-reading text-2xl font-bold text-ink md:text-3xl">{l.title}</span>
        <span className="font-arabic text-xl text-gold-text" dir="rtl">{l.titleAr}</span>
      </h1>

      <div className="mt-5 rounded-2xl bg-accent-soft/40 p-5">
        <p className="leading-relaxed text-ink-soft">{l.teach}</p>
        {l.tip && (
          <p className="mt-3 flex gap-2 text-sm font-medium text-ink-muted">
            <Lightbulb className="mt-0.5 shrink-0 text-gold-text" size={18} />
            <span>{l.tip}</span>
          </p>
        )}
      </div>

      {isLetters && l.letters.length > 0 && (
        <section className="mt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-text">
            {l.kind === 'letters' ? 'Tap a letter to learn it' : 'Tap to see its forms'}
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2.5 sm:grid-cols-6">
            {l.letters.map((li) => (
              <button
                key={li}
                onClick={() => setLetter(LETTERS[li])}
                className="flex flex-col items-center rounded-xl border border-line bg-surface py-3 transition-colors hover:border-accent/40"
              >
                <span className="font-arabic text-3xl leading-none text-ink" dir="rtl">{LETTERS[li].glyph}</span>
                <span className="mt-1.5 text-[11px] font-medium text-ink-muted">{LETTERS[li].name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {l.rows.length > 0 && (
        <section className="mt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-text">
            {isLetters ? 'Then read these' : 'Read across'}
          </p>
          <div className="mt-3 space-y-3">
            {l.rows.map((r, ri) => (
              <div key={ri} className="flex flex-wrap justify-center gap-2.5" dir="rtl">
                {r.tokens.map((tk, ti) => (
                  <button
                    key={ti}
                    onClick={() => setToken(tk)}
                    className="min-w-[72px] rounded-xl border border-line bg-surface px-3.5 py-2.5 transition-colors hover:border-accent/40"
                  >
                    <span className="block font-arabic text-3xl leading-relaxed text-ink" dir="rtl">{tk.ar}</span>
                    <span className="mt-0.5 block text-xs italic text-ink-muted" dir="ltr">{tk.translit}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {l.contrasts.length > 0 && (
        <section className="mt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-text">Tell them apart</p>
          <div className="mt-3 space-y-2">
            {l.contrasts.map((c, ci) => (
              <div key={ci} className="flex items-center gap-3">
                <span className="font-arabic text-2xl text-ink" dir="rtl">{c.a}</span>
                <span className="text-xs text-ink-muted">vs</span>
                <span className="font-arabic text-2xl text-ink" dir="rtl">{c.b}</span>
                <span className="flex-1 text-sm text-ink-muted">{c.note}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {l.bridge && (
        <section className="mt-6 rounded-2xl border border-gold/50 bg-surface p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-text">From the Qurʾān</p>
          <p className="mt-3 text-center font-arabic text-3xl leading-loose text-ink" dir="rtl">{l.bridge.word}</p>
          <p className="mt-1 text-center text-sm italic text-ink-muted">{l.bridge.translit}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink">{l.bridge.note}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => play(l.bridge!.ref)}
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-accent hover:bg-accent-soft/40"
            >
              <Volume2 size={16} /> Hear it
            </button>
            <Link
              href={`/quran/${l.bridge.ref.split(':')[0]}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90"
            >
              <BookOpen size={16} /> Read in the muṣḥaf
            </Link>
          </div>
        </section>
      )}

      <button
        onClick={() => onToggle(l.slug)}
        className={`mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-accent py-3 font-semibold transition-colors ${
          isDone ? 'bg-accent text-white' : 'bg-surface text-accent hover:bg-accent-soft/40'
        }`}
      >
        {isDone ? <CheckCircle2 size={20} /> : <Check size={20} />}
        {isDone ? 'Completed' : 'Mark as complete'}
      </button>

      <div className="mt-4 flex items-center justify-between">
        {index > 0 ? (
          <button onClick={() => onGo(index - 1)} className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
            <ArrowLeft size={16} /> Lesson {l.number - 1}
          </button>
        ) : (
          <span />
        )}
        {index < LEARN_LESSONS.length - 1 && (
          <button
            onClick={() => {
              onMarkDone(l.slug);
              onGo(index + 1);
            }}
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            Next: {LEARN_LESSONS[index + 1].title} <ArrowRight size={16} />
          </button>
        )}
      </div>

      {letter && <LetterSheet letter={letter} onClose={() => setLetter(null)} />}
      {token && <TokenSheet token={token} onClose={() => setToken(null)} onPlay={play} />}
    </>
  );
}

// ── Letter detail sheet ──────────────────────────────────────────────────────
function LetterSheet({ letter: l, onClose }: { letter: QLetter; onClose: () => void }) {
  const forms = useMemo(() => formsOf(l.glyph), [l.glyph]);
  const chips: [string, string][] = [
    [l.region, 'bg-accent-soft text-accent'],
    ...(l.heavy ? ([['Heavy', 'bg-amber-100 text-amber-800']] as [string, string][]) : []),
    ...(l.qalqalah ? ([['Qalqalah', 'bg-red-100 text-red-700']] as [string, string][]) : []),
    [l.sun ? 'Sun letter' : 'Moon letter', 'bg-gold/15 text-gold-text'],
  ];
  const formCells: [string, string, boolean][] = [
    ['Isolated', forms.isolated, true],
    ['Initial', forms.initial, l.connects],
    ['Medial', forms.medial, true],
    ['Final', forms.end, true],
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-paper p-6 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="font-arabic text-6xl leading-none text-ink" dir="rtl">{l.glyph}</span>
            <div>
              <p className="text-lg font-bold text-ink">{l.name} · “{l.sound}”</p>
              <p className="font-arabic text-xl text-ink-muted" dir="rtl">{l.nameAr}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-ink-muted hover:bg-line/50"><X size={20} /></button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map(([label, cls]) => (
            <span key={label} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>{label}</span>
          ))}
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-widest text-gold-text">How to say it</p>
        <p className="mt-1.5 leading-relaxed text-ink-soft">{l.makhraj}</p>
        <p className="mt-2 flex gap-2 text-sm italic text-ink-muted">
          <Hand className="mt-0.5 shrink-0 text-accent" size={16} /> <span>{l.tip}</span>
        </p>

        <p className="mt-6 text-xs font-bold uppercase tracking-widest text-gold-text">Its four forms</p>
        <p className="mt-1 text-sm text-ink-muted">
          {l.connects ? 'How it looks at the start, middle and end of a word.' : `${l.name} never joins to its left — its start looks like its isolated form.`}
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {formCells.map(([label, glyph, available]) => (
            <div key={label} className="flex flex-col items-center">
              <div className={`flex h-16 w-full items-center justify-center rounded-xl border border-line ${available ? 'bg-accent-soft/30' : 'bg-line/20'}`}>
                <span className="font-arabic text-3xl text-ink" dir="rtl">{glyph}</span>
              </div>
              <span className="mt-1 text-[11px] text-ink-muted">{label}</span>
            </div>
          ))}
        </div>

        {letterAudioUrl(l) ? (
          <button
            onClick={() => {
              try {
                new Audio(letterAudioUrl(l)!).play();
              } catch {
                /* ignore */
              }
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90"
          >
            <Volume2 size={18} /> Hear {l.name}
          </button>
        ) : (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-gold/10 p-3 text-sm text-ink-muted">
            <AudioLines className="shrink-0 text-gold-text" size={18} />
            Spoken pronunciation for each letter is coming soon.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Token (word) sheet ───────────────────────────────────────────────────────
function TokenSheet({ token, onClose, onPlay }: { token: LearnToken; onClose: () => void; onPlay: (ref: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-t-3xl bg-paper p-6 text-center shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-arabic text-5xl leading-loose text-ink" dir="rtl">{token.ar}</p>
        <p className="mt-1 text-base font-semibold text-accent">{token.translit}</p>
        {token.spell && (
          <>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-gold-text">Spell it out</p>
            <p className="mt-1 font-arabic text-lg text-ink-muted" dir="rtl">{token.spell}</p>
          </>
        )}
        {token.audioRef && (
          <button
            onClick={() => onPlay(token.audioRef!)}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90"
          >
            <Volume2 size={18} /> Hear it recited
          </button>
        )}
      </div>
    </div>
  );
}
