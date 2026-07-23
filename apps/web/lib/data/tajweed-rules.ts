// Tajwīd rule metadata — quran.com rule-class names → KFGQPC-faithful color +
// learner-friendly explanation. Powers the colored spans, the tap-to-learn
// popover, and the legend. Mirrors apps/mobile/lib/data/tajweed_rules.dart.

export interface TajweedRule {
  name: string; // English display name
  arabic: string; // Arabic name
  color: string; // hex
  how: string; // one-line "how to pronounce it"
}

export const TAJWEED_RULES: Record<string, TajweedRule> = {
  ham_wasl: {
    name: 'Hamzat al-Waṣl', arabic: 'همزة الوصل', color: '#AAAAAA',
    how: 'A connecting hamza — silent when continuing from the previous word; sounded only when you start on it.',
  },
  laam_shamsiyah: {
    name: 'Lām Shamsiyyah', arabic: 'لام شمسية', color: '#AAAAAA',
    how: "The ‘l’ of ‘al-’ is silent and the next letter is doubled — say ash-shams, not al-shams.",
  },
  slnt: {
    name: 'Silent Letter', arabic: 'حرف ساكن', color: '#AAAAAA',
    how: 'Written but not pronounced.',
  },
  madda_normal: {
    name: 'Natural Prolongation', arabic: 'مد طبيعي', color: '#537FFF',
    how: 'Stretch this vowel for 2 counts (madd ṭabīʿī).',
  },
  madda_permissible: {
    name: 'Permissible Prolongation', arabic: 'مد جائز', color: '#4050FF',
    how: 'May be stretched 2, 4 or 6 counts — pick one length and keep it consistent.',
  },
  madda_necessary: {
    name: 'Necessary Prolongation', arabic: 'مد لازم', color: '#000EBC',
    how: 'Stretch for a full 6 counts (madd lāzim).',
  },
  madda_obligatory: {
    name: 'Obligatory Prolongation', arabic: 'مد واجب', color: '#2144C1',
    how: 'Stretch for 4–5 counts (madd wājib muttaṣil).',
  },
  qalaqah: {
    name: 'Qalqalah', arabic: 'قلقلة', color: '#DD0008',
    how: 'Give a slight bounce/echo on this letter when it carries sukūn (ق ط ب ج د).',
  },
  ghunnah: {
    name: 'Ghunnah', arabic: 'غنة', color: '#FF7E1E',
    how: 'Nasalize through the nose for about 2 counts.',
  },
  ikhafa: {
    name: 'Ikhfāʾ', arabic: 'إخفاء', color: '#9400A8',
    how: 'Hide the nūn sākinah / tanwīn into the next letter with a light ghunnah.',
  },
  ikhafa_shafawi: {
    name: 'Ikhfāʾ Shafawī', arabic: 'إخفاء شفوي', color: '#D500B7',
    how: 'Hide the mīm sākinah before bāʾ with a light ghunnah of the lips.',
  },
  idgham_ghunnah: {
    name: 'Idghām with Ghunnah', arabic: 'إدغام بغنة', color: '#169777',
    how: 'Merge the nūn sākinah / tanwīn into the next letter (ي ن م و) with ghunnah.',
  },
  idgham_wo_ghunnah: {
    name: 'Idghām without Ghunnah', arabic: 'إدغام بلا غنة', color: '#169200',
    how: 'Merge the nūn sākinah / tanwīn into ل or ر without ghunnah.',
  },
  idgham_shafawi: {
    name: 'Idghām Shafawī', arabic: 'إدغام شفوي', color: '#58B800',
    how: 'Merge mīm sākinah into a following mīm, with ghunnah.',
  },
  idgham_mutajanisayn: {
    name: 'Idghām Mutajānisayn', arabic: 'إدغام متجانسين', color: '#A1A1A1',
    how: 'Two letters from the same articulation point merge together.',
  },
  idgham_mutaqaribayn: {
    name: 'Idghām Mutaqāribayn', arabic: 'إدغام متقاربين', color: '#A1A1A1',
    how: 'Two letters with near articulation points merge together.',
  },
  iqlab: {
    name: 'Iqlāb', arabic: 'إقلاب', color: '#26BFFD',
    how: 'Turn the nūn sākinah / tanwīn into a hidden mīm before bāʾ, with ghunnah.',
  },
};

/** Rules in a sensible teaching order for the legend. */
export const TAJWEED_LEGEND_ORDER = [
  'ghunnah', 'qalaqah', 'ikhafa', 'ikhafa_shafawi',
  'idgham_ghunnah', 'idgham_wo_ghunnah', 'idgham_shafawi', 'iqlab',
  'madda_normal', 'madda_permissible', 'madda_obligatory', 'madda_necessary',
  'ham_wasl', 'laam_shamsiyah', 'slnt',
];

/** One run of ayah text: [text, ruleClass|null]. */
export type TajweedRun = { t: string; r: string | null };
