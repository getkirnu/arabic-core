/**
 * Named Arabic code points and ranges. Every rule elsewhere in the library refers
 * to these names so the exact characters touched are auditable in one place.
 */

export const TATWEEL = 'ـ';

/** Western (ASCII) digits 0–9. */
export const WESTERN_DIGITS = '0123456789';
/** Arabic-Indic digits ٠–٩ (U+0660–U+0669). */
export const ARABIC_INDIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
/** Extended Arabic-Indic (Persian/Urdu) digits ۰–۹ (U+06F0–U+06F9). */
export const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** Arabic decimal separator ٫ (U+066B). */
export const ARABIC_DECIMAL_SEPARATOR = '٫';
/** Arabic thousands separator ٬ (U+066C). */
export const ARABIC_THOUSANDS_SEPARATOR = '٬';

/**
 * Harakat and related marks removed by removeTashkeel by default:
 * U+064B–U+0652 (tanween, fatha, damma, kasra, shadda, sukun),
 * U+0653–U+065F (maddah above, hamza above/below, and other small marks),
 * U+0670 (superscript alef).
 */
export const HARAKAT_RE = /[ً-ٰٟ]/g;

/** Honorifics / Quranic-ligature signs U+0610–U+061A (e.g. ﷺ-style small marks). */
export const HONORIFICS_RE = /[ؐ-ؚ]/g;

/**
 * Quranic annotation marks removed by removeTashkeel — an EXPLICIT list.
 * Anything in the U+06D6–U+06ED block that is not listed here is preserved.
 * Always preserved (never listed): U+06DD END OF AYAH, U+06DE START OF RUB EL HIZB,
 * U+06E5 SMALL WAW, U+06E6 SMALL YEH, U+06E9 PLACE OF SAJDAH.
 */
export const QURANIC_MARKS: readonly string[] = [
  'ۖ', // SMALL HIGH LIGATURE SAD WITH LAM WITH ALEF MAKSURA
  'ۗ', // SMALL HIGH LIGATURE QAF WITH LAM WITH ALEF MAKSURA
  'ۘ', // SMALL HIGH MEEM INITIAL FORM
  'ۙ', // SMALL HIGH LAM ALEF
  'ۚ', // SMALL HIGH JEEM
  'ۛ', // SMALL HIGH THREE DOTS
  'ۜ', // SMALL HIGH SEEN
  '۟', // SMALL HIGH ROUNDED ZERO
  '۠', // SMALL HIGH UPRIGHT RECTANGULAR ZERO
  'ۡ', // SMALL HIGH DOTLESS HEAD OF KHAH
  'ۢ', // SMALL HIGH MEEM ISOLATED FORM
  'ۣ', // SMALL LOW SEEN
  'ۤ', // SMALL HIGH MADDA
  'ۧ', // SMALL HIGH YEH
  'ۨ', // SMALL HIGH NOON
  '۪', // EMPTY CENTRE LOW STOP
  '۫', // EMPTY CENTRE HIGH STOP
  '۬', // ROUNDED HIGH STOP WITH FILLED CENTRE
  'ۭ', // SMALL LOW MEEM
];

/** Code points that must survive removeTashkeel under every option combination. */
export const ALWAYS_PRESERVED: readonly string[] = ['۝', '۞', 'ۥ', 'ۦ'];

export const QURANIC_MARKS_RE = new RegExp(`[${QURANIC_MARKS.join('')}]`, 'g');
