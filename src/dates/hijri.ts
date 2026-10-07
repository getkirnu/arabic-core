import { gregorian } from './gregorian';
import type { Calendar, SimpleDate } from './types';
import { UMQ_EPOCH_DAY, UMQ_FIRST_YEAR, UMQ_LAST_YEAR, UMQ_MONTH_BITS } from './ummalqura-data';

/** Day number of 1 Muharram for each covered year, plus one past the end. */
const YEAR_START: number[] = [UMQ_EPOCH_DAY];
for (const bits of UMQ_MONTH_BITS) {
  let len = 0;
  for (let m = 0; m < 12; m++) len += bits & (1 << m) ? 30 : 29;
  YEAR_START.push(YEAR_START[YEAR_START.length - 1]! + len);
}
const FIRST_DAY = UMQ_EPOCH_DAY;
const LAST_DAY = YEAR_START[YEAR_START.length - 1]! - 1;

export class HijriRangeError extends RangeError {
  constructor(message = `Date is outside the supported Umm al-Qura range (${UMQ_FIRST_YEAR}–${UMQ_LAST_YEAR} AH)`) {
    super(message);
    this.name = 'HijriRangeError';
  }
}

function monthLength(year: number, month: number): number {
  const bits = UMQ_MONTH_BITS[year - UMQ_FIRST_YEAR];
  if (bits === undefined || month < 1 || month > 12) throw new HijriRangeError();
  return bits & (1 << (month - 1)) ? 30 : 29;
}

/** Hijri (Umm al-Qura) calendar backed by the bundled table. */
export const hijri: Calendar = {
  monthLength,
  toDayNumber({ year, month, day }) {
    if (!hijri.isValid({ year, month, day })) throw new HijriRangeError('Invalid or unsupported Hijri date');
    let dn = YEAR_START[year - UMQ_FIRST_YEAR]!;
    for (let m = 1; m < month; m++) dn += monthLength(year, m);
    return dn + day - 1;
  },
  fromDayNumber(dayNumber) {
    if (dayNumber < FIRST_DAY || dayNumber > LAST_DAY) throw new HijriRangeError();
    // Binary search the year.
    let lo = 0;
    let hi = UMQ_MONTH_BITS.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (YEAR_START[mid]! <= dayNumber) lo = mid;
      else hi = mid - 1;
    }
    const year = UMQ_FIRST_YEAR + lo;
    let rest = dayNumber - YEAR_START[lo]!;
    let month = 1;
    while (rest >= monthLength(year, month)) {
      rest -= monthLength(year, month);
      month++;
    }
    return { year, month, day: rest + 1 };
  },
  isValid({ year, month, day }) {
    return (
      Number.isInteger(year) &&
      Number.isInteger(month) &&
      Number.isInteger(day) &&
      year >= UMQ_FIRST_YEAR &&
      year <= UMQ_LAST_YEAR &&
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= monthLength(year, month)
    );
  },
};

/** Supported range of the Umm al-Qura table, in both calendars. */
export const HIJRI_RANGE: {
  readonly hijri: { readonly first: SimpleDate; readonly last: SimpleDate };
  readonly gregorian: { readonly first: SimpleDate; readonly last: SimpleDate };
} = {
  hijri: {
    first: { year: UMQ_FIRST_YEAR, month: 1, day: 1 },
    last: { year: UMQ_LAST_YEAR, month: 12, day: monthLength(UMQ_LAST_YEAR, 12) },
  },
  gregorian: { first: gregorian.fromDayNumber(FIRST_DAY), last: gregorian.fromDayNumber(LAST_DAY) },
};

/** Hijri (Umm al-Qura) → Gregorian. Throws HijriRangeError for invalid/out-of-range dates. */
export function hijriToGregorian(date: SimpleDate): SimpleDate {
  return gregorian.fromDayNumber(hijri.toDayNumber(date));
}

/** Gregorian → Hijri (Umm al-Qura). Throws for invalid dates or dates outside 1924-08-02 … 2077-11-16. */
export function gregorianToHijri(date: SimpleDate): SimpleDate {
  if (!gregorian.isValid(date)) throw new RangeError('Invalid Gregorian date');
  return hijri.fromDayNumber(gregorian.toDayNumber(date));
}

export function hijriMonthLength(year: number, month: number): number {
  return monthLength(year, month);
}

export function isValidHijriDate(date: SimpleDate): boolean {
  return hijri.isValid(date);
}

/** Day of week, 0 = Sunday … 6 = Saturday, for a Gregorian date. */
export function weekday(date: SimpleDate): number {
  return (((gregorian.toDayNumber(date) + 4) % 7) + 7) % 7; // 1970-01-01 was a Thursday
}
