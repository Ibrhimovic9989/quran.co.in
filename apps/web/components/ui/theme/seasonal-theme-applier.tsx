'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SeasonalTheme } from '@/lib/utils/seasonal-theme/seasonal-theme';
import { getActiveSeasonalThemeForNow } from '@/lib/utils/seasonal-theme/seasonal-theme';
import { SeasonalBanner } from './seasonal-banner';

const BODY_CLASS: Record<Exclude<SeasonalTheme, 'none'>, string> = {
  'ramadan':      'theme-ramadan',
  'eid-ul-fitr':  'theme-eid-ul-fitr',
  'eid-ul-adha':  'theme-eid-ul-adha',
};

const ALL_THEME_CLASSES = Object.values(BODY_CLASS);

export function SeasonalThemeApplier() {
  const timeZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }, []);

  const [theme, setTheme] = useState<SeasonalTheme>('none');

  useEffect(() => {
    const apply = (t: SeasonalTheme) => {
      document.body.classList.remove(...ALL_THEME_CLASSES);
      document.documentElement.classList.remove(...ALL_THEME_CLASSES);
      if (t !== 'none') {
        const cls = BODY_CLASS[t];
        document.body.classList.add(cls);
        document.documentElement.classList.add(cls);
      }
      setTheme(t);
    };

    const recompute = () => apply(getActiveSeasonalThemeForNow(new Date(), timeZone));

    recompute();
    const id = window.setInterval(recompute, 30 * 60 * 1000);
    const onVisible = () => { if (document.visibilityState === 'visible') recompute(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [timeZone]);

  return <SeasonalBanner theme={theme} />;
}
