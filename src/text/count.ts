import { TATWEEL } from './unicode';

/**
 * A word is a run of letters, combining marks, digits, tatweel or zero-width (non-)joiners.
 * Digits joined by `.`, `,`, `٫`, `٬` stay one word (1,250.50), as do hyphenated/apostrophe compounds.
 * Arabic punctuation (، ؛ ؟) and all other symbols separate words.
 */
const WORD_CHAR = '\\p{L}\\p{M}\\p{N}\\u200C\\u200D';
const WORD_RE = new RegExp(
  `[${WORD_CHAR}]+(?:(?:[.,\\u066B\\u066C](?=\\p{N})|['’\\-](?=[${WORD_CHAR}]))[${WORD_CHAR}]+)*`,
  'gu',
);

export function countWords(text: string): number {
  if (!text) return 0;
  return text.normalize('NFC').match(WORD_RE)?.length ?? 0;
}

export interface CharCounts {
  /** All Unicode code points (after NFC; CRLF counted as one line break). */
  characters: number;
  /** Characters excluding all whitespace. */
  charactersNoSpaces: number;
  /** Characters excluding combining marks (tashkeel), i.e. what remains after removing diacritics. */
  charactersNoDiacritics: number;
  /** Letters (any script), excluding tatweel. */
  letters: number;
  /** Letters in the Arabic script (Arabic, Persian, Urdu letters), excluding tatweel. */
  arabicLetters: number;
  /** Letters in the Latin script (A–Z, accented Latin). */
  latinLetters: number;
  /** Combining marks (harakat, shadda, tanween, Quranic small marks, …). */
  diacritics: number;
  /** Decimal digits in any script. */
  digits: number;
  /** Whitespace characters, including line breaks. */
  spaces: number;
  /** Words, as defined by countWords. */
  words: number;
  /** Lines (0 for empty text). */
  lines: number;
  /** Non-empty blocks separated by one or more blank lines. */
  paragraphs: number;
}

const MARK_RE = /\p{M}/u;
const LETTER_RE = /\p{L}/u;
const DIGIT_RE = /\p{Nd}/u;
const SPACE_RE = /\s/u;
const ARABIC_SCRIPT_RE = /\p{Script=Arabic}/u;
const LATIN_SCRIPT_RE = /\p{Script=Latin}/u;

/**
 * Character statistics. Counts are by Unicode code point (not grapheme), which is the
 * convention Arabic editors expect: a letter with a fatha counts as 2 characters, and
 * `charactersNoDiacritics` gives the bare-letter count.
 */
export function countChars(text: string): CharCounts {
  const t = (text ?? '').normalize('NFC').replace(/\r\n?/g, '\n');
  let characters = 0;
  let diacritics = 0;
  let letters = 0;
  let digits = 0;
  let spaces = 0;
  let arabicLetters = 0;
  let latinLetters = 0;

  for (const ch of t) {
    characters++;
    if (MARK_RE.test(ch)) diacritics++;
    else if (SPACE_RE.test(ch)) spaces++;
    else if (DIGIT_RE.test(ch)) digits++;
    else if (ch !== TATWEEL && LETTER_RE.test(ch)) {
      letters++;
      if (ARABIC_SCRIPT_RE.test(ch)) arabicLetters++;
      else if (LATIN_SCRIPT_RE.test(ch)) latinLetters++;
    }
  }

  const trimmed = t.trim();
  return {
    characters,
    charactersNoSpaces: characters - spaces,
    charactersNoDiacritics: characters - diacritics,
    letters,
    arabicLetters,
    latinLetters,
    diacritics,
    digits,
    spaces,
    words: countWords(t),
    lines: t.length === 0 ? 0 : t.split('\n').length,
    paragraphs: trimmed.length === 0 ? 0 : trimmed.split(/\n\s*\n/).length,
  };
}
