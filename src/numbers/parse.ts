import { toWesternDigits } from '../text/numerals';

export interface ParsedNumber {
  negative: boolean;
  /** Integer digits, no leading zeros ("0" for zero). */
  integer: string;
  /** Fraction digits exactly as typed ("" when none). */
  fraction: string;
}

/**
 * Parse user/number input without going through floating point.
 * Accepts Western, Arabic-Indic and Persian digits. `,` `٬` spaces and `_` are treated as
 * thousands separators and removed; `.` or `٫` is the decimal separator.
 */
export function parseNumberInput(input: number | bigint | string): ParsedNumber {
  let s: string;
  if (typeof input === 'number') {
    if (!Number.isFinite(input)) throw new RangeError('Number must be finite');
    s = String(input);
    if (/e/i.test(s)) throw new RangeError('Number is out of the supported range');
  } else if (typeof input === 'bigint') {
    s = input.toString();
  } else {
    s = toWesternDigits(input)
      .trim()
      .replace(/[\s,_٬   ]/g, '')
      .replace(/٫/g, '.')
      .replace(/^[−–]/, '-');
  }

  const m = /^([-+])?(\d*)(?:\.(\d*))?$/.exec(s);
  if (!m || ((m[2] ?? '') === '' && (m[3] ?? '') === '')) {
    throw new SyntaxError(`Not a valid number: "${String(input)}"`);
  }
  const integer = (m[2] ?? '').replace(/^0+(?=\d)/, '') || '0';
  return { negative: m[1] === '-', integer, fraction: m[3] ?? '' };
}

/**
 * Split a parsed amount into whole units and minor units for a currency with
 * `decimals` fraction digits (2 → 1/100, 3 → 1/1000). Extra digits are rounded half-up.
 */
export function toMinorUnits(parsed: ParsedNumber, decimals: number): { major: number; minor: number } {
  const base = 10 ** decimals;
  let major = Number(parsed.integer);
  const padded = parsed.fraction.padEnd(decimals, '0');
  let minor = Number(padded.slice(0, decimals) || '0');
  const next = padded.charCodeAt(decimals) - 48; // first dropped digit, NaN if none
  if (next >= 5) {
    minor += 1;
    if (minor === base) {
      minor = 0;
      major += 1;
    }
  }
  return { major, minor };
}
