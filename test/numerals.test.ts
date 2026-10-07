import { describe, expect, it } from 'vitest';
import { convertNumerals, toWesternDigits } from '../src';

describe('convertNumerals', () => {
  it('converts Arabic-Indic digits to Western', () => {
    expect(convertNumerals('٠١٢٣٤٥٦٧٨٩', 'toWestern')).toBe('0123456789');
  });

  it('converts Persian/Urdu digits to Western', () => {
    expect(convertNumerals('۰۱۲۳۴۵۶۷۸۹', 'toWestern')).toBe('0123456789');
  });

  it('converts Western and Persian digits to Arabic-Indic', () => {
    expect(convertNumerals('0123456789', 'toArabicIndic')).toBe('٠١٢٣٤٥٦٧٨٩');
    expect(convertNumerals('۴۵', 'toArabicIndic')).toBe('٤٥');
  });

  it('converts separators only inside numbers', () => {
    expect(convertNumerals('السعر 1,250.50 ريال.', 'toArabicIndic')).toBe('السعر ١٬٢٥٠٫٥٠ ريال.');
    expect(convertNumerals('المبلغ ١٬٢٥٠٫٥٠، شكراً.', 'toWestern')).toBe('المبلغ 1,250.50، شكراً.');
  });

  it('leaves sentence punctuation next to numbers alone', () => {
    expect(convertNumerals('Items: 1, 2, 3.', 'toArabicIndic')).toBe('Items: ١, ٢, ٣.');
  });

  it('can skip separator conversion', () => {
    expect(convertNumerals('1,250.50', 'toArabicIndic', { separators: false })).toBe('١,٢٥٠.٥٠');
  });

  it('is a round trip for mixed text', () => {
    const src = 'رقم الهاتف 0501234567 والمبلغ 19.99 درهم';
    expect(convertNumerals(convertNumerals(src, 'toArabicIndic'), 'toWestern')).toBe(src);
  });

  it('leaves text without digits unchanged', () => {
    expect(convertNumerals('مرحبا بالعالم', 'toWestern')).toBe('مرحبا بالعالم');
    expect(convertNumerals('', 'toArabicIndic')).toBe('');
  });

  it('toWesternDigits helper', () => {
    expect(toWesternDigits('١٬٠٠٠٫٢٥')).toBe('1,000.25');
  });
});
