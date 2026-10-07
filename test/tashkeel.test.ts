import { describe, expect, it } from 'vitest';
import { removeTashkeel } from '../src';
import { ALWAYS_PRESERVED, QURANIC_MARKS } from '../src/text/unicode';

describe('removeTashkeel', () => {
  it('removes harakat, tanween, shadda and sukun', () => {
    expect(removeTashkeel('مُحَمَّدٌ رَسُولُ اللَّهِ')).toBe('محمد رسول الله');
    expect(removeTashkeel('كِتَابًا مَدْرَسَةٍ')).toBe('كتابا مدرسة');
  });

  it('removes superscript alef U+0670', () => {
    expect(removeTashkeel('هٰذَا')).toBe('هذا');
  });

  it('removes every code point in U+064B–U+065F', () => {
    let all = 'ب';
    for (let cp = 0x064b; cp <= 0x065f; cp++) all += String.fromCodePoint(cp);
    expect(removeTashkeel(all)).toBe('ب');
  });

  it('keeps hamza from decomposed input (NFC first)', () => {
    // ا + U+0654 HAMZA ABOVE → أ ; ا + U+0655 HAMZA BELOW → إ ; ا + U+0653 MADDA → آ ; و + U+0654 → ؤ ; ي + U+0654 → ئ
    expect(removeTashkeel('أحمد')).toBe('أحمد');
    expect(removeTashkeel('إسلام')).toBe('إسلام');
    expect(removeTashkeel('آمن')).toBe('آمن');
    expect(removeTashkeel('مؤمن')).toBe('مؤمن');
    expect(removeTashkeel('ئس')).toBe('ئس');
    // decomposed hamza plus harakat
    expect(removeTashkeel('أَحْمَد')).toBe('أحمد');
  });

  it('preserves U+06DD END OF AYAH (and the other always-preserved marks) under all options', () => {
    const ayah = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝١';
    expect(removeTashkeel(ayah)).toBe('بسم الله الرحمن الرحيم ۝١');
    const sample = `ب${ALWAYS_PRESERVED.join('')}`;
    for (const honorifics of [true, false])
      for (const quranicMarks of [true, false])
        for (const tatweel of [true, false])
          expect(removeTashkeel(sample, { honorifics, quranicMarks, tatweel })).toBe(sample);
  });

  it('removes honorifics by default and keeps them when disabled', () => {
    const t = 'محمدؐ';
    expect(removeTashkeel(t)).toBe('محمد');
    expect(removeTashkeel(t, { honorifics: false })).toBe(t);
  });

  it('removes the explicit Quranic mark list by default, keeps it when disabled', () => {
    const marks = QURANIC_MARKS.join('');
    expect(removeTashkeel(`قال${marks}`)).toBe('قال');
    // NFC reorders stacked marks by combining class, so compare against the NFC form.
    expect(removeTashkeel(`قال${marks}`, { quranicMarks: false })).toBe(`قال${marks}`.normalize('NFC'));
  });

  it('preserves unlisted marks in the Quranic block (e.g. U+06E9 place of sajdah)', () => {
    expect(removeTashkeel('سجدة ۩')).toBe('سجدة ۩');
  });

  it('keeps tatweel by default and removes it on request', () => {
    expect(removeTashkeel('الســـلام')).toBe('الســـلام');
    expect(removeTashkeel('الســـلام', { tatweel: true })).toBe('السلام');
  });

  it('leaves Latin, digits and punctuation untouched', () => {
    expect(removeTashkeel('Kirnu 2024، نَعَم!')).toBe('Kirnu 2024، نعم!');
  });

  it('is idempotent', () => {
    const once = removeTashkeel('قُلْ هُوَ اللَّهُ أَحَدٌ');
    expect(removeTashkeel(once)).toBe(once);
  });
});
