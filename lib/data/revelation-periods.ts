// Revelation period data for all 114 surahs.
// Based on classical Islamic scholarship (Ibn Kathir, Al-Itqan of As-Suyuti, etc.)
// Periods: 'early-meccan' | 'middle-meccan' | 'late-meccan' | 'madinan'
// yearCE: approximate year of revelation (CE)
// yearProphethood: year of prophethood (1 = 610 CE)

export type RevelationPeriod = 'early-meccan' | 'middle-meccan' | 'late-meccan' | 'madinan';

export interface RevelationInfo {
  period: RevelationPeriod;
  yearCE: string;         // e.g. "~610" or "622–623"
  yearProphethood: string; // e.g. "Year 1" or "Year 12–13"
}

export const PERIOD_LABELS: Record<RevelationPeriod, string> = {
  'early-meccan':  'Early Meccan',
  'middle-meccan': 'Middle Meccan',
  'late-meccan':   'Late Meccan',
  'madinan':       'Madinan',
};

// Human-readable descriptions shown in tooltips
export const PERIOD_DESCRIPTIONS: Record<RevelationPeriod, string> = {
  'early-meccan':
    'Early Meccan (610–615 CE · Years 1–5 of Prophethood): ' +
    'The first surahs revealed in Makkah. Short, powerful, and rhythmic — focused on Tawhid (the Oneness of Allah), ' +
    'the Day of Judgment, and moral accountability. Revealed during a time of intense opposition from the Quraysh.',
  'middle-meccan':
    'Middle Meccan (615–619 CE · Years 5–9 of Prophethood): ' +
    'Revealed as the Muslim community faced growing persecution. Themes deepen: stories of the Prophets (Musa, Ibrahim, Yusuf) ' +
    'offer comfort and patience. Verses grow longer and arguments more detailed.',
  'late-meccan':
    'Late Meccan (619–622 CE · Years 9–13 of Prophethood): ' +
    'Revealed in the difficult final years before the Hijra (migration to Madinah). Themes include resurrection, ' +
    'the nature of the Quran, and detailed theological arguments. The Year of Sorrow (619 CE) falls in this period.',
  'madinan':
    'Madinan (622–632 CE · After the Hijra): ' +
    'Revealed after the Prophet ﷺ migrated to Madinah and the Muslim community became a state. ' +
    'Surahs are generally longer, covering law, governance, family, interfaith relations, and community ethics.',
};

export const APPROXIMATION_NOTE =
  'Years are approximate based on classical Islamic scholarship (Ibn Kathir, Al-Itqan of As-Suyuti). ' +
  'Exact dates of revelation are not always known with certainty.';

export const PERIOD_COLORS: Record<RevelationPeriod, { badge: string; dot: string }> = {
  'early-meccan':  { badge: 'bg-orange-50 text-orange-800 border-orange-200',  dot: 'bg-orange-400' },
  'middle-meccan': { badge: 'bg-amber-50  text-amber-800  border-amber-200',   dot: 'bg-amber-500'  },
  'late-meccan':   { badge: 'bg-yellow-50 text-yellow-800 border-yellow-200',  dot: 'bg-yellow-500' },
  'madinan':       { badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
};

// Key: surah number (1-indexed)
export const REVELATION_DATA: Record<number, RevelationInfo> = {
  1:   { period: 'early-meccan',  yearCE: '~610',     yearProphethood: 'Year 1'    },
  2:   { period: 'madinan',       yearCE: '622–624',  yearProphethood: 'Year 1–2 AH' },
  3:   { period: 'madinan',       yearCE: '624–625',  yearProphethood: 'Year 2–3 AH' },
  4:   { period: 'madinan',       yearCE: '625–627',  yearProphethood: 'Year 3–5 AH' },
  5:   { period: 'madinan',       yearCE: '629–632',  yearProphethood: 'Year 6–10 AH' },
  6:   { period: 'late-meccan',   yearCE: '~620',     yearProphethood: 'Year 10'   },
  7:   { period: 'middle-meccan', yearCE: '~615',     yearProphethood: 'Year 5'    },
  8:   { period: 'madinan',       yearCE: '624',      yearProphethood: 'Year 2 AH' },
  9:   { period: 'madinan',       yearCE: '631',      yearProphethood: 'Year 9 AH' },
  10:  { period: 'late-meccan',   yearCE: '~619',     yearProphethood: 'Year 9'    },
  11:  { period: 'late-meccan',   yearCE: '~619',     yearProphethood: 'Year 9'    },
  12:  { period: 'late-meccan',   yearCE: '~619',     yearProphethood: 'Year 9'    },
  13:  { period: 'madinan',       yearCE: '622–623',  yearProphethood: 'Year 1 AH' },
  14:  { period: 'late-meccan',   yearCE: '~619',     yearProphethood: 'Year 9'    },
  15:  { period: 'middle-meccan', yearCE: '~615',     yearProphethood: 'Year 5'    },
  16:  { period: 'late-meccan',   yearCE: '~619',     yearProphethood: 'Year 9'    },
  17:  { period: 'late-meccan',   yearCE: '~621',     yearProphethood: 'Year 11'   },
  18:  { period: 'middle-meccan', yearCE: '~615',     yearProphethood: 'Year 5'    },
  19:  { period: 'early-meccan',  yearCE: '~614',     yearProphethood: 'Year 4'    },
  20:  { period: 'middle-meccan', yearCE: '~615',     yearProphethood: 'Year 5'    },
  21:  { period: 'middle-meccan', yearCE: '~615',     yearProphethood: 'Year 5'    },
  22:  { period: 'madinan',       yearCE: '622–623',  yearProphethood: 'Year 1 AH' },
  23:  { period: 'middle-meccan', yearCE: '~616',     yearProphethood: 'Year 6'    },
  24:  { period: 'madinan',       yearCE: '625–626',  yearProphethood: 'Year 5–6 AH' },
  25:  { period: 'middle-meccan', yearCE: '~616',     yearProphethood: 'Year 6'    },
  26:  { period: 'middle-meccan', yearCE: '~615',     yearProphethood: 'Year 5'    },
  27:  { period: 'middle-meccan', yearCE: '~615',     yearProphethood: 'Year 5'    },
  28:  { period: 'late-meccan',   yearCE: '~622',     yearProphethood: 'Year 12'   },
  29:  { period: 'late-meccan',   yearCE: '~622',     yearProphethood: 'Year 12'   },
  30:  { period: 'middle-meccan', yearCE: '~615',     yearProphethood: 'Year 5'    },
  31:  { period: 'late-meccan',   yearCE: '~619',     yearProphethood: 'Year 9'    },
  32:  { period: 'middle-meccan', yearCE: '~615',     yearProphethood: 'Year 5'    },
  33:  { period: 'madinan',       yearCE: '627',      yearProphethood: 'Year 5 AH' },
  34:  { period: 'middle-meccan', yearCE: '~616',     yearProphethood: 'Year 6'    },
  35:  { period: 'late-meccan',   yearCE: '~619',     yearProphethood: 'Year 9'    },
  36:  { period: 'middle-meccan', yearCE: '~615',     yearProphethood: 'Year 5'    },
  37:  { period: 'middle-meccan', yearCE: '~615',     yearProphethood: 'Year 5'    },
  38:  { period: 'middle-meccan', yearCE: '~615',     yearProphethood: 'Year 5'    },
  39:  { period: 'late-meccan',   yearCE: '~619',     yearProphethood: 'Year 9'    },
  40:  { period: 'late-meccan',   yearCE: '~620',     yearProphethood: 'Year 10'   },
  41:  { period: 'late-meccan',   yearCE: '~620',     yearProphethood: 'Year 10'   },
  42:  { period: 'late-meccan',   yearCE: '~620',     yearProphethood: 'Year 10'   },
  43:  { period: 'late-meccan',   yearCE: '~620',     yearProphethood: 'Year 10'   },
  44:  { period: 'late-meccan',   yearCE: '~620',     yearProphethood: 'Year 10'   },
  45:  { period: 'late-meccan',   yearCE: '~620',     yearProphethood: 'Year 10'   },
  46:  { period: 'late-meccan',   yearCE: '~620',     yearProphethood: 'Year 10'   },
  47:  { period: 'madinan',       yearCE: '622–623',  yearProphethood: 'Year 1 AH' },
  48:  { period: 'madinan',       yearCE: '628',      yearProphethood: 'Year 6 AH' },
  49:  { period: 'madinan',       yearCE: '630',      yearProphethood: 'Year 9 AH' },
  50:  { period: 'early-meccan',  yearCE: '~610',     yearProphethood: 'Year 1'    },
  51:  { period: 'middle-meccan', yearCE: '~615',     yearProphethood: 'Year 5'    },
  52:  { period: 'early-meccan',  yearCE: '~612',     yearProphethood: 'Year 2'    },
  53:  { period: 'early-meccan',  yearCE: '~614',     yearProphethood: 'Year 4'    },
  54:  { period: 'early-meccan',  yearCE: '~614',     yearProphethood: 'Year 4'    },
  55:  { period: 'middle-meccan', yearCE: '~615',     yearProphethood: 'Year 5'    },
  56:  { period: 'early-meccan',  yearCE: '~614',     yearProphethood: 'Year 4'    },
  57:  { period: 'madinan',       yearCE: '627–628',  yearProphethood: 'Year 7 AH' },
  58:  { period: 'madinan',       yearCE: '625–626',  yearProphethood: 'Year 5–6 AH' },
  59:  { period: 'madinan',       yearCE: '625',      yearProphethood: 'Year 4 AH' },
  60:  { period: 'madinan',       yearCE: '630',      yearProphethood: 'Year 8 AH' },
  61:  { period: 'madinan',       yearCE: '625',      yearProphethood: 'Year 3 AH' },
  62:  { period: 'madinan',       yearCE: '622–624',  yearProphethood: 'Year 1–2 AH' },
  63:  { period: 'madinan',       yearCE: '625',      yearProphethood: 'Year 4 AH' },
  64:  { period: 'madinan',       yearCE: '622–624',  yearProphethood: 'Year 1–2 AH' },
  65:  { period: 'madinan',       yearCE: '629',      yearProphethood: 'Year 7 AH' },
  66:  { period: 'madinan',       yearCE: '629',      yearProphethood: 'Year 7 AH' },
  67:  { period: 'late-meccan',   yearCE: '~620',     yearProphethood: 'Year 10'   },
  68:  { period: 'early-meccan',  yearCE: '~610',     yearProphethood: 'Year 1'    },
  69:  { period: 'early-meccan',  yearCE: '~612',     yearProphethood: 'Year 2'    },
  70:  { period: 'early-meccan',  yearCE: '~613',     yearProphethood: 'Year 3'    },
  71:  { period: 'early-meccan',  yearCE: '~612',     yearProphethood: 'Year 2'    },
  72:  { period: 'early-meccan',  yearCE: '~619',     yearProphethood: 'Year 9'    },
  73:  { period: 'early-meccan',  yearCE: '~610',     yearProphethood: 'Year 1'    },
  74:  { period: 'early-meccan',  yearCE: '~610',     yearProphethood: 'Year 1'    },
  75:  { period: 'early-meccan',  yearCE: '~610',     yearProphethood: 'Year 1'    },
  76:  { period: 'early-meccan',  yearCE: '~612',     yearProphethood: 'Year 2'    },
  77:  { period: 'early-meccan',  yearCE: '~612',     yearProphethood: 'Year 2'    },
  78:  { period: 'early-meccan',  yearCE: '~610',     yearProphethood: 'Year 1'    },
  79:  { period: 'early-meccan',  yearCE: '~610',     yearProphethood: 'Year 1'    },
  80:  { period: 'early-meccan',  yearCE: '~614',     yearProphethood: 'Year 4'    },
  81:  { period: 'early-meccan',  yearCE: '~610',     yearProphethood: 'Year 1'    },
  82:  { period: 'early-meccan',  yearCE: '~610',     yearProphethood: 'Year 1'    },
  83:  { period: 'early-meccan',  yearCE: '~615',     yearProphethood: 'Year 5'    },
  84:  { period: 'early-meccan',  yearCE: '~610',     yearProphethood: 'Year 1'    },
  85:  { period: 'early-meccan',  yearCE: '~614',     yearProphethood: 'Year 4'    },
  86:  { period: 'early-meccan',  yearCE: '~612',     yearProphethood: 'Year 2'    },
  87:  { period: 'early-meccan',  yearCE: '~610',     yearProphethood: 'Year 1'    },
  88:  { period: 'early-meccan',  yearCE: '~612',     yearProphethood: 'Year 2'    },
  89:  { period: 'early-meccan',  yearCE: '~610',     yearProphethood: 'Year 1'    },
  90:  { period: 'early-meccan',  yearCE: '~611',     yearProphethood: 'Year 1'    },
  91:  { period: 'early-meccan',  yearCE: '~613',     yearProphethood: 'Year 3'    },
  92:  { period: 'early-meccan',  yearCE: '~612',     yearProphethood: 'Year 2'    },
  93:  { period: 'early-meccan',  yearCE: '~613',     yearProphethood: 'Year 3'    },
  94:  { period: 'early-meccan',  yearCE: '~613',     yearProphethood: 'Year 3'    },
  95:  { period: 'early-meccan',  yearCE: '~614',     yearProphethood: 'Year 4'    },
  96:  { period: 'early-meccan',  yearCE: '~610',     yearProphethood: 'Year 1'    },
  97:  { period: 'early-meccan',  yearCE: '~610',     yearProphethood: 'Year 1'    },
  98:  { period: 'madinan',       yearCE: '622–624',  yearProphethood: 'Year 2 AH' },
  99:  { period: 'early-meccan',  yearCE: '~610',     yearProphethood: 'Year 1'    },
  100: { period: 'early-meccan',  yearCE: '~612',     yearProphethood: 'Year 2'    },
  101: { period: 'early-meccan',  yearCE: '~612',     yearProphethood: 'Year 2'    },
  102: { period: 'early-meccan',  yearCE: '~613',     yearProphethood: 'Year 3'    },
  103: { period: 'early-meccan',  yearCE: '~613',     yearProphethood: 'Year 3'    },
  104: { period: 'early-meccan',  yearCE: '~613',     yearProphethood: 'Year 3'    },
  105: { period: 'early-meccan',  yearCE: '~614',     yearProphethood: 'Year 4'    },
  106: { period: 'early-meccan',  yearCE: '~614',     yearProphethood: 'Year 4'    },
  107: { period: 'early-meccan',  yearCE: '~613',     yearProphethood: 'Year 3'    },
  108: { period: 'early-meccan',  yearCE: '~613',     yearProphethood: 'Year 3'    },
  109: { period: 'early-meccan',  yearCE: '~615',     yearProphethood: 'Year 5'    },
  110: { period: 'madinan',       yearCE: '632',      yearProphethood: 'Year 10 AH' },
  111: { period: 'early-meccan',  yearCE: '~613',     yearProphethood: 'Year 3'    },
  112: { period: 'early-meccan',  yearCE: '~610',     yearProphethood: 'Year 1'    },
  113: { period: 'early-meccan',  yearCE: '~610',     yearProphethood: 'Year 1'    },
  114: { period: 'early-meccan',  yearCE: '~610',     yearProphethood: 'Year 1'    },
};

export function getRevelationInfo(surahNumber: number): RevelationInfo | null {
  return REVELATION_DATA[surahNumber] ?? null;
}
