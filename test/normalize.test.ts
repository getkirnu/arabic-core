import { describe, expect, it } from 'vitest';
import { normalizeArabic } from '../src';

const only = (o: Parameters<typeof normalizeArabic>[1]) => ({
  alef: false,
  yeh: 'none' as const,
  tehMarbuta: false,
  persian: false,
  tatweel: false,
  whitespace: false,
  ...o,
});

describe('normalizeArabic — each rule in isolation', () => {
  it('alef: hamza/madda/wasla forms → ا', () => {
    expect(normalizeArabic('أحمد إسلام آمن ٱلله', only({ alef: true }))).toBe('احمد اسلام امن الله');
  });

  it('alef: leaves ؤ ئ ء alone', () => {
    expect(normalizeArabic('مؤمن قائد سماء', only({ alef: true }))).toBe('مؤمن قائد سماء');
  });

  it('alef: composes decomposed hamza first', () => {
    expect(normalizeArabic('أحمد', only({ alef: true }))).toBe('احمد');
  });

  it('yeh toYeh: ى → ي everywhere', () => {
    expect(normalizeArabic('على مستشفى', only({ yeh: 'toYeh' }))).toBe('علي مستشفي');
  });

  it('yeh toAlefMaksura: only word-final ي → ى', () => {
    expect(normalizeArabic('علي في بيت', only({ yeh: 'toAlefMaksura' }))).toBe('على فى بيت');
    expect(normalizeArabic('فيه', only({ yeh: 'toAlefMaksura' }))).toBe('فيه');
  });

  it('yeh toAlefMaksura: a final ي carrying a mark is still final', () => {
    expect(normalizeArabic('عليَّ', only({ yeh: 'toAlefMaksura' }))).toBe('علىَّ');
  });

  it('tehMarbuta: ة → ه', () => {
    expect(normalizeArabic('مدرسة جميلة', only({ tehMarbuta: true }))).toBe('مدرسه جميله');
  });

  it('persian: ک → ك and ی → ي', () => {
    expect(normalizeArabic('کتاب علی', only({ persian: true }))).toBe('كتاب علي');
  });

  it('tatweel: removed', () => {
    expect(normalizeArabic('الســـلام', only({ tatweel: true }))).toBe('السلام');
  });

  it('whitespace: collapses spaces, trims lines, limits blank lines', () => {
    const input = '  السلام \t  عليكم  \r\n\r\n\r\n\r\n  ورحمة   الله  ';
    expect(normalizeArabic(input, only({ whitespace: true }))).toBe('السلام عليكم\n\nورحمة الله');
  });
});

describe('normalizeArabic — defaults', () => {
  it('applies alef, toYeh, persian, tatweel and whitespace; keeps ة', () => {
    expect(normalizeArabic('  أهلاً   بالســـيدة  علی  مستشفى  ')).toBe('اهلاً بالسيدة علي مستشفي');
  });

  it('does not remove tashkeel (that is removeTashkeel’s job)', () => {
    expect(normalizeArabic('مُحَمَّد')).toBe('مُحَمَّد');
  });

  it('is idempotent', () => {
    const once = normalizeArabic('أَنا   في  المدرسـة');
    expect(normalizeArabic(once)).toBe(once);
  });
});
