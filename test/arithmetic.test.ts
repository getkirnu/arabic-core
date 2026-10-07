import { describe, expect, it } from 'vitest';
import { addDays, countWorkingDays, daysBetween, weekday } from '../src';

const g = (year: number, month: number, day: number) => ({ year, month, day });
const FRI_SAT = [5, 6];
const SAT_SUN = [6, 0];

describe('addDays', () => {
  it('adds and subtracts across month, year and leap-day boundaries', () => {
    expect(addDays(g(2024, 1, 31), 1)).toEqual(g(2024, 2, 1));
    expect(addDays(g(2024, 2, 28), 1)).toEqual(g(2024, 2, 29)); // leap year
    expect(addDays(g(2023, 2, 28), 1)).toEqual(g(2023, 3, 1)); // common year
    expect(addDays(g(2024, 12, 31), 1)).toEqual(g(2025, 1, 1));
    expect(addDays(g(2025, 1, 1), -1)).toEqual(g(2024, 12, 31));
    expect(addDays(g(2024, 3, 1), -1)).toEqual(g(2024, 2, 29));
    expect(addDays(g(2024, 1, 1), 0)).toEqual(g(2024, 1, 1));
  });
  it('large offsets', () => {
    expect(addDays(g(2000, 1, 1), 10_000)).toEqual(g(2027, 5, 19));
    expect(addDays(g(2024, 1, 1), 366)).toEqual(g(2025, 1, 1));
  });
  it('rejects invalid input and out-of-range results', () => {
    expect(() => addDays(g(2023, 2, 29), 1)).toThrow(RangeError);
    expect(() => addDays(g(2024, 1, 1), 1.5)).toThrow(RangeError);
    expect(() => addDays(g(9999, 12, 31), 1)).toThrow(RangeError);
  });
});

describe('daysBetween', () => {
  it('signed day counts', () => {
    expect(daysBetween(g(2024, 1, 1), g(2024, 12, 31))).toBe(365);
    expect(daysBetween(g(2024, 12, 31), g(2024, 1, 1))).toBe(-365);
    expect(daysBetween(g(2024, 3, 11), g(2024, 3, 11))).toBe(0);
  });
});

describe('countWorkingDays', () => {
  it('one full week: 5 working days for any 2-day weekend', () => {
    // 2024-03-10 is a Sunday
    expect(weekday(g(2024, 3, 10))).toBe(0);
    expect(countWorkingDays(g(2024, 3, 10), g(2024, 3, 16), FRI_SAT)).toEqual({ workingDays: 5, weekendDays: 2, totalDays: 7 });
    expect(countWorkingDays(g(2024, 3, 10), g(2024, 3, 16), SAT_SUN)).toEqual({ workingDays: 5, weekendDays: 2, totalDays: 7 });
  });
  it('the chosen weekend matters for partial weeks', () => {
    // Sun 10 → Thu 14 March 2024
    expect(countWorkingDays(g(2024, 3, 10), g(2024, 3, 14), FRI_SAT).workingDays).toBe(5);
    expect(countWorkingDays(g(2024, 3, 10), g(2024, 3, 14), SAT_SUN).workingDays).toBe(4);
  });
  it('matches a day-by-day count over long ranges', () => {
    const from = g(2023, 11, 17);
    const to = g(2025, 2, 3);
    const brute = (weekend: number[]) => {
      let n = 0;
      for (let i = 0; i <= daysBetween(from, to); i++) if (!weekend.includes(weekday(addDays(from, i)))) n++;
      return n;
    };
    for (const w of [FRI_SAT, SAT_SUN, [5], [], [0, 1, 2, 3, 4, 5, 6]]) {
      expect(countWorkingDays(from, to, w).workingDays, JSON.stringify(w)).toBe(brute(w));
    }
  });
  it('order-independent; same day; exclusive mode', () => {
    expect(countWorkingDays(g(2024, 3, 16), g(2024, 3, 10), FRI_SAT).workingDays).toBe(5);
    expect(countWorkingDays(g(2024, 3, 11), g(2024, 3, 11), FRI_SAT)).toEqual({ workingDays: 1, weekendDays: 0, totalDays: 1 });
    expect(countWorkingDays(g(2024, 3, 15), g(2024, 3, 15), FRI_SAT)).toEqual({ workingDays: 0, weekendDays: 1, totalDays: 1 });
    expect(countWorkingDays(g(2024, 3, 10), g(2024, 3, 16), FRI_SAT, false)).toEqual({ workingDays: 4, weekendDays: 1, totalDays: 5 });
    expect(countWorkingDays(g(2024, 3, 10), g(2024, 3, 11), FRI_SAT, false).totalDays).toBe(0);
  });
  it('leap-year February', () => {
    expect(countWorkingDays(g(2024, 2, 1), g(2024, 2, 29), FRI_SAT).totalDays).toBe(29);
  });
  it('ignores invalid weekday numbers; rejects invalid dates', () => {
    expect(countWorkingDays(g(2024, 3, 10), g(2024, 3, 16), [7, -1, 5.5]).workingDays).toBe(7);
    expect(() => countWorkingDays(g(2024, 2, 30), g(2024, 3, 1), FRI_SAT)).toThrow(RangeError);
  });
});
