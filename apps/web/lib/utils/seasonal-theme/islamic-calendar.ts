export type IslamicDateParts = {
  month: number; // 1..12 (Muharram..Dhu al-Hijjah)
  day: number;   // 1..30
  year: number;
};

/**
 * Saudi Arabia / Gulf states use the Umm al-Qura calculated calendar.
 * South Asia (India, Pakistan, Bangladesh) typically follows local sighting,
 * which is usually 1 day behind Umm al-Qura.
 * Southeast Asia (Indonesia, Malaysia) is similar to South Asia.
 * The rest of the world largely follows one of these two conventions.
 */
function getCalendarForTimezone(timeZone: string): 'islamic-umalqura' | 'islamic' {
  // Rough mapping of timezone prefixes/names to region conventions
  const southAsiaZones = [
    'Asia/Kolkata', 'Asia/Calcutta', 'Asia/Karachi', 'Asia/Dhaka',
    'Asia/Colombo', 'Asia/Kathmandu', 'Asia/Kabul',
    'Asia/Rangoon', 'Asia/Yangon',
    'Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura',
    'Asia/Kuala_Lumpur', 'Asia/Singapore',
    'Asia/Bangkok', 'Asia/Phnom_Penh', 'Asia/Vientiane',
    'Asia/Ho_Chi_Minh', 'Asia/Saigon',
  ];

  if (southAsiaZones.includes(timeZone)) return 'islamic';
  return 'islamic-umalqura';
}

/**
 * South Asian regions (India, Pakistan, Indonesia, etc.) typically observe
 * moon sighting 1 day after Saudi/Gulf. We model this by querying the
 * Umm al-Qura date and subtracting one day for those regions.
 */
function isSouthAsianRegion(timeZone: string): boolean {
  return getCalendarForTimezone(timeZone) === 'islamic';
}

function getIslamicDateWithCalendar(
  date: Date,
  timeZone: string,
  calendar: string
): IslamicDateParts | null {
  try {
    const dtf = new Intl.DateTimeFormat(`en-u-ca-${calendar}`, {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      numberingSystem: 'latn',
    });

    const parts = dtf.formatToParts(date);
    const get = (type: string) => {
      const p = parts.find((p) => p.type === type);
      if (!p) return null;
      const n = Number(p.value);
      return Number.isFinite(n) ? n : null;
    };

    const year = get('year');
    const month = get('month');
    const day = get('day');
    if (year == null || month == null || day == null) return null;
    return { year, month, day };
  } catch {
    return null;
  }
}

/**
 * Returns the Islamic date for a given timezone, accounting for regional
 * moon-sighting conventions:
 * - Saudi / Gulf → Umm al-Qura calendar (official Saudi civil calendar)
 * - South Asia / SE Asia → typically 1 day behind Saudi
 * - Other timezones → Umm al-Qura (reasonable approximation)
 */
export function getIslamicDatePartsForTimeZone(
  date: Date,
  timeZone: string
): IslamicDateParts | null {
  if (isSouthAsianRegion(timeZone)) {
    // Get the Saudi (Umm al-Qura) date for YESTERDAY in that timezone.
    // This models the typical 1-day-later sighting for South Asia.
    const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
    return getIslamicDateWithCalendar(yesterday, timeZone, 'islamic-umalqura');
  }

  return getIslamicDateWithCalendar(date, timeZone, 'islamic-umalqura');
}
