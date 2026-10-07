import { gregorian } from './gregorian';
import { hijri } from './hijri';
import type { Calendar, SimpleDate } from './types';

export interface DateDifference {
  /** +1 when `to` is after `from`, -1 when before, 0 when equal. */
  sign: -1 | 0 | 1;
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  /** Days left over after whole weeks. */
  remainderDays: number;
  totalMonths: number;
}

/** Add whole months, clamping the day to the target month's length (31 Jan + 1 month → 28/29 Feb). */
export function addMonths(cal: Calendar, date: SimpleDate, months: number): SimpleDate {
  const index = date.year * 12 + (date.month - 1) + months;
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return { year, month, day: Math.min(date.day, cal.monthLength(year, month)) };
}

/** Years/months/days between two dates of the same calendar (order-independent; see `sign`). */
export function diffInCalendar(cal: Calendar, from: SimpleDate, to: SimpleDate): DateDifference {
  if (!cal.isValid(from) || !cal.isValid(to)) throw new RangeError('Invalid date');
  let a = from;
  let b = to;
  const dayA = cal.toDayNumber(a);
  const dayB = cal.toDayNumber(b);
  const sign = dayA === dayB ? 0 : dayA < dayB ? 1 : -1;
  if (sign < 0) [a, b] = [b, a];

  let totalMonths = (b.year - a.year) * 12 + (b.month - a.month);
  if (totalMonths > 0 && cal.toDayNumber(addMonths(cal, a, totalMonths)) > cal.toDayNumber(b)) totalMonths--;
  const anchor = addMonths(cal, a, totalMonths);
  const days = cal.toDayNumber(b) - cal.toDayNumber(anchor);
  const totalDays = Math.abs(dayB - dayA);

  return {
    sign,
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days,
    totalDays,
    totalWeeks: Math.floor(totalDays / 7),
    remainderDays: totalDays % 7,
    totalMonths,
  };
}

/** Difference between two Gregorian dates. */
export function dateDifference(from: SimpleDate, to: SimpleDate): DateDifference {
  return diffInCalendar(gregorian, from, to);
}

/** Difference between two Hijri (Umm al-Qura) dates, counted in Hijri months/years. */
export function hijriDateDifference(from: SimpleDate, to: SimpleDate): DateDifference {
  return diffInCalendar(hijri, from, to);
}
