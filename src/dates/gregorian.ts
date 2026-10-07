import type { Calendar, SimpleDate } from './types';

const DAY = 86_400_000;

/** True for a real date in the proleptic Gregorian calendar, years 1–9999 (rejects 30 Feb). */
export function isValidGregorianDate(date: SimpleDate): boolean {
  return gregorian.isValid(date);
}

export function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

const LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Proleptic Gregorian calendar, years 1–9999. */
export const gregorian: Calendar = {
  monthLength(year, month) {
    return month === 2 && isGregorianLeapYear(year) ? 29 : LENGTHS[month - 1]!;
  },
  toDayNumber({ year, month, day }) {
    const d = new Date(0);
    d.setUTCFullYear(year, month - 1, day); // avoids Date.UTC's 0–99 → 1900s mapping
    return Math.round(d.getTime() / DAY);
  },
  fromDayNumber(dayNumber) {
    const d = new Date(dayNumber * DAY);
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
  },
  isValid({ year, month, day }: SimpleDate) {
    return (
      Number.isInteger(year) &&
      Number.isInteger(month) &&
      Number.isInteger(day) &&
      year >= 1 &&
      year <= 9999 &&
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= this.monthLength(year, month)
    );
  },
};
