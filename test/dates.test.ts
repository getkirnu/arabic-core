import { describe, expect, it } from 'vitest';
import { ageGregorian, ageHijri, dateDifference, hijriDateDifference } from '../src';

const g = (year: number, month: number, day: number) => ({ year, month, day });

describe('dateDifference', () => {
  it('zero for the same date', () => {
    expect(dateDifference(g(2024, 5, 5), g(2024, 5, 5))).toMatchObject({ sign: 0, years: 0, months: 0, days: 0, totalDays: 0 });
  });

  it('years, months, days and totals', () => {
    const d = dateDifference(g(2020, 1, 15), g(2024, 3, 20));
    expect(d).toMatchObject({ sign: 1, years: 4, months: 2, days: 5, totalMonths: 50 });
    expect(d.totalDays).toBe(1526);
    expect(d.totalWeeks).toBe(218);
    expect(d.remainderDays).toBe(0);
  });

  it('borrows days from the right month', () => {
    expect(dateDifference(g(2024, 1, 31), g(2024, 3, 1))).toMatchObject({ months: 1, days: 1 });
    // end-of-month to end-of-month counts as a whole month (day clamped to 28 Feb)
    expect(dateDifference(g(2023, 1, 31), g(2023, 2, 28))).toMatchObject({ months: 1, days: 0 });
    expect(dateDifference(g(2023, 1, 31), g(2023, 2, 27))).toMatchObject({ months: 0, days: 27 });
  });

  it('is symmetric with a negative sign', () => {
    const a = dateDifference(g(2024, 3, 20), g(2020, 1, 15));
    expect(a).toMatchObject({ sign: -1, years: 4, months: 2, days: 5 });
  });

  it('rejects invalid dates', () => {
    expect(() => dateDifference(g(2023, 2, 29), g(2024, 1, 1))).toThrow(RangeError);
  });
});

describe('ageGregorian', () => {
  it('computes age and next birthday', () => {
    const a = ageGregorian(g(1990, 6, 15), g(2024, 3, 10));
    expect(a).toMatchObject({ years: 33, months: 8, days: 24 });
    expect(a.nextBirthday).toEqual(g(2024, 6, 15));
    expect(a.daysUntilNextBirthday).toBe(97);
  });

  it('birthday today', () => {
    const a = ageGregorian(g(2000, 3, 10), g(2024, 3, 10));
    expect(a).toMatchObject({ years: 24, months: 0, days: 0, daysUntilNextBirthday: 0 });
  });

  it('29 February birthdays fall on 28 February in common years', () => {
    expect(ageGregorian(g(2000, 2, 29), g(2023, 1, 1)).nextBirthday).toEqual(g(2023, 2, 28));
  });

  it('rejects a birth date in the future', () => {
    expect(() => ageGregorian(g(2030, 1, 1), g(2024, 1, 1))).toThrow(RangeError);
  });
});

describe('Hijri age and difference', () => {
  it('counts in Hijri months', () => {
    const a = ageHijri(g(1410, 9, 1), g(1445, 9, 1));
    expect(a).toMatchObject({ years: 35, months: 0, days: 0 });
  });

  it('hijriDateDifference', () => {
    expect(hijriDateDifference(g(1445, 1, 1), g(1446, 1, 1))).toMatchObject({ years: 1, months: 0, days: 0 });
  });

  it('rejects Hijri dates outside the table', () => {
    expect(() => ageHijri(g(1300, 1, 1), g(1445, 1, 1))).toThrow(RangeError);
  });
});
