// Public API of @kirnu/arabic-core.
export const VERSION = '0.1.1';

export { convertNumerals, toWesternDigits } from './text/numerals';
export type { NumeralDirection, ConvertNumeralsOptions } from './text/numerals';

export { countWords, countChars } from './text/count';
export type { CharCounts } from './text/count';

export { removeTashkeel } from './text/tashkeel';
export type { RemoveTashkeelOptions } from './text/tashkeel';

export {
  removeTatweel,
  countTatweel,
  stripBidiControls,
  fixRtl,
  countBidiControls,
  cleanText,
  formatText,
  LRM,
  RLM,
  LRI,
  PDI,
} from './text/cleanup';
export type { FixRtlOptions, CleanTextOptions, FormatTextOptions } from './text/cleanup';

export { normalizeArabic } from './text/normalize';
export type { NormalizeArabicOptions } from './text/normalize';

export { tafgeet, TAFGEET_MAX } from './numbers/tafgeet';
export type { TafgeetOptions } from './numbers/tafgeet';
export type { Gender, GrammaticalCase } from './numbers/lexicon';

export { currencyToWords } from './numbers/currency';
export type { CurrencyToWordsOptions } from './numbers/currency';
export { CURRENCIES } from './numbers/currencies';
export type { CurrencyCode, CurrencyDefinition } from './numbers/currencies';

export { parseNumberInput, toMinorUnits } from './numbers/parse';
export type { ParsedNumber } from './numbers/parse';

export type { SimpleDate } from './dates/types';
export {
  hijriToGregorian,
  gregorianToHijri,
  hijriMonthLength,
  isValidHijriDate,
  weekday,
  HIJRI_RANGE,
  HijriRangeError,
} from './dates/hijri';
export { isGregorianLeapYear, isValidGregorianDate } from './dates/gregorian';
export { dateDifference, hijriDateDifference } from './dates/diff';
export type { DateDifference } from './dates/diff';
export { ageGregorian, ageHijri } from './dates/age';
export { addDays, daysBetween, countWorkingDays } from './dates/arithmetic';
export type { WorkingDays } from './dates/arithmetic';
export type { Age } from './dates/age';
export { HIJRI_MONTHS, GREGORIAN_MONTHS, SYRIAC_MONTHS, WEEKDAYS } from './dates/names';
