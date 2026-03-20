export interface QuranTopic {
  id: string;
  label: string;
  arabic: string;
  description: string;
  emoji: string;
  color: string; // Tailwind bg+text classes for the card
  query: string; // The semantic search query sent to the embeddings API
}

export const QURAN_TOPICS: QuranTopic[] = [
  // Faith & Worship
  {
    id: 'tawhid',
    label: 'Tawhid',
    arabic: 'التوحيد',
    description: 'The Oneness of Allah',
    emoji: '☝️',
    color: 'bg-amber-50 border-amber-200 text-amber-800',
    query: 'oneness of Allah, monotheism, tawhid, no god but Allah',
  },
  {
    id: 'salah',
    label: 'Salah',
    arabic: 'الصلاة',
    description: 'Prayer and worship',
    emoji: '🕌',
    color: 'bg-teal-50 border-teal-200 text-teal-800',
    query: 'prayer, salah, worship, prostration, establish prayer',
  },
  {
    id: 'tawakkul',
    label: 'Tawakkul',
    arabic: 'التوكل',
    description: 'Trusting in Allah',
    emoji: '🤲',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    query: 'trust in Allah, reliance on Allah, tawakkul, put trust in God',
  },
  {
    id: 'dua',
    label: "Du'a",
    arabic: 'الدعاء',
    description: 'Supplication and calling upon Allah',
    emoji: '🙏',
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    query: 'supplication, dua, calling upon Allah, asking Allah, invocation',
  },
  {
    id: 'tawbah',
    label: 'Tawbah',
    arabic: 'التوبة',
    description: 'Repentance and returning to Allah',
    emoji: '💧',
    color: 'bg-cyan-50 border-cyan-200 text-cyan-800',
    query: 'repentance, tawbah, seeking forgiveness, returning to Allah, turning back',
  },

  // Character & Morality
  {
    id: 'sabr',
    label: 'Sabr',
    arabic: 'الصبر',
    description: 'Patience and perseverance',
    emoji: '⚓',
    color: 'bg-stone-50 border-stone-300 text-stone-700',
    query: 'patience, sabr, perseverance, endure, steadfastness in hardship',
  },
  {
    id: 'shukr',
    label: 'Shukr',
    arabic: 'الشكر',
    description: 'Gratitude and thankfulness',
    emoji: '🌸',
    color: 'bg-pink-50 border-pink-200 text-pink-800',
    query: 'gratitude, thankfulness, shukr, be grateful, thankful to Allah',
  },
  {
    id: 'forgiveness',
    label: 'Forgiveness',
    arabic: 'المغفرة',
    description: "Allah's mercy and forgiving others",
    emoji: '💚',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    query: 'forgiveness, mercy, maghfirah, forgive others, Allah forgives sins',
  },
  {
    id: 'sidq',
    label: 'Honesty',
    arabic: 'الصدق',
    description: 'Truthfulness and integrity',
    emoji: '🌟',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    query: 'honesty, truthfulness, sidq, be truthful, speak the truth',
  },
  {
    id: 'justice',
    label: 'Justice',
    arabic: 'العدل',
    description: "Fairness and upholding Allah's justice",
    emoji: '⚖️',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    query: 'justice, fairness, adl, be just, stand firmly for justice',
  },

  // Life & Guidance
  {
    id: 'rizq',
    label: 'Rizq',
    arabic: 'الرزق',
    description: 'Sustenance and provisions from Allah',
    emoji: '🌾',
    color: 'bg-lime-50 border-lime-200 text-lime-800',
    query: 'rizq, sustenance, provision, livelihood, Allah provides',
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    arabic: 'العلم',
    description: 'Seeking knowledge and wisdom',
    emoji: '📖',
    color: 'bg-violet-50 border-violet-200 text-violet-800',
    query: 'knowledge, seek knowledge, wisdom, ilm, learning, understanding',
  },
  {
    id: 'parents',
    label: 'Parents',
    arabic: 'الوالدان',
    description: 'Rights and duties towards parents',
    emoji: '👨‍👩‍👧',
    color: 'bg-rose-50 border-rose-200 text-rose-800',
    query: 'parents, mother, father, be kind to parents, honor parents',
  },
  {
    id: 'charity',
    label: 'Charity',
    arabic: 'الصدقة',
    description: 'Giving in the way of Allah',
    emoji: '💛',
    color: 'bg-orange-50 border-orange-200 text-orange-800',
    query: 'charity, sadaqah, spending in the way of Allah, give to the poor, zakat',
  },

  // Hereafter
  {
    id: 'jannah',
    label: 'Jannah',
    arabic: 'الجنة',
    description: 'Paradise and its rewards',
    emoji: '🌿',
    color: 'bg-green-50 border-green-200 text-green-800',
    query: 'paradise, jannah, garden, reward in the hereafter, believers in paradise',
  },
  {
    id: 'akhirah',
    label: 'Day of Judgement',
    arabic: 'يوم القيامة',
    description: 'The Last Day and accountability',
    emoji: '⚡',
    color: 'bg-red-50 border-red-200 text-red-800',
    query: 'day of judgment, akhirah, resurrection, accountability, last day',
  },
];
