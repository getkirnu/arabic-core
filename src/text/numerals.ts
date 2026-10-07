import {
  ARABIC_DECIMAL_SEPARATOR,
  ARABIC_INDIC_DIGITS,
  ARABIC_THOUSANDS_SEPARATOR,
  PERSIAN_DIGITS,
  WESTERN_DIGITS,
} from './unicode';

/**
 * - `toWestern`: ٠-٩ and ۰-۹ → 0-9
 * - `toArabicIndic`: 0-9 and ۰-۹ → ٠-٩
 */
export type NumeralDirection = 'toWestern' | 'toArabicIndic';

export interface ConvertNumeralsOptions {
  /**
   * Also convert separators that sit *between digits*:
   * `.` ↔ ٫ (decimal) and `,` ↔ ٬ (thousands). Punctuation elsewhere is untouched.
   * Default: true.
   */
  separators?: boolean;
}

const toWesternMap = new Map<string, string>();
const toArabicMap = new Map<string, string>();
for (let i = 0; i < 10; i++) {
  const w = WESTERN_DIGITS[i]!;
  const a = ARABIC_INDIC_DIGITS[i]!;
  const p = PERSIAN_DIGITS[i]!;
  toWesternMap.set(a, w).set(p, w);
  toArabicMap.set(w, a).set(p, a);
}

const ANY_DIGIT = '0-9٠-٩۰-۹';
/** A run of digits possibly joined by single separators: 1,250.50 · ١٬٢٥٠٫٥٠ */
const NUMBER_RUN_RE = new RegExp(`[${ANY_DIGIT}]+(?:[.,٫٬][${ANY_DIGIT}]+)*`, 'g');
const DIGIT_RE = new RegExp(`[${ANY_DIGIT}]`, 'g');

/** Convert digits (and, by default, in-number separators) between Western and Arabic-Indic forms. */
export function convertNumerals(
  text: string,
  direction: NumeralDirection,
  options: ConvertNumeralsOptions = {},
): string {
  const { separators = true } = options;
  const map = direction === 'toWestern' ? toWesternMap : toArabicMap;
  const convertDigits = (s: string) => s.replace(DIGIT_RE, (d) => map.get(d) ?? d);

  if (!separators) return convertDigits(text);

  return text.replace(NUMBER_RUN_RE, (run) => {
    let out = convertDigits(run);
    if (direction === 'toWestern') {
      out = out.replaceAll(ARABIC_DECIMAL_SEPARATOR, '.').replaceAll(ARABIC_THOUSANDS_SEPARATOR, ',');
    } else {
      out = out.replaceAll('.', ARABIC_DECIMAL_SEPARATOR).replaceAll(',', ARABIC_THOUSANDS_SEPARATOR);
    }
    return out;
  });
}

/** Shorthand: any digits/separators in `text` to Western form (useful before parsing input). */
export function toWesternDigits(text: string): string {
  return convertNumerals(text, 'toWestern');
}
