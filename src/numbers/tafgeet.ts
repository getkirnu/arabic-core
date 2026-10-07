import { ZERO, applySpelling, integerWords } from './lexicon';
import type { Gender, GrammaticalCase } from './lexicon';
import { parseNumberInput } from './parse';

export const TAFGEET_MAX = 999_999_999_999;

export interface TafgeetOptions {
  /** Grammatical gender of the counted noun (3–10 take the opposite form). Default: masculine. */
  gender?: Gender;
  /** Grammatical case of the whole number. Default: nominative. */
  case?: GrammaticalCase;
  /** Wrap in cheque format: "فقط … لا غير". Default: false. */
  cheque?: boolean;
  /** "مئة" (modern, default) or "مائة" (classic). */
  spelling?: 'modern' | 'classic';
}

/**
 * Number → Arabic words (MSA), 0 to 999,999,999,999.
 * Accepts numbers, bigints or strings (any digit script; `,`/`٬` thousands, `.`/`٫` decimal).
 * A fraction is read after "فاصلة" as a whole number, with leading zeros read as "صفر"
 * (12.5 → اثنا عشر فاصلة خمسة; 3.05 → ثلاثة فاصلة صفر خمسة). Negative → "سالب …".
 */
export function tafgeet(input: number | bigint | string, options: TafgeetOptions = {}): string {
  const { gender = 'masculine', case: gcase = 'nominative', cheque = false, spelling = 'modern' } = options;
  const parsed = parseNumberInput(input);
  if (parsed.integer.length > 12) throw new RangeError(`Numbers above ${TAFGEET_MAX} are not supported`);

  const n = Number(parsed.integer);
  let words = n === 0 ? ZERO : integerWords(n, gender, gcase);

  const fraction = parsed.fraction.replace(/0+$/, '');
  if (fraction) {
    if (fraction.length > 12) throw new RangeError('Too many decimal places');
    const leadingZeros = /^0*/.exec(fraction)![0].length;
    const rest = Number(fraction.slice(leadingZeros));
    const fracWords = [...Array<string>(leadingZeros).fill(ZERO), integerWords(rest, gender, gcase)];
    words += ` فاصلة ${fracWords.join(' ')}`;
  }

  if (parsed.negative && (n > 0 || fraction)) words = `سالب ${words}`;
  if (cheque) words = `فقط ${words} لا غير`;
  return applySpelling(words, spelling);
}
