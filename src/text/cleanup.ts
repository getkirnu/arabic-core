import { removeTashkeel } from './tashkeel';
import { TATWEEL } from './unicode';

/**
 * Remove tatweel / kashida (U+0640) only. Every other character — including tashkeel,
 * spacing and line breaks — is returned exactly as given (no Unicode normalisation).
 */
export function removeTatweel(text: string): string {
  return text.replaceAll(TATWEEL, '');
}

/** Number of tatweel characters in `text`. */
export function countTatweel(text: string): number {
  let n = 0;
  for (const ch of text) if (ch === TATWEEL) n++;
  return n;
}

// ---------------------------------------------------------------------------------------------
// Bidirectional text helpers
// ---------------------------------------------------------------------------------------------

export const LRM = '‎'; // left-to-right mark
export const RLM = '‏'; // right-to-left mark
export const LRI = '⁦'; // left-to-right isolate
export const PDI = '⁩'; // pop directional isolate

/** Invisible directional formatting characters: LRM, RLM, ALM, embeddings/overrides, isolates. */
const BIDI_CONTROLS_RE = /[‎‏؜‪-‮⁦-⁩]/g;

/** Remove all invisible directional formatting characters. */
export function stripBidiControls(text: string): string {
  return text.replace(BIDI_CONTROLS_RE, '');
}

/**
 * A left-to-right run: starts and ends with a Latin letter or Western digit and may contain
 * spaces and common in-word punctuation (e.g. "iPhone 15 Pro", "COVID-19", "user@mail.com",
 * "v2.5"). Arabic-Indic digits are deliberately excluded — browsers already lay them out
 * correctly inside Arabic text.
 */
const LTR_RUN_RE = /[A-Za-z0-9À-ɏ](?:[A-Za-z0-9À-ɏ .,:;@#&+\-_/'’%]*[A-Za-z0-9À-ɏ%])?/g;

export interface FixRtlOptions {
  /** Remove existing directional marks first, so the result is predictable. Default: true. */
  stripExisting?: boolean;
  /** Start every non-empty line with an RLM so the line is laid out right-to-left. Default: true. */
  lineMarks?: boolean;
  /** Wrap Latin/Western-digit runs in LRI…PDI so they don't reorder neighbouring Arabic. Default: true. */
  isolateLtr?: boolean;
}

/**
 * Insert invisible Unicode directional marks so mixed Arabic/English text keeps its order when
 * pasted into apps that guess direction badly (punctuation jumping to the wrong end, English
 * words swapping places). The visible characters never change:
 * `stripBidiControls(fixRtl(x)) === stripBidiControls(x)` for every input.
 * This handles the common cases; it is not a full Unicode bidi algorithm.
 */
export function fixRtl(text: string, options: FixRtlOptions = {}): string {
  const { stripExisting = true, lineMarks = true, isolateLtr = true } = options;
  return text
    .split(/(\r\n|\n|\r)/)
    .map((part, i) => {
      if (i % 2 === 1) return part; // a captured line break
      let line = stripExisting ? stripBidiControls(part) : part;
      if (isolateLtr) line = line.replace(LTR_RUN_RE, (run) => `${LRI}${run}${PDI}`);
      if (lineMarks && line.trim()) line = RLM + line;
      return line;
    })
    .join('');
}

/** Number of directional marks in `text` (used to report what fixRtl inserted). */
export function countBidiControls(text: string): number {
  return text.match(BIDI_CONTROLS_RE)?.length ?? 0;
}

// ---------------------------------------------------------------------------------------------
// Cleaner (character-level) and formatter (line-level)
// ---------------------------------------------------------------------------------------------

/**
 * Invisible characters that commonly sneak in through copy-paste: zero-width space, BOM,
 * soft hyphen, word joiner, and directional marks. ZWNJ/ZWJ (U+200C/U+200D) are kept because
 * they change letter shaping in Arabic-script text.
 */
const INVISIBLE_RE = /[​﻿­⁠‎‏؜‪-‮⁦-⁩]/g;

export interface CleanTextOptions {
  /** Collapse runs of spaces/tabs/NBSP into one space and trim spaces at line edges. Default: true. */
  whitespace?: boolean;
  /** Convert CRLF/CR to LF, keep at most one blank line in a row, trim blank lines at both ends. Default: true. */
  lineBreaks?: boolean;
  /** Remove zero-width spaces, BOM, soft hyphens and directional marks (keeps ZWNJ/ZWJ). Default: false. */
  invisible?: boolean;
  /** Remove tatweel ـ. Default: false. */
  tatweel?: boolean;
  /** Remove tashkeel (via removeTashkeel, which also NFC-normalises). Default: false. */
  tashkeel?: boolean;
}

/** Clean pasted Arabic text with explicit, independent options. Letters are never changed. */
export function cleanText(text: string, options: CleanTextOptions = {}): string {
  const { whitespace = true, lineBreaks = true, invisible = false, tatweel = false, tashkeel = false } = options;
  let out = text;
  if (invisible) out = out.replace(INVISIBLE_RE, '');
  if (tashkeel) out = removeTashkeel(out);
  if (tatweel) out = removeTatweel(out);
  if (lineBreaks) out = out.replace(/\r\n?/g, '\n');
  if (whitespace) out = out.replace(/[^\S\r\n]+/g, ' ').replace(/ *(\r?\n) */g, '$1').replace(/^ +| +$/g, '');
  if (lineBreaks) out = out.replace(/\n{3,}/g, '\n\n').replace(/^\n+|\n+$/g, '');
  return out;
}

export interface FormatTextOptions {
  /** Trim spaces at the start and end of each line. Default: true. */
  trimLines?: boolean;
  /** Collapse runs of spaces/tabs inside lines into one space. Default: false. */
  collapseSpaces?: boolean;
  /** Remove empty (or whitespace-only) lines. Default: false. */
  removeEmptyLines?: boolean;
  /**
   * Join lines:
   * - `'none'` (default): keep lines as they are
   * - `'all'`: join everything into one paragraph
   * - `'paragraphs'`: join lines within each paragraph; paragraphs (separated by blank lines) are kept
   */
  join?: 'none' | 'all' | 'paragraphs';
}

/** Line-level formatting. Line breaks are always normalised to LF first; words are never changed. */
export function formatText(text: string, options: FormatTextOptions = {}): string {
  const { trimLines = true, collapseSpaces = false, removeEmptyLines = false, join = 'none' } = options;
  let lines = text.replace(/\r\n?/g, '\n').split('\n');
  if (collapseSpaces) lines = lines.map((l) => l.replace(/[^\S\n]+/g, ' '));
  if (trimLines) lines = lines.map((l) => l.trim());
  const isEmpty = (l: string) => l.trim() === '';

  if (join === 'all') {
    return lines
      .filter((l) => !isEmpty(l))
      .map((l) => l.trim())
      .join(' ');
  }
  if (join === 'paragraphs') {
    const paragraphs: string[] = [];
    let current: string[] = [];
    for (const l of lines) {
      if (isEmpty(l)) {
        if (current.length) paragraphs.push(current.join(' '));
        current = [];
      } else current.push(l.trim());
    }
    if (current.length) paragraphs.push(current.join(' '));
    return paragraphs.join(removeEmptyLines ? '\n' : '\n\n');
  }
  if (removeEmptyLines) lines = lines.filter((l) => !isEmpty(l));
  return lines.join('\n');
}
