import { describe, expect, it } from 'vitest';
import {
  HIJRI_RANGE,
  HijriRangeError,
  gregorianToHijri,
  hijriMonthLength,
  hijriToGregorian,
  isValidHijriDate,
  weekday,
} from '../src';
import { gregorian } from '../src/dates/gregorian';

const DAY = 86_400_000;
const oracle = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  timeZone: 'UTC',
});
function intlHijri(dayNumber: number) {
  const parts = oracle.formatToParts(new Date(dayNumber * DAY));
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  return { year: get('year'), month: get('month'), day: get('day') };
}

describe('Umm al-Qura conversion', () => {
  it('covers 1343–1500 AH = 1924-08-02 … 2077-11-16', () => {
    expect(HIJRI_RANGE.hijri.first).toEqual({ year: 1343, month: 1, day: 1 });
    expect(HIJRI_RANGE.hijri.last).toEqual({ year: 1500, month: 12, day: 30 });
    expect(HIJRI_RANGE.gregorian.first).toEqual({ year: 1924, month: 8, day: 2 });
    expect(HIJRI_RANGE.gregorian.last).toEqual({ year: 2077, month: 11, day: 16 });
  });

  it('known anchors', () => {
    expect(gregorianToHijri({ year: 2024, month: 3, day: 11 })).toEqual({ year: 1445, month: 9, day: 1 });
    expect(hijriToGregorian({ year: 1446, month: 1, day: 1 })).toEqual({ year: 2024, month: 7, day: 7 });
    expect(gregorianToHijri({ year: 2000, month: 1, day: 1 })).toEqual({ year: 1420, month: 9, day: 24 });
  });

  it('matches Intl islamic-umalqura for EVERY day in range, and round-trips', () => {
    const first = gregorian.toDayNumber(HIJRI_RANGE.gregorian.first);
    const last = gregorian.toDayNumber(HIJRI_RANGE.gregorian.last);
    let checked = 0;
    for (let d = first; d <= last; d++) {
      const g = gregorian.fromDayNumber(d);
      const h = gregorianToHijri(g);
      const expected = intlHijri(d);
      if (h.year !== expected.year || h.month !== expected.month || h.day !== expected.day) {
        throw new Error(`Mismatch on ${JSON.stringify(g)}: got ${JSON.stringify(h)}, Intl ${JSON.stringify(expected)}`);
      }
      const back = hijriToGregorian(h);
      if (back.year !== g.year || back.month !== g.month || back.day !== g.day) {
        throw new Error(`Round-trip failed for ${JSON.stringify(g)}`);
      }
      checked++;
    }
    expect(checked).toBeGreaterThan(55_000);
  });

  it('month lengths are 29 or 30', () => {
    for (let y = 1343; y <= 1500; y++)
      for (let m = 1; m <= 12; m++) expect([29, 30]).toContain(hijriMonthLength(y, m));
  });

  it('validates Hijri dates', () => {
    expect(isValidHijriDate({ year: 1445, month: 9, day: 30 })).toBe(hijriMonthLength(1445, 9) === 30);
    expect(isValidHijriDate({ year: 1445, month: 13, day: 1 })).toBe(false);
    expect(isValidHijriDate({ year: 1445, month: 1, day: 0 })).toBe(false);
    expect(isValidHijriDate({ year: 1342, month: 12, day: 1 })).toBe(false);
  });

  it('throws HijriRangeError outside the table', () => {
    expect(() => hijriToGregorian({ year: 1501, month: 1, day: 1 })).toThrow(HijriRangeError);
    expect(() => gregorianToHijri({ year: 1900, month: 1, day: 1 })).toThrow(HijriRangeError);
    expect(() => gregorianToHijri({ year: 2024, month: 2, day: 30 })).toThrow(RangeError);
  });

  it('weekday', () => {
    expect(weekday({ year: 2024, month: 3, day: 11 })).toBe(1); // Monday
    expect(weekday({ year: 1970, month: 1, day: 1 })).toBe(4); // Thursday
  });
});
