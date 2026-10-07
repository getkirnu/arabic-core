import { describe, expect, it } from 'vitest';
import { VERSION } from '../src/index';

describe('arabic-core scaffold', () => {
  it('exports a version', () => {
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('runtime supports the Umm al-Qura calendar (used as a test oracle later)', () => {
    const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: 'UTC',
    });
    // 2024-03-11 = 1 Ramadan 1445 AH (Umm al-Qura)
    const parts = fmt.formatToParts(new Date(Date.UTC(2024, 2, 11)));
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
    expect([get('year'), get('month'), get('day')]).toEqual([1445, 9, 1]);
  });
});
