'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2, Search, Circle, Compass, ShieldCheck, HandHeart, RotateCcw, Hourglass, Flower2, HeartHandshake, BadgeCheck, Scale, Wheat, BookOpen, UsersRound, Gift, Sprout, Sunrise, type LucideIcon } from 'lucide-react';
import { QURAN_TOPICS, type QuranTopic } from '@/lib/data/quran-topics';
import { backendUrl } from '@/lib/api/backend';

interface TopicResult {
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translationText: string | null;
  englishName: string;
}
const TOPIC_ICONS: Record<string, LucideIcon> = {
  tawhid: Circle, salah: Compass, tawakkul: ShieldCheck, dua: HandHeart,
  tawbah: RotateCcw, sabr: Hourglass, shukr: Flower2, forgiveness: HeartHandshake,
  sidq: BadgeCheck, justice: Scale, rizq: Wheat, knowledge: BookOpen,
  parents: UsersRound, charity: Gift, jannah: Sprout, akhirah: Sunrise,
};

function TopicIcon({ id }: { id: string }) {
  const Icon = TOPIC_ICONS[id] ?? BookOpen;
  return <Icon aria-hidden="true" size={19} strokeWidth={1.65} className="shrink-0 text-accent-strong" />;
}

export default function TopicsPage() {
  const [active, setActive] = useState<QuranTopic | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TopicResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const request = useRef<AbortController | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => { if (active) backButton.current?.focus(); }, [active]);

  async function loadTopic(topic: QuranTopic) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setActive(topic); setResults([]); setLoading(true); setError(false);
    try {
      const response = await fetch(backendUrl(`/api/search/semantic?q=${encodeURIComponent(topic.query)}&limit=10`), { signal: controller.signal });
      if (!response.ok) throw new Error('Topic unavailable');
      const data = await response.json();
      if (!controller.signal.aborted) setResults(data.results ?? []);
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }
  const filtered = QURAN_TOPICS.filter(topic => `${topic.label} ${topic.arabic} ${topic.description}`.toLowerCase().includes(query.toLowerCase().trim()));
  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
        <h1 ref={heading} tabIndex={-1} className="font-heading text-2xl font-bold tracking-tight text-ink md:text-3xl">Explore topics</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">Find verses about what matters to you.</p>
        {!active ? <>
          <label className="relative mt-5 block">
            <span className="sr-only">Find a topic</span>
            <Search aria-hidden="true" className="absolute left-3 top-3 h-4 w-4 text-muted" />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a topic" className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-sm text-ink" />
          </label>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {filtered.map((topic) => <button key={topic.id} onClick={() => void loadTopic(topic)} className="flex min-h-16 items-center gap-2 rounded-xl border border-line bg-surface p-3 text-left transition-colors hover:border-accent/40">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-soft/60"><TopicIcon id={topic.id} /></span>
              <span className="text-[13px] font-semibold leading-snug text-ink">{topic.label}</span>
            </button>)}
          </div>
          {filtered.length === 0 && <p role="status" className="py-8 text-center text-sm text-muted">No topics match. Try another word.</p>}
        </> : <section className="mt-5">
          <button ref={backButton} onClick={() => { request.current?.abort(); setActive(null); requestAnimationFrame(() => heading.current?.focus()); }} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent-strong"><ArrowLeft size={16} /> All topics</button>
          <div className="mb-4 rounded-xl bg-accent-soft p-4">
            <h2 className="flex items-center gap-2.5 text-lg font-semibold text-ink"><TopicIcon id={active.id} />{active.label}</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{active.description}</p>
          </div>
          <div aria-live="polite">
            {loading && <p role="status" className="flex items-center justify-center gap-2 py-12 text-sm text-muted"><Loader2 size={18} className="animate-spin" /> Finding verses…</p>}
            {error && <div className="rounded-xl border border-line bg-surface p-5 text-sm text-muted"><p>We couldn’t load these verses.</p><button onClick={() => void loadTopic(active)} className="mt-3 min-h-11 font-semibold text-accent-strong">Try again</button></div>}
            {!loading && !error && results.length === 0 && <p className="py-8 text-sm text-muted">No verses found. Try another topic.</p>}
          </div>
          <ul className="space-y-3">
            {results.map(result => <li key={`${result.surahNumber}:${result.ayahNumber}`}>
              <Link href={`/quran/${result.surahNumber}?ayah=${result.ayahNumber}`} className="block rounded-2xl border border-line bg-surface p-4 hover:border-accent/40">
                <div className="flex items-center justify-between gap-3 text-xs font-semibold text-accent-strong"><span>{result.englishName} · {result.surahNumber}:{result.ayahNumber}</span><ArrowRight aria-hidden="true" size={14} /></div>
                <p lang="ar" dir="rtl" className="mt-4 break-words font-arabic text-2xl leading-loose text-ink">{result.arabicText}</p>
                {result.translationText && <p className="mt-3 text-sm leading-relaxed text-ink-soft">{result.translationText}</p>}
              </Link>
            </li>)}
          </ul>
        </section>}
      </div>
    </main>
  );
}
