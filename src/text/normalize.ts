import { TATWEEL } from './unicode';

export interface NormalizeArabicOptions {
  /**
   * Hamza/madda alef forms → bare alef ا.
   * أ (U+0623), إ (U+0625), آ (U+0622), ٱ alef wasla (U+0671), ٲ (U+0672), ٳ (U+0673) → ا (U+0627).
   * ؤ, ئ and standalone ء are NOT changed. Default: true.
   */
  alef?: boolean;
  /**
   * Alef maksura ↔ yeh.
   * - `'toYeh'`: every ى (U+0649) → ي (U+064A).
   * - `'toAlefMaksura'`: ي at the END of a word → ى (Egyptian spelling convention).
   * - `'none'`: unchanged.
   * Default: `'toYeh'`.
   */
  yeh?: 'none' | 'toYeh' | 'toAlefMaksura';
  /** Teh marbuta ة (U+0629) → heh ه (U+0647). Lossy; default: false. */
  tehMarbuta?: boolean;
  /** Persian keheh ک (U+06A9) → kaf ك (U+0643); Farsi yeh ی (U+06CC) → yeh ي (U+064A). Default: true. */
  persian?: boolean;
  /** Remove tatweel ـ (U+0640). Default: true. */
  tatweel?: boolean;
  /**
   * Whitespace cleanup: runs of spaces/tabs/NBSP → one space; spaces trimmed at line
   * starts/ends; 3+ line breaks → one blank line; whole text trimmed. Default: true.
   */
  whitespace?: boolean;
}

const ALEF_FORMS_RE = /[آأإٱٲٳ]/g;
/** ي not followed (after optional marks) by another letter = word-final. */
const FINAL_YEH_RE = /ي(?!\p{M}*\p{L})/gu;

/**
 * Normalise Arabic text with independent, documented rules. Input is NFC-normalised first.
 * Rule order: tatweel → persian → alef → yeh → tehMarbuta → whitespace.
 */
export function normalizeArabic(text: string, options: NormalizeArabicOptions = {}): string {
  const {
    alef = true,
    yeh = 'toYeh',
    tehMarbuta = false,
    persian = true,
    tatweel = true,
    whitespace = true,
  } = options;

  let out = text.normalize('NFC');
  if (tatweel) out = out.replaceAll(TATWEEL, '');
  if (persian) out = out.replaceAll('ک', 'ك').replaceAll('ی', 'ي');
  if (alef) out = out.replace(ALEF_FORMS_RE, 'ا');
  if (yeh === 'toYeh') out = out.replaceAll('ى', 'ي');
  else if (yeh === 'toAlefMaksura') out = out.replace(FINAL_YEH_RE, 'ى');
  if (tehMarbuta) out = out.replaceAll('ة', 'ه');
  if (whitespace) out = cleanWhitespace(out);
  return out;
}

function cleanWhitespace(s: string): string {
  return s
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
