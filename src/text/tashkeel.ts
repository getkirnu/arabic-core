import { HARAKAT_RE, HONORIFICS_RE, QURANIC_MARKS_RE, TATWEEL } from './unicode';

export interface RemoveTashkeelOptions {
  /** Remove honorific signs U+0610–U+061A. Default: true. */
  honorifics?: boolean;
  /** Remove Quranic annotation marks (explicit list in unicode.ts). Default: true. */
  quranicMarks?: boolean;
  /** Remove tatweel U+0640 (ـ). Default: false. */
  tatweel?: boolean;
}

/**
 * Remove Arabic diacritics.
 *
 * 1. `text.normalize('NFC')` first — so a decomposed hamza (ا + U+0654) becomes أ
 *    and is not stripped by step 2.
 * 2. Always removes U+064B–U+0652, U+0653–U+065F and U+0670.
 * 3. Optionally removes honorifics, Quranic marks and tatweel (see options).
 *
 * U+06DD, U+06DE, U+06E5 and U+06E6 are never removed.
 */
export function removeTashkeel(text: string, options: RemoveTashkeelOptions = {}): string {
  const { honorifics = true, quranicMarks = true, tatweel = false } = options;
  let out = text.normalize('NFC').replace(HARAKAT_RE, '');
  if (honorifics) out = out.replace(HONORIFICS_RE, '');
  if (quranicMarks) out = out.replace(QURANIC_MARKS_RE, '');
  if (tatweel) out = out.replaceAll(TATWEEL, '');
  return out;
}
