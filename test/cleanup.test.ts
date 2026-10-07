import { describe, expect, it } from 'vitest';
import {
  LRI,
  PDI,
  RLM,
  cleanText,
  countBidiControls,
  countChars,
  countTatweel,
  fixRtl,
  formatText,
  removeTatweel,
  stripBidiControls,
} from '../src';

describe('removeTatweel', () => {
  it('removes U+0640 only', () => {
    expect(removeTatweel('الســـلام عليكـــم')).toBe('السلام عليكم');
    expect(countTatweel('الســـلام عليكـــم')).toBe(6);
  });

  it('returns text without tatweel unchanged', () => {
    expect(removeTatweel('السلام عليكم')).toBe('السلام عليكم');
    expect(removeTatweel('')).toBe('');
  });

  it('keeps tashkeel, English, digits, punctuation, spacing and line breaks exactly', () => {
    const input = 'مُـحَـمَّد  Kirnu 2025،\r\nسطـر ثانٍ!';
    expect(removeTatweel(input)).toBe('مُحَمَّد  Kirnu 2025،\r\nسطر ثانٍ!');
  });

  it('does not normalise Unicode (decomposed hamza stays decomposed)', () => {
    expect(removeTatweel('أـحمد')).toBe('أحمد');
  });
});

describe('fixRtl', () => {
  const samples = [
    'اشتريت iPhone 15 Pro بسعر 4,999 ريال.',
    'راسلنا على info@getkirnu.com أو عبر الموقع.',
    'الإصدار v2.5 متاح الآن!',
    'سطر أول\nLine two English\n\nسطر ثالث (COVID-19)',
    '٢٠٢٥ عام جيد',
    '',
  ];

  it('never changes the visible characters', () => {
    for (const s of samples) expect(stripBidiControls(fixRtl(s))).toBe(s);
  });

  it('isolates Latin/number runs and marks each non-empty line', () => {
    expect(fixRtl('اشتريت iPhone 15 Pro بسعر')).toBe(`${RLM}اشتريت ${LRI}iPhone 15 Pro${PDI} بسعر`);
    expect(fixRtl('سطر\n\nآخر')).toBe(`${RLM}سطر\n\n${RLM}آخر`);
  });

  it('keeps trailing Arabic punctuation outside the isolate', () => {
    expect(fixRtl('السعر 50.')).toBe(`${RLM}السعر ${LRI}50${PDI}.`);
  });

  it('options are independent', () => {
    expect(fixRtl('نص Kirnu', { lineMarks: false })).toBe(`نص ${LRI}Kirnu${PDI}`);
    expect(fixRtl('نص Kirnu', { isolateLtr: false })).toBe(`${RLM}نص Kirnu`);
  });

  it('strips existing marks first (idempotent) unless told not to', () => {
    const once = fixRtl('نص Kirnu');
    expect(fixRtl(once)).toBe(once);
    expect(countBidiControls(fixRtl(once, { stripExisting: false }))).toBeGreaterThan(countBidiControls(once));
  });

  it('leaves Arabic-Indic digits alone and preserves CRLF line breaks', () => {
    expect(fixRtl('عام ٢٠٢٥', { lineMarks: false })).toBe('عام ٢٠٢٥');
    expect(fixRtl('أ\r\nب')).toBe(`${RLM}أ\r\n${RLM}ب`);
  });
});

describe('cleanText', () => {
  it('defaults: collapse spaces, trim line edges, normalise line breaks, keep letters', () => {
    expect(cleanText('  السلام   عليكم \t ورحمة  \r\n\r\n\r\n\r\nالله  ')).toBe('السلام عليكم ورحمة\n\nالله');
  });

  it('does not remove tatweel, tashkeel or invisible characters unless asked', () => {
    const t = 'مُحَمَّد الســلام​هنا';
    expect(cleanText(t)).toBe(t);
    expect(cleanText(t, { tatweel: true })).toBe('مُحَمَّد السلام​هنا');
    expect(cleanText(t, { tashkeel: true })).toBe('محمد الســلام​هنا');
    expect(cleanText(t, { invisible: true })).toBe('مُحَمَّد الســلامهنا');
  });

  it('invisible: removes ZWSP, BOM, soft hyphen and bidi marks but keeps ZWNJ/ZWJ', () => {
    expect(cleanText('﻿نص­‏⁦x⁩', { invisible: true })).toBe('نصx');
    expect(cleanText('می‌خواهم', { invisible: true })).toBe('می‌خواهم');
  });

  it('options can be switched off', () => {
    expect(cleanText('a  b\r\n\r\n\r\nc', { whitespace: false, lineBreaks: false })).toBe('a  b\r\n\r\n\r\nc');
  });

  it('handles empty and whitespace-only input; is idempotent', () => {
    expect(cleanText('')).toBe('');
    expect(cleanText('   \n\n  ')).toBe('');
    const once = cleanText('  نص  مع   مسافات  \n\n\n\nسطر  ');
    expect(cleanText(once)).toBe(once);
  });
});

describe('formatText', () => {
  const input = '  السطر الأول  \n   السطر الثاني\n\n\n  فقرة   ثانية  \nتكملة';

  it('default only trims lines (non-destructive)', () => {
    expect(formatText(input)).toBe('السطر الأول\nالسطر الثاني\n\n\nفقرة   ثانية\nتكملة');
  });

  it('removes empty lines', () => {
    expect(formatText(input, { removeEmptyLines: true })).toBe('السطر الأول\nالسطر الثاني\nفقرة   ثانية\nتكملة');
  });

  it('collapses spaces inside lines', () => {
    expect(formatText('a   b\t\tc', { collapseSpaces: true })).toBe('a b c');
  });

  it('joins all lines into one paragraph', () => {
    expect(formatText(input, { join: 'all', collapseSpaces: true })).toBe('السطر الأول السطر الثاني فقرة ثانية تكملة');
  });

  it('joins lines within paragraphs and keeps paragraphs', () => {
    expect(formatText(input, { join: 'paragraphs', collapseSpaces: true })).toBe(
      'السطر الأول السطر الثاني\n\nفقرة ثانية تكملة',
    );
    expect(formatText(input, { join: 'paragraphs', removeEmptyLines: true })).toBe(
      'السطر الأول السطر الثاني\nفقرة   ثانية تكملة',
    );
  });

  it('normalises CRLF; empty input stays empty', () => {
    expect(formatText('أ\r\nب\rج')).toBe('أ\nب\nج');
    expect(formatText('')).toBe('');
  });

  it('keeps English, digits and punctuation untouched', () => {
    expect(formatText(' Kirnu 2025: «أدوات»! ')).toBe('Kirnu 2025: «أدوات»!');
  });
});

describe('countChars — script counts', () => {
  it('counts Arabic and Latin letters separately', () => {
    const c = countChars('كرنو Kirnu ٢٠٢٥ 2025');
    expect(c.arabicLetters).toBe(4);
    expect(c.latinLetters).toBe(5);
    expect(c.digits).toBe(8);
  });

  it('excludes tatweel and tashkeel from Arabic letters; counts Persian letters as Arabic script', () => {
    const c = countChars('مُحَمَّـد گچ');
    expect(c.arabicLetters).toBe(6);
    expect(c.letters).toBe(6);
  });

  it('accented Latin counts as Latin', () => {
    expect(countChars('café').latinLetters).toBe(4);
  });
});
