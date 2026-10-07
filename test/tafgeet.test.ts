import { describe, expect, it } from 'vitest';
import { tafgeet } from '../src';
import { TAFGEET_CASES } from './fixtures/tafgeet.cases';

describe('tafgeet fixtures', () => {
  it.each(TAFGEET_CASES.map((c) => [`${String(c.input)} ${JSON.stringify(c.options ?? {})}`, c] as const))(
    '%s',
    (_, c) => {
      expect(tafgeet(c.input, c.options)).toBe(c.expected);
    },
  );

  it('covers every number listed in the brief', () => {
    const brief = TAFGEET_CASES.filter((c) => c.brief).map((c) => Number(c.input));
    expect(brief).toEqual([1, 2, 3, 11, 21, 200, 2000, 3000, 102, 1001011, 1000002]);
  });
});

describe('tafgeet input handling', () => {
  it('accepts bigint', () => {
    expect(tafgeet(5n)).toBe('خمسة');
  });

  it('accepts Persian digits and Arabic separators', () => {
    expect(tafgeet('۲٬۰۰۰')).toBe('ألفان');
  });

  it('treats -0 as zero', () => {
    expect(tafgeet('-0')).toBe('صفر');
  });

  it('rejects invalid input', () => {
    expect(() => tafgeet('abc')).toThrow(SyntaxError);
    expect(() => tafgeet('')).toThrow(SyntaxError);
    expect(() => tafgeet(Number.NaN)).toThrow(RangeError);
  });

  it('rejects numbers beyond the supported range', () => {
    expect(() => tafgeet('1000000000000')).toThrow(RangeError);
    expect(() => tafgeet(1e21)).toThrow(RangeError);
  });
});

describe('tafgeet grammar invariants', () => {
  // Exhaustive structural checks over 1..9999 (not a substitute for editor review).
  const all = Array.from({ length: 9999 }, (_, i) => i + 1);

  it('never produces empty output, double spaces or dangling "و"', () => {
    for (const n of all) {
      const w = tafgeet(n);
      expect(w, String(n)).not.toMatch(/^\s|\s$|\s{2}|و$| و /);
    }
  });

  it('uses the plural آلاف exactly for 3–10 thousand (+ remainders)', () => {
    for (const n of all) {
      const k = Math.floor(n / 1000);
      expect(tafgeet(n).includes('آلاف'), String(n)).toBe(k >= 3 && k <= 10);
    }
  });

  it('every output for 1..9999 is distinct', () => {
    expect(new Set(all.map((n) => tafgeet(n))).size).toBe(all.length);
  });
});
