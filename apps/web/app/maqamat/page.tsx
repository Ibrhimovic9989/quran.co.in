'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, RotateCcw, GaugeCircle, AudioLines, Mic, Square } from 'lucide-react';
import { MAQAM_LESSONS, lessonAudioUrl, type MaqamLesson } from '@/lib/data/maqam-lessons';
import { MAQAMAT } from '@/lib/data/maqamat';
import { MaqamRibbon } from '@/components/quran/maqam-ribbon';
import { startPitchCapture, shapeMatch, pitchToLevel } from '@/lib/audio/pitch';

type View = { t: 'hub' } | { t: 'lesson'; i: number } | { t: 'compare' };

function feedbackFor(score: number): string {
  if (score >= 75) return 'Beautiful — your voice followed the shape. Try it once more, a little slower and fuller.';
  if (score >= 55) return 'Good — you’re getting the journey. Watch where the line climbs and where it settles home.';
  if (score >= 35) return 'A start. Listen once more, then let your voice rise and fall with the line.';
  return 'Keep going — press Listen, hum along with the shape, then try again. Recite the whole sūrah for the best trace.';
}

export default function MaqamatPage() {
  const [view, setView] = useState<View>({ t: 'hub' });
  return (
    <main className="min-h-screen bg-paper pb-24 pt-8 md:pt-12">
      <div className="mx-auto max-w-3xl px-4">
        {view.t === 'hub' && <Hub onOpen={(i) => setView({ t: 'lesson', i })} onCompare={() => setView({ t: 'compare' })} />}
        {view.t === 'lesson' && <Lesson lesson={MAQAM_LESSONS[view.i]} onBack={() => setView({ t: 'hub' })} />}
        {view.t === 'compare' && <Compare onBack={() => setView({ t: 'hub' })} onOpen={(i) => setView({ t: 'lesson', i })} />}
      </div>
    </main>
  );
}

function Hub({ onOpen, onCompare }: { onOpen: (i: number) => void; onCompare: () => void }) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-widest text-gold-text">The melodies of recitation</p>
      <h1 className="mt-2 font-reading text-3xl font-bold text-ink md:text-4xl">Maqāmāt</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
        Maqāmāt are the melodies of recitation. Every reciter moves the voice through three levels — and
        each maqām is a different path through them. Here you don’t just listen; you learn the shape.
      </p>

      <div className="mt-6 rounded-2xl bg-accent-soft/40 p-5">
        <h2 className="font-bold text-ink">The three registers</h2>
        <dl className="mt-3 space-y-2 text-sm">
          {[
            ['High', 'The peak — reaching out, the emotional climax.'],
            ['Middle', 'Rising — the voice answers and builds.'],
            ['Low', 'Home — calm and grounded. Recitation starts and ends here.'],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className="w-16 shrink-0 font-semibold text-accent">{k}</dt>
              <dd className="text-ink-muted">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">
          A maqām climbs low → high, then resolves home. Its scale and path give it its feeling.
        </p>
      </div>

      <p className="mt-8 text-xs font-bold uppercase tracking-widest text-gold-text">Lessons</p>
      <p className="mt-1 text-sm text-ink-muted">Each teaches one maqām on Sūrah Al-Fātiḥah — watch the shape, hear a master recite it.</p>
      <div className="mt-4 space-y-4">
        {MAQAM_LESSONS.map((l, i) => (
          <button key={l.maqam} onClick={() => onOpen(i)}
            className="block w-full rounded-2xl border border-line bg-surface p-4 text-left shadow-card transition-colors hover:border-accent/40">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-bold text-ink">{l.maqam}</div>
                <div className="text-xs font-semibold text-accent">{l.mood}</div>
              </div>
              <span className="font-arabic text-2xl text-gold-text" dir="rtl">{l.arabic}</span>
            </div>
            <div className="mt-3"><MaqamRibbon phrases={l.phrases} height={96} /></div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-sm text-ink-muted line-clamp-2">{l.shape}</p>
              <span className="shrink-0 text-sm font-semibold text-accent">Start →</span>
            </div>
          </button>
        ))}
      </div>

      <button onClick={onCompare}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-accent py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent-soft/40">
        See the shapes side by side
      </button>

      <p className="mt-10 text-xs font-bold uppercase tracking-widest text-gold-text">All eight modes</p>
      <p className="mt-1 text-sm text-ink-muted">The full teaching canon. More guided lessons coming.</p>
      <ul className="mt-3 space-y-3">
        {MAQAMAT.map((m) => (
          <li key={m.name} className="flex gap-3">
            <span className="w-24 shrink-0 font-semibold text-ink">{m.name}</span>
            <div className="flex-1">
              <div className="text-xs font-semibold text-accent">{m.mood}</div>
              <p className="text-[13px] leading-snug text-ink-muted">{m.character}</p>
            </div>
            <span className="font-arabic text-lg text-gold-text" dir="rtl">{m.arabic}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function Lesson({ lesson, onBack }: { lesson: MaqamLesson; onBack: () => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const idxRef = useRef(0);
  const [active, setActive] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [slow, setSlow] = useState(false);

  // "Your turn" mic practice.
  const stopMicRef = useRef<(() => void) | null>(null);
  const samplesRef = useRef<number[]>([]);
  const [userLevels, setUserLevels] = useState<number[]>([]);
  const [recording, setRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  useEffect(() => () => { audioRef.current?.pause(); stopMicRef.current?.(); }, []);

  const startRecording = async () => {
    audioRef.current?.pause();
    setPlaying(false);
    setMicError(null);
    setScore(null);
    samplesRef.current = [];
    setUserLevels([]);
    try {
      const stop = await startPitchCapture((hz) => {
        if (hz == null) return;
        samplesRef.current.push(hz);
        setUserLevels((prev) => [...prev, pitchToLevel(hz)]);
      });
      stopMicRef.current = stop;
      setRecording(true);
    } catch {
      setMicError('Microphone access is needed for “Your turn”. Please allow it and try again.');
    }
  };

  const stopRecording = () => {
    stopMicRef.current?.();
    stopMicRef.current = null;
    setRecording(false);
    setScore(shapeMatch(samplesRef.current, lesson.phrases.map((p) => p.pitch)));
  };

  const playFrom = (i: number) => {
    const a = (audioRef.current ??= new Audio());
    idxRef.current = i;
    setActive(i);
    a.src = lessonAudioUrl(lesson, i);
    a.playbackRate = slow ? 0.75 : 1;
    a.onended = () => {
      const ni = idxRef.current + 1;
      if (ni < lesson.phrases.length) playFrom(ni);
      else { setPlaying(false); setActive(-1); }
    };
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };

  const toggle = () => {
    const a = audioRef.current;
    if (playing) { a?.pause(); setPlaying(false); return; }
    if (active < 0 || !a) playFrom(0);
    else { a.play(); setPlaying(true); }
  };
  const restart = () => playFrom(0);
  const setSpeed = () => {
    setSlow((s) => { const ns = !s; if (audioRef.current) audioRef.current.playbackRate = ns ? 0.75 : 1; return ns; });
  };

  const show = active >= 0 ? active : 0;
  const phrase = lesson.phrases[show];

  return (
    <>
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Maqāmāt
      </button>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-ink">{lesson.maqam}</h1>
        <span className="font-arabic text-2xl text-gold-text" dir="rtl">{lesson.arabic}</span>
      </div>
      <p className="mt-1 text-sm font-semibold text-accent">{lesson.mood}</p>
      <p className="mt-2 leading-relaxed text-ink-soft">{lesson.shape}</p>

      <div className="mt-5">
        <MaqamRibbon
          phrases={lesson.phrases}
          activeIndex={active}
          userContour={userLevels.length > 1 ? userLevels : undefined}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-gold-text">Phrase {show + 1} / {lesson.phrases.length}</div>
        <p className="mt-3 text-right font-arabic text-3xl leading-[1.9] text-ink" dir="rtl">{phrase.arabic}</p>
        <p className="mt-1 text-sm italic text-ink-muted">{phrase.translit}</p>
        <div className="mt-4 flex items-start gap-2.5">
          <AudioLines className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <p className="font-medium text-ink">{phrase.cue}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2.5">
        <button onClick={toggle}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent py-3.5 font-semibold text-white transition-colors hover:bg-accent/90">
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {playing ? 'Pause' : 'Listen'}
        </button>
        <button onClick={setSpeed}
          className={`flex items-center gap-1.5 rounded-full border px-4 py-3 text-sm font-semibold transition-colors ${slow ? 'border-accent text-accent' : 'border-line text-ink-muted hover:text-ink'}`}>
          <GaugeCircle className="h-4 w-4" /> {slow ? '0.75×' : '1×'}
        </button>
        <button onClick={restart}
          className="flex items-center gap-1.5 rounded-full border border-line px-4 py-3 text-sm font-semibold text-ink-muted transition-colors hover:text-ink">
          <RotateCcw className="h-4 w-4" /> Restart
        </button>
      </div>

      {/* Your turn */}
      <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-ink">Your turn</div>
            <div className="text-xs text-ink-muted">Recite Al-Fātiḥah — follow the shape. We’ll trace your melody.</div>
          </div>
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-colors ${recording ? 'bg-red-600 hover:bg-red-700' : 'bg-accent hover:bg-accent/90'}`}
          >
            {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {recording ? 'Stop' : 'Your turn'}
          </button>
        </div>
        {recording && (
          <div className="mt-3 flex items-center gap-2 text-xs text-accent">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-600" /> Listening… recite now, watch your line.
          </div>
        )}
        {micError && <p className="mt-3 text-xs text-red-600">{micError}</p>}
        {score != null && !recording && (
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-ink">{score}%</span>
              <span className="text-sm font-semibold text-accent">shape match</span>
            </div>
            <p className="mt-1 text-sm text-ink-muted">{feedbackFor(score)}</p>
          </div>
        )}
      </div>

      <Link href={`/quran/1?ayah=${show + 1}`} className="mt-4 inline-block text-sm font-semibold text-accent hover:underline">
        Read Al-Fātiḥah in context →
      </Link>
      <p className="mt-4 text-xs leading-relaxed text-ink-muted">
        The shape is a teaching guide — reciters express each maqām differently. Tajwīd always comes first;
        the melody is beauty layered on top.
      </p>
    </>
  );
}

function Compare({ onBack, onOpen }: { onBack: () => void; onOpen: (i: number) => void }) {
  return (
    <>
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Maqāmāt
      </button>
      <h1 className="text-2xl font-bold text-ink">Compare the shapes</h1>
      <p className="mt-2 leading-relaxed text-ink-soft">
        The same sūrah — four different journeys. Notice where each one climbs, lingers and resolves.
        Click any shape to learn it.
      </p>
      <div className="mt-6 space-y-6">
        {MAQAM_LESSONS.map((l, i) => (
          <button key={l.maqam} onClick={() => onOpen(i)} className="block w-full text-left">
            <div className="mb-2 flex items-center gap-2">
              <span className="font-bold text-ink">{l.maqam}</span>
              <span className="font-arabic text-lg text-gold-text" dir="rtl">{l.arabic}</span>
              <span className="ml-auto text-xs font-semibold text-accent">{l.mood.split(' · ')[0]}</span>
            </div>
            <MaqamRibbon phrases={l.phrases} height={120} />
          </button>
        ))}
      </div>
    </>
  );
}
