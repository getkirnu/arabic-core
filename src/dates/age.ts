import { addMonths, diffInCalendar } from './diff';
import { gregorian } from './gregorian';
import { hijri } from './hijri';
import type { Calendar, SimpleDate } from './types';

export interface Age {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  /** Next birthday in the same calendar (29 Feb / 30th of a 29-day month → last day of that month). */
  nextBirthday: SimpleDate;
  daysUntilNextBirthday: number;
}

function ageIn(cal: Calendar, birth: SimpleDate, on: SimpleDate): Age {
  const d = diffInCalendar(cal, birth, on);
  if (d.sign < 0) throw new RangeError('Birth date is after the reference date');

  let next = addMonths(cal, birth, (d.years + 1) * 12);
  if (d.months === 0 && d.days === 0 && d.years > 0) next = on; // today is the birthday
  const daysUntil = cal.toDayNumber(next) - cal.toDayNumber(on);

  return {
    years: d.years,
    months: d.months,
    days: d.days,
    totalDays: d.totalDays,
    totalWeeks: d.totalWeeks,
    totalMonths: d.totalMonths,
    nextBirthday: next,
    daysUntilNextBirthday: daysUntil,
  };
}

/** Age in Gregorian years/months/days on date `on`. */
export function ageGregorian(birth: SimpleDate, on: SimpleDate): Age {
  return ageIn(gregorian, birth, on);
}

/** Age in Hijri (Umm al-Qura) years/months/days; both dates are Hijri. */
export function ageHijri(birth: SimpleDate, on: SimpleDate): Age {
  return ageIn(hijri, birth, on);
}
