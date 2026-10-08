import { describe, expect, it } from 'vitest';
import { CURRENCIES, currencyToWords, parseNumberInput, toMinorUnits } from '../src';
import { CURRENCY_CASES } from './fixtures/tafgeet.cases';

describe('currencyToWords fixtures', () => {
  it.each(CURRENCY_CASES.map((c) => [`${c.amount} ${c.currency}${c.cheque ? ' cheque' : ''}`, c] as const))(
    '%s',
    (_, c) => {
      expect(currencyToWords(c.amount, c.currency, { cheque: c.cheque })).toBe(c.expected);
    },
  );

  it('covers every amount listed in the brief', () => {
    const brief = CURRENCY_CASES.filter((c) => c.brief).map((c) => `${c.amount} ${c.currency}`);
    expect(brief).toEqual(['0.50 SAR', '3.03 SAR', '19.99 AED', '1.250 KWD']);
  });
});

describe('currencyToWords behaviour', () => {
  it('uses 1000 sub-units for KWD, BHD and OMR and 100 for the rest', () => {
    expect(CURRENCIES.KWD.decimals).toBe(3);
    expect(CURRENCIES.BHD.decimals).toBe(3);
    expect(CURRENCIES.OMR.decimals).toBe(3);
    for (const code of ['SAR', 'AED', 'EGP', 'QAR'] as const) expect(CURRENCIES[code].decimals).toBe(2);
  });

  it('does not suffer floating-point drift for number input', () => {
    // هللة is feminine → تسع وتسعون
    expect(currencyToWords(19.99, 'SAR')).toBe('تسعة عشر ريالاً سعودياً وتسع وتسعون هللة');
    expect(currencyToWords(0.1 + 0.2, 'SAR')).toBe('ثلاثون هللة');
  });

  it('supports classic spelling', () => {
    expect(currencyToWords('200', 'SAR', { spelling: 'classic' })).toBe('مائتا ريال سعودي');
  });

  it('rejects negative amounts and unknown currencies', () => {
    expect(() => currencyToWords('-5', 'SAR')).toThrow(RangeError);
    // @ts-expect-error unsupported code
    expect(() => currencyToWords('5', 'USD')).toThrow(RangeError);
  });
});

describe('toMinorUnits', () => {
  it('pads, truncates and rounds half-up with carry', () => {
    expect(toMinorUnits(parseNumberInput('1.5'), 2)).toEqual({ major: 1, minor: 50 });
    expect(toMinorUnits(parseNumberInput('1.234'), 2)).toEqual({ major: 1, minor: 23 });
    expect(toMinorUnits(parseNumberInput('1.235'), 2)).toEqual({ major: 1, minor: 24 });
    expect(toMinorUnits(parseNumberInput('9.9999'), 3)).toEqual({ major: 10, minor: 0 });
    expect(toMinorUnits(parseNumberInput('7'), 3)).toEqual({ major: 7, minor: 0 });
  });
});

describe('scale words before the currency noun (reviewed 2026-10-08)', () => {
  it('drops the tanween of ألف/مليون when the currency follows', () => {
    expect(currencyToWords('11000', 'SAR')).toBe('أحد عشر ألف ريال سعودي');
    expect(currencyToWords('150000', 'SAR')).toBe('مئة وخمسون ألف ريال سعودي');
    expect(currencyToWords('11000000', 'SAR')).toBe('أحد عشر مليون ريال سعودي');
  });
  it('repeats the scale for hundreds + 1 or 2 so the amount cannot read as a sum', () => {
    expect(currencyToWords('101000', 'SAR')).toBe('مئة ألف وألف ريال سعودي');
    expect(currencyToWords('102000', 'SAR')).toBe('مئة ألف وألفا ريال سعودي');
    expect(currencyToWords('102500', 'SAR')).toBe('مئة ألف وألفان وخمسمئة ريال سعودي');
  });
  it('leaves the other forms unchanged', () => {
    expect(currencyToWords('2000', 'SAR')).toBe('ألفا ريال سعودي');
    expect(currencyToWords('3000', 'SAR')).toBe('ثلاثة آلاف ريال سعودي');
    expect(currencyToWords('1250.50', 'SAR')).toBe('ألف ومئتان وخمسون ريالاً سعودياً وخمسون هللة');
  });
});
