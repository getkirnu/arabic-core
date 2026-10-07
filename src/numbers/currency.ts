import { CURRENCIES } from './currencies';
import type { CurrencyCode } from './currencies';
import { AND, ZERO, applySpelling, countNoun } from './lexicon';
import type { GrammaticalCase } from './lexicon';
import { parseNumberInput, toMinorUnits } from './parse';
import { TAFGEET_MAX } from './tafgeet';

export interface CurrencyToWordsOptions {
  /** Wrap in cheque format: "فقط … لا غير". Default: false. */
  cheque?: boolean;
  /** Grammatical case of the phrase. Default: nominative. */
  case?: GrammaticalCase;
  /** "مئة" (modern, default) or "مائة" (classic). */
  spelling?: 'modern' | 'classic';
}

/**
 * Amount → Arabic words with the currency and its sub-unit.
 * 1,250.50 SAR → ألف ومئتان وخمسون ريالاً سعودياً وخمسون هللة
 * Pass strings for exact amounts. Fraction digits beyond the currency's precision
 * (2 or 3) are rounded half-up. A zero main amount is omitted (0.50 SAR → خمسون هللة).
 */
export function currencyToWords(
  amount: number | bigint | string,
  currency: CurrencyCode,
  options: CurrencyToWordsOptions = {},
): string {
  const { cheque = false, case: gcase = 'nominative', spelling = 'modern' } = options;
  const def = CURRENCIES[currency];
  if (!def) throw new RangeError(`Unsupported currency: ${String(currency)}`);

  const parsed = parseNumberInput(amount);
  if (parsed.negative && /[1-9]/.test(parsed.integer + parsed.fraction)) {
    throw new RangeError('Negative amounts are not supported');
  }
  const { major, minor } = toMinorUnits(parsed, def.decimals);
  if (major > TAFGEET_MAX) throw new RangeError(`Amounts above ${TAFGEET_MAX} are not supported`);

  const parts = [countNoun(major, def.main, gcase), countNoun(minor, def.sub, gcase)].filter(Boolean);
  let words = parts.length ? parts.join(AND) : `${ZERO} ${def.main.singular.nominative}`;
  if (cheque) words = `فقط ${words} لا غير`;
  return applySpelling(words, spelling);
}
