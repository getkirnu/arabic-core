import { describe, expect, it } from 'vitest';
import { countChars, countWords } from '../src';

describe('countWords', () => {
  it('counts simple Arabic words', () => {
    expect(countWords('السلام عليكم ورحمة الله')).toBe(4);
  });

  it('handles empty and whitespace-only input', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   \n\t ')).toBe(0);
  });

  it('does not split words on tashkeel or tatweel', () => {
    expect(countWords('مُحَمَّدٌ رَسُولُ اللَّهِ')).toBe(3);
    expect(countWords('الســـلام عليكم')).toBe(2);
  });

  it('splits on Arabic punctuation', () => {
    expect(countWords('نعم،لا؛ربما؟حسناً')).toBe(4);
  });

  it('keeps numbers with separators as one word', () => {
    expect(countWords('المبلغ 1,250.50 ريال')).toBe(3);
    expect(countWords('المبلغ ١٬٢٥٠٫٥٠ ريال')).toBe(3);
  });

  it('keeps hyphenated words together and ignores standalone symbols', () => {
    expect(countWords('e-mail - test')).toBe(2);
  });

  it('counts mixed Arabic and Latin', () => {
    expect(countWords('أداة Kirnu للنصوص')).toBe(3);
  });

  it('treats decomposed and composed forms the same', () => {
    expect(countWords('أحمد')).toBe(countWords('أحمد'));
  });
});

describe('countChars', () => {
  it('returns zeros for empty text', () => {
    const c = countChars('');
    expect(c).toMatchObject({ characters: 0, words: 0, lines: 0, paragraphs: 0 });
  });

  it('counts characters with and without spaces', () => {
    const c = countChars('كرنو أداة');
    expect(c.characters).toBe(9);
    expect(c.charactersNoSpaces).toBe(8);
    expect(c.spaces).toBe(1);
    expect(c.letters).toBe(8);
    expect(c.words).toBe(2);
  });

  it('counts diacritics separately', () => {
    // مُحَمَّد = م ُ ح َ م َّ د → 4 letters + 4 marks (damma, fatha, shadda, fatha)
    const c = countChars('مُحَمَّد');
    expect(c.letters).toBe(4);
    expect(c.diacritics).toBe(4);
    expect(c.characters).toBe(8);
    expect(c.charactersNoDiacritics).toBe(4);
  });

  it('does not count tatweel as a letter', () => {
    const c = countChars('اســلام');
    expect(c.letters).toBe(5);
    expect(c.characters).toBe(7);
  });

  it('counts digits in any script', () => {
    expect(countChars('2024 ١٤٤٥').digits).toBe(8);
  });

  it('counts lines and paragraphs, CRLF as one break', () => {
    const c = countChars('سطر أول\r\nسطر ثان\n\n\nفقرة ثانية');
    expect(c.lines).toBe(5);
    expect(c.paragraphs).toBe(2);
  });

  it('normalises decomposed hamza before counting', () => {
    expect(countChars('أ').characters).toBe(1);
  });
});
