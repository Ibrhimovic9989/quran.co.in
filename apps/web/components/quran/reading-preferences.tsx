"use client";

import { createContext, useContext, useEffect, useState } from 'react';

export const translationLabels = {
  english: 'English', bengali: 'Bengali', urdu: 'Urdu', turkish: 'Turkish', uzbek: 'Uzbek',
};
export type TranslationLanguage = keyof typeof translationLabels;
type Preferences = {
  translation: TranslationLanguage | 'none';
  pronunciation: boolean;
  arabicSize: 'regular' | 'large' | 'larger';
  autoScroll: boolean;
};
const defaults: Preferences = {
  translation: 'english', pronunciation: false, arabicSize: 'regular', autoScroll: true,
};
const KEY = 'quran-reading-preferences-v1';
const Context = createContext<{
  preferences: Preferences;
  update: (patch: Partial<Preferences>) => void;
} | null>(null);

export function ReadingPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState(defaults);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
      setPreferences({
        translation: saved.translation === 'none' || Object.hasOwn(translationLabels, saved.translation) ? saved.translation : 'english',
        pronunciation: typeof saved.pronunciation === 'boolean' ? saved.pronunciation : localStorage.getItem('quran-show-transliteration') === 'true',
        arabicSize: ['regular', 'large', 'larger'].includes(saved.arabicSize) ? saved.arabicSize : 'regular',
        autoScroll: typeof saved.autoScroll === 'boolean' ? saved.autoScroll : true,
      });
    } catch { /* A blocked or damaged store must not prevent reading. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(preferences)); } catch { /* Keep session preferences. */ }
  }, [preferences, ready]);
  return <Context.Provider value={{ preferences, update: patch => setPreferences(current => ({ ...current, ...patch })) }}>{children}</Context.Provider>;
}

export function useReadingPreferences() { return useContext(Context); }

export function ReadingPreferenceControls({ languages }: { languages: TranslationLanguage[] }) {
  const context = useReadingPreferences();
  if (!context) return null;
  const { preferences, update } = context;
  return <fieldset className="space-y-4">
    <legend className="mb-3 text-sm font-semibold text-ink">Text preferences</legend>
    <label className="block text-xs font-medium text-ink-soft">
      Translation
      <select className="mt-2 min-h-11 w-full rounded-lg border border-line bg-surface px-3 text-base text-ink" value={preferences.translation} onChange={event => update({ translation: event.target.value as Preferences['translation'] })}>
        <option value="none">Arabic only</option>
        {Object.entries(translationLabels).map(([value, label]) => <option key={value} value={value} disabled={!languages.includes(value as TranslationLanguage)}>{label}{!languages.includes(value as TranslationLanguage) ? ' — unavailable here' : ''}</option>)}
      </select>
    </label>
    <label className="flex min-h-11 items-center justify-between gap-4 text-sm text-ink-soft">
      <span>Show pronunciation<small className="mt-1 block text-xs text-muted">Arabic sounds in Latin letters</small></span>
      <input type="checkbox" checked={preferences.pronunciation} onChange={event => update({ pronunciation: event.target.checked })} className="h-5 w-5 shrink-0 accent-[var(--accent)]" />
    </label>
    <label className="block text-xs font-medium text-ink-soft">
      Arabic text size
      <select className="mt-2 min-h-11 w-full rounded-lg border border-line bg-surface px-3 text-base text-ink" value={preferences.arabicSize} onChange={event => update({ arabicSize: event.target.value as Preferences['arabicSize'] })}>
        <option value="regular">Regular</option><option value="large">Large</option><option value="larger">Extra large</option>
      </select>
    </label>
    <label className="flex min-h-11 items-center justify-between gap-4 text-sm text-ink-soft">
      Follow the recitation
      <input type="checkbox" checked={preferences.autoScroll} onChange={event => update({ autoScroll: event.target.checked })} className="h-5 w-5 shrink-0 accent-[var(--accent)]" />
    </label>
    <p className="text-xs leading-relaxed text-muted">Saved on this device for every chapter. Text preferences apply to the Verses view.</p>
  </fieldset>;
}
