import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { currencyToWords, gregorianToHijri, normalizeArabic, removeTashkeel, tafgeet } from '../src';

// The quick-start examples in README.md are what developers copy first (and what npm shows), so
// each one must print exactly what the README says.
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

describe('README quick-start examples', () => {
  const h = gregorianToHijri({ year: 2024, month: 3, day: 11 });
  const cases: [call: string, actual: string][] = [
    ['tafgeet(1001011);', tafgeet(1001011)],
    ["currencyToWords('1250.50', 'SAR', { cheque: true });", currencyToWords('1250.50', 'SAR', { cheque: true })],
    ["removeTashkeel('مُحَمَّدٌ');", removeTashkeel('مُحَمَّدٌ')],
    ["normalizeArabic('أحمد  علی');", normalizeArabic('أحمد  علی')],
    ['gregorianToHijri({ year: 2024, month: 3, day: 11 });', `{ year: ${h.year}, month: ${h.month}, day: ${h.day} }`],
  ];

  it.each(cases)('%s', (call, actual) => {
    expect(readme, `README no longer shows ${call}`).toContain(call);
    // The result is shown either as a // comment on the same line or on the next line.
    const at = readme.indexOf(call);
    const shown = readme.slice(at, readme.indexOf('\n', readme.indexOf('\n', at) + 1));
    expect(shown.replace(/\s+/g, ' ')).toContain(actual.replace(/\s+/g, ' '));
  });
});
