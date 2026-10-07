import { gregorian } from './gregorian';
import type { SimpleDate } from './types';

/** Gregorian date `days` days after (negative: before) `date`. Throws for results outside years 1–9999. */
export function addDays(date: SimpleDate, days: number): SimpleDate {
  if (!gregorian.isValid(date)) throw new RangeError('Invalid Gregorian date');
  if (!Number.isInteger(days)) throw new RangeError('Days must be a whole number');
  const result = gregorian.fromDayNumber(gregorian.toDayNumber(date) + days);
  if (result.year < 1 || result.year > 9999) throw new RangeError('Result is outside the supported range');
  return result;
}

/** Signed number of days from `from` to `to` (Gregorian). */
export function daysBetween(from: SimpleDate, to: SimpleDate): number {
  if (!gregorian.isValid(from) || !gregorian.isValid(to)) throw new RangeError('Invalid Gregorian date');
  return gregorian.toDayNumber(to) - gregorian.toDayNumber(from);
}

export interface WorkingDays {
  /** Days in the range that are not weekend days. */
  workingDays: number;
  /** Weekend days in the range. */
  weekendDays: number;
  /** All days counted. */
  totalDays: number;
}

/**
 * Count working days between two Gregorian dates (order-independent).
 * `weekend` lists weekday numbers (0 = Sunday … 6 = Saturday), e.g. [5, 6] for Friday–Saturday.
 * `inclusive` (default true) counts both the start and end dates; false counts only the days
 * strictly between them. Public holidays are NOT considered.
 */
export function countWorkingDays(
  from: SimpleDate,
  to: SimpleDate,
  weekend: readonly number[],
  inclusive = true,
): WorkingDays {
  if (!gregorian.isValid(from) || !gregorian.isValid(to)) throw new RangeError('Invalid Gregorian date');
  let a = gregorian.toDayNumber(from);
  let b = gregorian.toDayNumber(to);
  if (a > b) [a, b] = [b, a];
  if (!inclusive) {
    a += 1;
    b -= 1;
  }
  const totalDays = Math.max(0, b - a + 1);
  const off = new Set(weekend.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6));

  // Whole weeks contribute exactly `off.size` weekend days; count the remainder day by day.
  const fullWeeks = Math.floor(totalDays / 7);
  let weekendDays = fullWeeks * off.size;
  const weekdayOf = (dayNumber: number) => (((dayNumber + 4) % 7) + 7) % 7; // 1970-01-01 was Thursday (4)
  for (let d = a + fullWeeks * 7; d <= b; d++) if (off.has(weekdayOf(d))) weekendDays++;

  return { workingDays: totalDays - weekendDays, weekendDays, totalDays };
}
