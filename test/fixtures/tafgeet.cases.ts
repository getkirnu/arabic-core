/**
 * Expected outputs for tafgeet / currencyToWords.
 *
 * status:
 *   'TODO-VERIFY' — written by the developer from MSA rules; awaiting a native Arabic editor.
 *   'approved'    — confirmed by the editor (record who/when in `note`).
 * `brief: true` marks the cases listed in BRIEF.md.
 */
import type { CurrencyCode, TafgeetOptions } from '../../src';

export type Status = 'TODO-VERIFY' | 'approved';

export interface TafgeetCase {
  input: number | string;
  options?: TafgeetOptions;
  expected: string;
  status: Status;
  brief?: boolean;
  note?: string;
}

export interface CurrencyCase {
  amount: string;
  currency: CurrencyCode;
  cheque?: boolean;
  expected: string;
  status: Status;
  brief?: boolean;
  note?: string;
}

export const TAFGEET_CASES: TafgeetCase[] = [
  // — Brief cases —
  { input: 1, expected: 'واحد', status: 'TODO-VERIFY', brief: true },
  { input: 2, expected: 'اثنان', status: 'TODO-VERIFY', brief: true },
  { input: 3, expected: 'ثلاثة', status: 'TODO-VERIFY', brief: true },
  { input: 11, expected: 'أحد عشر', status: 'TODO-VERIFY', brief: true },
  { input: 21, expected: 'واحد وعشرون', status: 'TODO-VERIFY', brief: true },
  { input: 200, expected: 'مئتان', status: 'TODO-VERIFY', brief: true },
  { input: 2000, expected: 'ألفان', status: 'TODO-VERIFY', brief: true },
  { input: 3000, expected: 'ثلاثة آلاف', status: 'TODO-VERIFY', brief: true },
  { input: 102, expected: 'مئة واثنان', status: 'TODO-VERIFY', brief: true },
  { input: 1001011, expected: 'مليون وألف وأحد عشر', status: 'TODO-VERIFY', brief: true },
  { input: 1000002, expected: 'مليون واثنان', status: 'TODO-VERIFY', brief: true },

  // — Additional coverage —
  { input: 0, expected: 'صفر', status: 'TODO-VERIFY' },
  { input: 10, expected: 'عشرة', status: 'TODO-VERIFY' },
  { input: 12, expected: 'اثنا عشر', status: 'TODO-VERIFY' },
  { input: 18, expected: 'ثمانية عشر', status: 'TODO-VERIFY' },
  { input: 99, expected: 'تسعة وتسعون', status: 'TODO-VERIFY' },
  { input: 100, expected: 'مئة', status: 'TODO-VERIFY' },
  { input: 101, expected: 'مئة وواحد', status: 'TODO-VERIFY' },
  { input: 800, expected: 'ثمانمئة', status: 'TODO-VERIFY' },
  { input: 999, expected: 'تسعمئة وتسعة وتسعون', status: 'TODO-VERIFY' },
  { input: 1000, expected: 'ألف', status: 'TODO-VERIFY' },
  { input: 1250, expected: 'ألف ومئتان وخمسون', status: 'TODO-VERIFY' },
  { input: 10000, expected: 'عشرة آلاف', status: 'TODO-VERIFY' },
  { input: 11000, expected: 'أحد عشر ألفاً', status: 'TODO-VERIFY' },
  { input: 25000, expected: 'خمسة وعشرون ألفاً', status: 'TODO-VERIFY' },
  { input: 100000, expected: 'مئة ألف', status: 'TODO-VERIFY' },
  { input: 200000, expected: 'مئتا ألف', status: 'TODO-VERIFY', note: 'dual in construct' },
  { input: 101000, expected: 'مئة ألف وألف', status: 'TODO-VERIFY', note: 'scale repeated so it cannot read as 1,100 (reviewed 2026-10-08)' },
  { input: 102000, expected: 'مئة ألف وألفان', status: 'TODO-VERIFY', note: 'scale repeated so it cannot read as 2,100 (reviewed 2026-10-08)' },
  { input: 103000, expected: 'مئة وثلاثة آلاف', status: 'TODO-VERIFY' },
  { input: 2000000, expected: 'مليونان', status: 'TODO-VERIFY' },
  { input: 3000000, expected: 'ثلاثة ملايين', status: 'TODO-VERIFY' },
  { input: 15000000, expected: 'خمسة عشر مليوناً', status: 'TODO-VERIFY' },
  { input: 1000000000, expected: 'مليار', status: 'TODO-VERIFY' },
  { input: 3000000000, expected: 'ثلاثة مليارات', status: 'TODO-VERIFY' },
  {
    input: 999999999999,
    expected:
      'تسعمئة وتسعة وتسعون ملياراً وتسعمئة وتسعة وتسعون مليوناً وتسعمئة وتسعة وتسعون ألفاً وتسعمئة وتسعة وتسعون',
    status: 'TODO-VERIFY',
  },

  // Feminine counted noun
  { input: 1, options: { gender: 'feminine' }, expected: 'واحدة', status: 'TODO-VERIFY' },
  { input: 2, options: { gender: 'feminine' }, expected: 'اثنتان', status: 'TODO-VERIFY' },
  { input: 3, options: { gender: 'feminine' }, expected: 'ثلاث', status: 'TODO-VERIFY' },
  { input: 8, options: { gender: 'feminine' }, expected: 'ثماني', status: 'TODO-VERIFY' },
  { input: 11, options: { gender: 'feminine' }, expected: 'إحدى عشرة', status: 'TODO-VERIFY' },
  { input: 12, options: { gender: 'feminine' }, expected: 'اثنتا عشرة', status: 'TODO-VERIFY' },
  { input: 13, options: { gender: 'feminine' }, expected: 'ثلاث عشرة', status: 'TODO-VERIFY' },
  { input: 21, options: { gender: 'feminine' }, expected: 'إحدى وعشرون', status: 'TODO-VERIFY' },
  { input: 3003, options: { gender: 'feminine' }, expected: 'ثلاثة آلاف وثلاث', status: 'TODO-VERIFY', note: 'scale nouns stay masculine' },

  // Accusative / genitive
  { input: 2, options: { case: 'accusative' }, expected: 'اثنين', status: 'TODO-VERIFY' },
  { input: 12, options: { case: 'genitive' }, expected: 'اثني عشر', status: 'TODO-VERIFY' },
  { input: 20, options: { case: 'accusative' }, expected: 'عشرين', status: 'TODO-VERIFY' },
  { input: 200, options: { case: 'accusative' }, expected: 'مئتين', status: 'TODO-VERIFY' },
  { input: 2000, options: { case: 'genitive' }, expected: 'ألفين', status: 'TODO-VERIFY' },

  // Spelling, cheque, input formats, fractions, sign
  { input: 300, options: { spelling: 'classic' }, expected: 'ثلاثمائة', status: 'TODO-VERIFY' },
  { input: 102, options: { cheque: true }, expected: 'فقط مئة واثنان لا غير', status: 'TODO-VERIFY' },
  { input: '١٢٣', expected: 'مئة وثلاثة وعشرون', status: 'TODO-VERIFY' },
  { input: '1,250', expected: 'ألف ومئتان وخمسون', status: 'TODO-VERIFY' },
  { input: '12.5', expected: 'اثنا عشر فاصلة خمسة', status: 'TODO-VERIFY' },
  { input: '3.05', expected: 'ثلاثة فاصلة صفر خمسة', status: 'TODO-VERIFY' },
  { input: '12.50', expected: 'اثنا عشر فاصلة خمسة', status: 'TODO-VERIFY', note: 'trailing zeros dropped' },
  { input: -5, expected: 'سالب خمسة', status: 'TODO-VERIFY' },
];

export const CURRENCY_CASES: CurrencyCase[] = [
  // — Brief cases —
  { amount: '0.50', currency: 'SAR', expected: 'خمسون هللة', status: 'TODO-VERIFY', brief: true },
  { amount: '3.03', currency: 'SAR', expected: 'ثلاثة ريالات سعودية وثلاث هللات', status: 'TODO-VERIFY', brief: true },
  {
    amount: '19.99',
    currency: 'AED',
    expected: 'تسعة عشر درهماً إماراتياً وتسعة وتسعون فلساً',
    status: 'TODO-VERIFY',
    brief: true,
  },
  {
    amount: '1.250',
    currency: 'KWD',
    expected: 'دينار كويتي واحد ومئتان وخمسون فلساً',
    status: 'TODO-VERIFY',
    brief: true,
  },

  // — Additional coverage —
  {
    amount: '1250.50',
    currency: 'SAR',
    cheque: true,
    expected: 'فقط ألف ومئتان وخمسون ريالاً سعودياً وخمسون هللة لا غير',
    status: 'TODO-VERIFY',
    note: 'homepage live example',
  },
  { amount: '1', currency: 'SAR', expected: 'ريال سعودي واحد', status: 'TODO-VERIFY' },
  { amount: '2', currency: 'SAR', expected: 'ريالان سعوديان', status: 'TODO-VERIFY' },
  { amount: '0.01', currency: 'SAR', expected: 'هللة واحدة', status: 'TODO-VERIFY' },
  { amount: '0.02', currency: 'SAR', expected: 'هللتان', status: 'TODO-VERIFY' },
  { amount: '100', currency: 'SAR', expected: 'مئة ريال سعودي', status: 'TODO-VERIFY' },
  { amount: '200', currency: 'SAR', expected: 'مئتا ريال سعودي', status: 'TODO-VERIFY', note: 'dual in construct' },
  { amount: '2000', currency: 'SAR', expected: 'ألفا ريال سعودي', status: 'TODO-VERIFY', note: 'dual in construct' },
  { amount: '3000', currency: 'SAR', expected: 'ثلاثة آلاف ريال سعودي', status: 'TODO-VERIFY' },
  { amount: '1000000', currency: 'SAR', expected: 'مليون ريال سعودي', status: 'TODO-VERIFY' },
  { amount: '102', currency: 'SAR', expected: 'مئة وريالان سعوديان', status: 'TODO-VERIFY', note: 'strict MSA (decision G)' },
  { amount: '0', currency: 'SAR', expected: 'صفر ريال سعودي', status: 'TODO-VERIFY' },
  { amount: '5', currency: 'AED', expected: 'خمسة دراهم إماراتية', status: 'TODO-VERIFY' },
  { amount: '25.75', currency: 'EGP', expected: 'خمسة وعشرون جنيهاً مصرياً وخمسة وسبعون قرشاً', status: 'TODO-VERIFY' },
  { amount: '10.10', currency: 'QAR', expected: 'عشرة ريالات قطرية وعشرة دراهم', status: 'TODO-VERIFY' },
  { amount: '3.500', currency: 'BHD', expected: 'ثلاثة دنانير بحرينية وخمسمئة فلس', status: 'TODO-VERIFY' },
  { amount: '7.003', currency: 'OMR', expected: 'سبعة ريالات عمانية وثلاث بيسات', status: 'TODO-VERIFY' },
  { amount: '19.995', currency: 'SAR', expected: 'عشرون ريالاً سعودياً', status: 'TODO-VERIFY', note: 'rounded half-up' },
  { amount: '١٬٢٥٠٫٥٠', currency: 'SAR', expected: 'ألف ومئتان وخمسون ريالاً سعودياً وخمسون هللة', status: 'TODO-VERIFY' },
];
