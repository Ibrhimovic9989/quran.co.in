'use client';

// Global navigation progress bar
// Shows a thin animated bar at the top of the page during any navigation.
// Works by listening to anchor clicks and clearing on pathname change.

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathRef = useRef(pathname + searchParams.toString());

  // Start the bar when a navigation link is clicked
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) return;
      // Only internal navigation
      startProgress();
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Complete the bar when pathname/searchParams change (navigation done)
  useEffect(() => {
    const current = pathname + searchParams.toString();
    if (current !== prevPathRef.current) {
      prevPathRef.current = current;
      completeProgress();
    }
  }, [pathname, searchParams]);

  function startProgress() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(0);
    setVisible(true);

    let p = 0;
    intervalRef.current = setInterval(() => {
      // Ease toward 85% — never completes on its own
      p = p + (85 - p) * 0.08;
      setProgress(p);
    }, 80);
  }

  function completeProgress() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(100);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9998] h-[2.5px] bg-teal-500 transition-all duration-150 ease-out pointer-events-none"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-hidden="true"
    />
  );
}
