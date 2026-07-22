/**
 * Canonical Context Map
 * ─────────────────────
 * Ensures well-known ayahs are ALWAYS included in the Ask context for their
 * canonical queries, regardless of semantic search score.
 *
 * Each entry has:
 *   - keywords: if ALL words in any pattern match the query, inject the ayahs
 *   - ayahs: [{surah, ayah}] to guarantee in context
 */

interface CanonicalEntry {
  keywords: string[][];                       // OR of ANDs — any row fully matching triggers
  ayahs: { surah: number; ayah: number }[];
}

export const CANONICAL_CONTEXT: CanonicalEntry[] = [

  // ── Duas for parents ────────────────────────────────────────────────────────
  {
    keywords: [
      ['dua', 'parent'],
      ['dua', 'parents'],
      ['supplication', 'parent'],
      ['prayer', 'parent'],
      ['duas', 'parent'],
      ['duas', 'parents'],
      ['dua', 'mother'],
      ['dua', 'father'],
    ],
    ayahs: [
      { surah: 14, ayah: 41 },  // Ibrahim: "Rabbana ighfir li wa li walidayya"
      { surah: 17, ayah: 24 },  // Al-Isra: "Rabbir hamhuma kama rabbayani saghira"
      { surah: 46, ayah: 15 },  // Al-Ahqaf: comprehensive dua with parents + children
    ],
  },

  // ── Ayat-ul-Kursi ───────────────────────────────────────────────────────────
  {
    keywords: [
      ['ayat', 'kursi'],
      ['ayatul', 'kursi'],
      ['ayat ul kursi'],
      ['2:255'],
      ['throne', 'verse'],
    ],
    ayahs: [
      { surah: 2, ayah: 255 },
    ],
  },

  // ── Last two ayahs of Al-Baqarah (Amana Rasul) ──────────────────────────────
  {
    keywords: [
      ['last', 'baqarah'],
      ['amana', 'rasul'],
      ['2:285'],
      ['2:286'],
    ],
    ayahs: [
      { surah: 2, ayah: 285 },
      { surah: 2, ayah: 286 },
    ],
  },

  // ── Surah Al-Fatiha ─────────────────────────────────────────────────────────
  {
    keywords: [
      ['fatiha'],
      ['fatihah'],
      ['opening', 'surah'],
      ['surah', 'fatiha'],
    ],
    ayahs: [
      { surah: 1, ayah: 1 },
      { surah: 1, ayah: 2 },
      { surah: 1, ayah: 5 },
      { surah: 1, ayah: 6 },
      { surah: 1, ayah: 7 },
    ],
  },

  // ── Surah Al-Ikhlas ─────────────────────────────────────────────────────────
  {
    keywords: [
      ['ikhlas'],
      ['surah', 'ikhlas'],
      ['qul', 'huwa', 'allah'],
      ['tawhid', 'surah'],
      ['oneness', 'allah', 'surah'],
    ],
    ayahs: [
      { surah: 112, ayah: 1 },
      { surah: 112, ayah: 2 },
      { surah: 112, ayah: 3 },
      { surah: 112, ayah: 4 },
    ],
  },

  // ── Dua for guidance (Ihdinas sirat) ────────────────────────────────────────
  {
    keywords: [
      ['ihdina'],
      ['guide', 'straight', 'path'],
      ['dua', 'guidance'],
      ['hidayah', 'dua'],
    ],
    ayahs: [
      { surah: 1, ayah: 6 },
      { surah: 1, ayah: 7 },
    ],
  },

  // ── Dua for forgiveness (general) ───────────────────────────────────────────
  {
    keywords: [
      ['dua', 'forgiveness'],
      ['dua', 'tawbah'],
      ['rabbana', 'ghafoor'],
      ['istighfar', 'dua'],
    ],
    ayahs: [
      { surah: 2,   ayah: 286 }, // "Rabbana la tu'akhidhna..."
      { surah: 3,   ayah: 16  }, // "Rabbana innana amanna..."
      { surah: 3,   ayah: 193 }, // "Rabbana innana sami'na..."
      { surah: 71,  ayah: 28  }, // Nuh's dua for forgiveness for parents + believers
    ],
  },

  // ── Dua for spouses and children ────────────────────────────────────────────
  {
    keywords: [
      ['dua', 'wife'],
      ['dua', 'husband'],
      ['dua', 'children'],
      ['dua', 'family'],
      ['rabbana', 'qurrata'],
      ['qurrata ayun'],
    ],
    ayahs: [
      { surah: 25, ayah: 74 }, // "Rabbana hab lana min azwajina..."
    ],
  },

  // ── Dua for anxiety / distress / sadness ────────────────────────────────────
  {
    keywords: [
      ['dua', 'anxiety'],
      ['dua', 'stress'],
      ['dua', 'depression'],
      ['dua', 'sadness'],
      ['dua', 'distress'],
      ['hasbi allah'],
      ['hasbunallah'],
    ],
    ayahs: [
      { surah: 9,  ayah: 129 }, // "Hasbiya Allahu la ilaha illa Huwa"
      { surah: 2,  ayah: 286 }, // "Allah does not burden a soul beyond that it can bear"
      { surah: 94, ayah: 5   }, // "Indeed with hardship comes ease"
      { surah: 94, ayah: 6   },
    ],
  },

  // ── Dua for knowledge (Rabbi zidni ilma) ────────────────────────────────────
  {
    keywords: [
      ['rabbi', 'zidni'],
      ['dua', 'knowledge'],
      ['dua', 'wisdom'],
      ['increase', 'knowledge'],
    ],
    ayahs: [
      { surah: 20, ayah: 114 }, // "Rabbi zidni ilma"
    ],
  },

  // ── Dua for protection (last two surahs) ────────────────────────────────────
  {
    keywords: [
      ["mu'awwidhatayn"],
      ['muawwidhatayn'],
      ['dua', 'protection'],
      ['surah', 'falaq'],
      ['surah', 'nas'],
      ['evil eye', 'dua'],
      ['refuge', 'evil'],
    ],
    ayahs: [
      { surah: 113, ayah: 1 },
      { surah: 114, ayah: 1 },
    ],
  },

  // ── Dua Yunus / distress ────────────────────────────────────────────────────
  {
    keywords: [
      ['dua', 'yunus'],
      ['la ilaha', 'subhanaka', 'zalimin'],
      ['dua', 'whale'],
      ['dua', 'jonah'],
    ],
    ayahs: [
      { surah: 21, ayah: 87 }, // Yunus's dua in the whale
    ],
  },

  // ── Dua for patience / sabr ──────────────────────────────────────────────────
  {
    keywords: [
      ['dua', 'patience'],
      ['dua', 'sabr'],
      ['rabbana', 'sabr'],
      ['grant', 'patience'],
    ],
    ayahs: [
      { surah: 2,  ayah: 250 }, // "Rabbana afrigh alayna sabran..."
      { surah: 7,  ayah: 126 }, // "Rabbana afrigh alayna sabran..."
      { surah: 18, ayah: 10  }, // Dua of the people of the cave
    ],
  },

  // ── Dua for rizq / provision ────────────────────────────────────────────────
  {
    keywords: [
      ['dua', 'rizq'],
      ['dua', 'provision'],
      ['dua', 'sustenance'],
      ['dua', 'wealth'],
      ['dua', 'income'],
      ['dua', 'money'],
    ],
    ayahs: [
      { surah: 2,  ayah: 201 }, // "Rabbana atina fid dunya hasanah"
      { surah: 28, ayah: 24  }, // Musa's dua "Rabbi inni lima anzalta ilayya min khayr faqir"
      { surah: 62, ayah: 10  }, // "Seek of the bounty of Allah"
    ],
  },

  // ── Ayahs about Tawakkul / trust in Allah ───────────────────────────────────
  {
    keywords: [
      ['tawakkul'],
      ['trust', 'allah'],
      ['rely', 'allah'],
      ['hasbunallah', 'wakeel'],
    ],
    ayahs: [
      { surah: 3,   ayah: 173 }, // "Hasbunallah wa ni'mal wakeel"
      { surah: 65,  ayah: 3   }, // "Whoever puts trust in Allah, He is sufficient"
      { surah: 9,   ayah: 129 },
    ],
  },

];

/**
 * Returns guaranteed ayahs for a given query string.
 * Matching is case-insensitive; all keywords in a row must be present.
 */
export function getCanonicalAyahs(query: string): { surah: number; ayah: number }[] {
  const q = query.toLowerCase();
  const matched = new Map<string, { surah: number; ayah: number }>();

  for (const entry of CANONICAL_CONTEXT) {
    const hit = entry.keywords.some((row) =>
      row.every((kw) => q.includes(kw.toLowerCase()))
    );
    if (hit) {
      for (const a of entry.ayahs) {
        matched.set(`${a.surah}:${a.ayah}`, a);
      }
    }
  }

  return [...matched.values()];
}
