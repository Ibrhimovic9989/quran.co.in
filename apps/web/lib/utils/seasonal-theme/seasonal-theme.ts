import { getIslamicDatePartsForTimeZone } from './islamic-calendar';

export type SeasonalTheme = 'none' | 'ramadan' | 'eid-ul-fitr' | 'eid-ul-adha';

// Islamic months
const RAMADAN        = 9;
const SHAWWAL        = 10;
const DHUL_HIJJAH    = 12;

// Eid ul Fitr: 1st–3rd Shawwal
const EID_FITR_START = 1;
const EID_FITR_END   = 3;

// Eid ul Adha: 10th–13th Dhul Hijjah
const EID_ADHA_START = 10;
const EID_ADHA_END   = 13;

export function getActiveSeasonalThemeForNow(
  now: Date,
  timeZone: string
): SeasonalTheme {
  const d = getIslamicDatePartsForTimeZone(now, timeZone);
  if (!d) return 'none';

  const { month, day } = d;

  if (month === RAMADAN) return 'ramadan';

  if (month === SHAWWAL && day >= EID_FITR_START && day <= EID_FITR_END)
    return 'eid-ul-fitr';

  if (month === DHUL_HIJJAH && day >= EID_ADHA_START && day <= EID_ADHA_END)
    return 'eid-ul-adha';

  return 'none';
}
