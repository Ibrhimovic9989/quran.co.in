// Reading Progress Utility
// Tracks surah visits, sessions, and milestones — localStorage only, no backend
// Works for guests and authenticated users alike

export interface ReadingSession {
  surahNo: number;
  surahName: string;
  date: string; // 'YYYY-MM-DD'
}

export interface ReadingProgress {
  sessions: ReadingSession[];
  totalSessions: number;
  lastMilestoneShown: number;
}

const STORAGE_KEY = 'quran-reading-progress';
const MAX_SESSIONS = 200;

const MILESTONES: { count: number; message: string }[] = [
  { count: 1,   message: "You've opened your first session — may Allah bless your journey with the Quran." },
  { count: 5,   message: "Five sessions completed. May Allah make the Quran a companion for your heart." },
  { count: 10,  message: "You've completed 10 sessions — may Allah make the Quran the spring of your heart." },
  { count: 25,  message: "25 sessions of reading. May Allah write you among the people of the Quran." },
  { count: 50,  message: "50 sessions — a beautiful commitment. May every letter be a light for you." },
  { count: 100, message: "100 sessions with the Quran. SubhanAllah. May Allah accept it all from you." },
];

function getReadingProgress(): ReadingProgress {
  if (typeof window === 'undefined') return { sessions: [], totalSessions: 0, lastMilestoneShown: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sessions: [], totalSessions: 0, lastMilestoneShown: 0 };
    return JSON.parse(raw) as ReadingProgress;
  } catch {
    return { sessions: [], totalSessions: 0, lastMilestoneShown: 0 };
  }
}

function saveReadingProgress(progress: ReadingProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // storage quota exceeded — silently ignore
  }
}

/**
 * Records a surah visit. Deduped: only one session per surah per calendar day.
 * Returns the milestone message to show (caller fires the toast), or null.
 */
export function recordSurahVisit(surahNo: number, surahName: string): string | null {
  if (typeof window === 'undefined') return null;
  const progress = getReadingProgress();
  const today = new Date().toISOString().slice(0, 10);

  const alreadyToday = progress.sessions.some(
    (s) => s.surahNo === surahNo && s.date === today
  );
  if (alreadyToday) return null;

  const newSession: ReadingSession = { surahNo, surahName, date: today };
  const newSessions = [...progress.sessions, newSession].slice(-MAX_SESSIONS);
  const newTotal = progress.totalSessions + 1;

  const nextMilestone = MILESTONES.find(
    (m) => m.count > progress.lastMilestoneShown && m.count <= newTotal
  );
  const newLastMilestone = nextMilestone ? nextMilestone.count : progress.lastMilestoneShown;

  saveReadingProgress({
    sessions: newSessions,
    totalSessions: newTotal,
    lastMilestoneShown: newLastMilestone,
  });

  return nextMilestone?.message ?? null;
}

/**
 * Unique surahs visited in the past 7 calendar days.
 */
export function getWeeklySurahs(): ReadingSession[] {
  const progress = getReadingProgress();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const seen = new Set<number>();
  return progress.sessions
    .filter((s) => s.date >= cutoffStr)
    .filter((s) => {
      if (seen.has(s.surahNo)) return false;
      seen.add(s.surahNo);
      return true;
    });
}

/**
 * Most recently visited surah.
 */
export function getLastReadSurah(): ReadingSession | null {
  const progress = getReadingProgress();
  if (progress.sessions.length === 0) return null;
  return progress.sessions[progress.sessions.length - 1];
}

export function getTotalSessions(): number {
  return getReadingProgress().totalSessions;
}
