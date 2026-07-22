// Reading-theme toggle: Paper → Sepia → Night.
// Stored on <html data-theme> + localStorage; an inline script in layout.tsx
// applies it pre-paint to avoid a flash.

'use client';

import { useEffect, useState } from 'react';
import { Sun, Sunset, Moon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type ReadingTheme = 'light' | 'sepia' | 'night';
const STORAGE_KEY = 'quran-theme';
const ORDER: ReadingTheme[] = ['light', 'sepia', 'night'];

const META: Record<ReadingTheme, { icon: typeof Sun; label: string }> = {
  light: { icon: Sun, label: 'Paper theme' },
  sepia: { icon: Sunset, label: 'Sepia theme' },
  night: { icon: Moon, label: 'Night theme' },
};

export function applyTheme(theme: ReadingTheme) {
  if (theme === 'light') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage unavailable — theme just won't persist
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<ReadingTheme>('light');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ReadingTheme | null;
      if (stored && ORDER.includes(stored)) setTheme(stored);
    } catch {
      // ignore
    }
  }, []);

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    setTheme(next);
    applyTheme(next);
  };

  const { icon: Icon, label } = META[theme];

  return (
    <button
      onClick={cycle}
      aria-label={`${label} — click to switch`}
      title={label}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-accent-soft/60 hover:text-ink',
        className,
      )}
    >
      <Icon size={18} strokeWidth={2} aria-hidden />
    </button>
  );
}
