/**
 * Arabic number grammar (Modern Standard Arabic).
 *
 * Every number–noun phrase is built by `countNoun`, which applies the counted-noun rules:
 *   1        → the noun alone (its "one" form)            ألف · ريال سعودي واحد
 *   2        → dual                                        ألفان · ريالان سعوديان
 *   3–10     → number (opposite gender) + genitive plural  ثلاثة آلاف · ثلاث هللات
 *   11–99    → number + accusative singular (tamyiz)       أحد عشر ألفاً · خمسون هللة
 *   ×100 (last two digits 00) → number + genitive singular مئة ألف · ثلاثة آلاف ريال
 * For larger numbers the noun follows the LAST part, except that a scale with hundreds + 1 or 2 repeats the scale
 * word so the amount can't be read as a sum: 101 thousand → مئة ألف وألف, 102 thousand → مئة ألف وألفان.
 * A noun directly following the number puts the last scale in construct: مئتا ألف · ألفا ريال · أحد عشر ألف ريال.
 */

export type Gender = 'masculine' | 'feminine';
export type GrammaticalCase = 'nominative' | 'accusative' | 'genitive';

export interface CaseForms {
  nominative: string;
  accusative: string;
  genitive: string;
}

export interface CountedNoun {
  gender: Gender;
  /** "One X" — for scales the bare noun (ألف), for currencies noun + واحد. */
  one: CaseForms;
  /** Singular; accusative is used as tamyiz after 11–99, genitive after hundreds. */
  singular: CaseForms;
  dual: CaseForms;
  /** Dual in construct (number directly followed by a noun): ألفا / ألفي. */
  dualConstruct?: CaseForms;
  /** Genitive plural used after 3–10. */
  plural: string;
}

export const cf = (nominative: string, accusative: string, genitive: string = nominative): CaseForms => ({
  nominative,
  accusative,
  genitive,
});

const scale = (sg: string, sgAcc: string, du: string, duObl: string, cons: string, consObl: string, pl: string): CountedNoun => ({
  gender: 'masculine',
  one: cf(sg, sgAcc),
  singular: cf(sg, sgAcc),
  dual: cf(du, duObl, duObl),
  dualConstruct: cf(cons, consObl, consObl),
  plural: pl,
});

/** Index 0 = thousand, 1 = million, 2 = billion. */
export const SCALES: readonly CountedNoun[] = [
  scale('ألف', 'ألفاً', 'ألفان', 'ألفين', 'ألفا', 'ألفي', 'آلاف'),
  scale('مليون', 'مليوناً', 'مليونان', 'مليونين', 'مليونا', 'مليوني', 'ملايين'),
  scale('مليار', 'ملياراً', 'ملياران', 'مليارين', 'مليارا', 'ملياري', 'مليارات'),
];

export const ZERO = 'صفر';
export const AND = ' و';

/** 3–10 agreeing with a MASCULINE counted noun (the form ending in ة). Index = value. */
const UNITS_FOR_MASC = ['', '', '', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
/** 3–10 agreeing with a FEMININE counted noun. */
const UNITS_FOR_FEM = ['', '', '', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثماني', 'تسع', 'عشر'];
/** Hundreds stems: ثلاثمئة … تسعمئة (written joined). */
const HUNDREDS_STEM = ['', '', '', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثمان', 'تسع'];
const TENS = ['', '', 'عشر', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثمان', 'تسع'];

const isNom = (c: GrammaticalCase) => c === 'nominative';

function tens(t: number, c: GrammaticalCase): string {
  return TENS[t] + (isNom(c) ? 'ون' : 'ين');
}

/** 1–99 agreeing with a counted noun of gender `g`. */
export function belowHundred(n: number, g: Gender, c: GrammaticalCase): string {
  const m = g === 'masculine';
  if (n === 0) return '';
  if (n === 1) return m ? 'واحد' : 'واحدة';
  if (n === 2) return m ? (isNom(c) ? 'اثنان' : 'اثنين') : isNom(c) ? 'اثنتان' : 'اثنتين';
  if (n <= 10) return (m ? UNITS_FOR_MASC : UNITS_FOR_FEM)[n]!;
  if (n === 11) return m ? 'أحد عشر' : 'إحدى عشرة';
  if (n === 12) return m ? (isNom(c) ? 'اثنا عشر' : 'اثني عشر') : isNom(c) ? 'اثنتا عشرة' : 'اثنتي عشرة';
  if (n < 20) return m ? `${UNITS_FOR_MASC[n - 10]} عشر` : `${UNITS_FOR_FEM[n - 10]} عشرة`;

  const t = Math.floor(n / 10);
  const u = n % 10;
  if (u === 0) return tens(t, c);
  const unit = u === 1 ? (m ? 'واحد' : 'إحدى') : belowHundred(u, g, c);
  return unit + AND + tens(t, c);
}

/** 1–999. `construct`: a following noun attaches directly (200 → مئتا / مئتي). */
export function belowThousand(n: number, g: Gender, c: GrammaticalCase, construct = false): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  let hw = '';
  if (h === 1) hw = 'مئة';
  else if (h === 2) {
    if (construct && r === 0) hw = isNom(c) ? 'مئتا' : 'مئتي';
    else hw = isNom(c) ? 'مئتان' : 'مئتين';
  } else if (h > 2) hw = `${HUNDREDS_STEM[h]}مئة`;
  const rw = belowHundred(r, g, c);
  return [hw, rw].filter(Boolean).join(AND);
}

/**
 * Any positive integer up to 999,999,999,999 as words.
 * `g` is the gender of the counted noun (affects only the last three digits);
 * thousands/millions/billions are masculine nouns and always agree as such.
 */
export function integerWords(n: number, g: Gender, c: GrammaticalCase, construct = false): string {
  const groups = [
    Math.floor(n / 1e9) % 1000,
    Math.floor(n / 1e6) % 1000,
    Math.floor(n / 1e3) % 1000,
    n % 1000,
  ];
  let last = groups.length - 1;
  while (last > 0 && groups[last] === 0) last--;

  const parts: string[] = [];
  groups.forEach((v, i) => {
    if (v === 0) return;
    const cons = construct && i === last;
    if (i === 3) parts.push(belowThousand(v, g, c, cons));
    else parts.push(countNoun(v, SCALES[2 - i]!, c, cons));
  });
  return parts.join(AND);
}

/** `n` (≥ 1) of `noun`, applying the counted-noun rules documented at the top of this file. */
export function countNoun(n: number, noun: CountedNoun, c: GrammaticalCase, construct = false): string {
  if (n <= 0) return '';
  const r = n % 100;
  const rest = n - r;

  if (r === 0) return `${integerWords(rest, noun.gender, c, true)} ${noun.singular.genitive}`;

  let tail: string;
  if (r === 1) tail = noun.one[c];
  else if (r === 2) tail = (construct && noun.dualConstruct ? noun.dualConstruct : noun.dual)[c];
  else if (r <= 10) tail = `${belowHundred(r, noun.gender, c)} ${noun.plural}`;
  // 11–99: tamyiz «ألفاً»; but followed by a noun the scale is in construct and loses tanween: أحد عشر ألفَ ريالٍ.
  else tail = `${belowHundred(r, noun.gender, c)} ${construct ? noun.singular.nominative : noun.singular.accusative}`;

  if (rest === 0) return tail;
  // A scale with hundreds + 1 or 2 repeats the scale word, so the amount can't be read as a sum:
  // 101,000 → مئة ألف وألف (not مئة وألف, which reads as 1,100); 102,000 → مئة ألف وألفان.
  if (r <= 2 && SCALES.includes(noun)) return `${integerWords(rest, noun.gender, c, true)} ${noun.singular.genitive}${AND}${tail}`;
  return integerWords(rest, noun.gender, c) + AND + tail;
}

/** "مئة" (modern, default) or "مائة" (classic, common on Gulf cheques). */
export function applySpelling(text: string, spelling: 'modern' | 'classic'): string {
  return spelling === 'classic' ? text.replaceAll('مئ', 'مائ') : text;
}
