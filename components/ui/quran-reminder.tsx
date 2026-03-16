'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

const REMINDERS = [
  "Begin your recitation with 'A'udhu billahi min ash-shaytan ir-rajeem.'",
  "The Prophet ﷺ said: 'The best of you are those who learn the Quran and teach it.' (Bukhari)",
  "Recite with your heart, not only your tongue.",
  "Even one letter earns ten good deeds. SubhanAllah.",
  "Surah Al-Kahf on Fridays is a light between the two Fridays.",
  "Surah Al-Mulk protects from the punishment of the grave.",
  "Al-Baqarah is the peak of the Quran — recite it to bless your home.",
  "Perform wudu before touching the mushaf when possible.",
  "Read with tarteel (measured recitation) as Allah commanded in Al-Muzzammil.",
  "The Quran will intercede for its companions on the Day of Judgment.",
  "Ayat Al-Kursi after every prayer — a protection until the next.",
  "Those who recite the Quran beautifully will be with the noble scribes.",
  "Make du'a before reading: 'Allahumma thabitni 'alaa kitaabik.'",
  "Memorise even one ayah a day — consistency is beloved to Allah.",
  "The Quran was revealed as a mercy and a cure for the believers.",
  "Recite Al-Ikhlas three times — it equals a third of the Quran.",
  "Seek the meaning. The Quran was sent to be pondered upon.",
  "Teach the Quran to your children — it is the greatest gift.",
  "Every time you complete the Quran, make a du'a — it will be answered.",
  "The heart that is empty of Quran is like a ruined house.",
];

const INTERVAL_MS = 8000;
const FADE_MS = 400;

interface QuranReminderProps {
  className?: string;
}

export function QuranReminder({ className }: QuranReminderProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % REMINDERS.length);
        setVisible(true);
      }, FADE_MS);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <p
      className={cn(
        'text-xs text-gray-400 text-center transition-opacity duration-[400ms]',
        visible ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      {REMINDERS[index]}
    </p>
  );
}
