// Static data + shared types for the Ask page.
// Extracted from app/ask/page.tsx to keep the component lean.

export type Mode = 'focused' | 'open';

export const SUGGESTED: Record<Mode, string[]> = {
  focused: [
    'What does the Quran say about patience in hardship?',
    'Which ayahs speak about forgiveness and mercy?',
    'What does the Quran say about parents?',
    'Ayahs about gratitude and being thankful to Allah',
    'What does the Quran say about honesty?',
    'Verses about seeking knowledge',
  ],
  open: [
    'Explain Surah Al-Fatiha',
    'What is Ayah Al-Kursi (2:255)?',
    'What does Surah Al-Baqarah 2:214 say?',
    'Explain the last two ayahs of Surah Al-Baqarah',
    'What is the meaning of Surah Al-Ikhlas?',
    'What are the duas for parents in the Quran?',
  ],
};

export const LOADING_STEPS = [
  'Searching through 6,236 ayahs…',
  'Reading the most relevant verses…',
  'Cross-referencing themes…',
  'Analyzing Quranic context…',
  'Composing your answer…',
];
