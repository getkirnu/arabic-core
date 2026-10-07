import { cf } from './lexicon';
import type { CountedNoun, Gender } from './lexicon';

export type CurrencyCode = 'SAR' | 'AED' | 'EGP' | 'QAR' | 'KWD' | 'BHD' | 'OMR';

export interface CurrencyDefinition {
  code: CurrencyCode;
  /** Display name, e.g. "ريال سعودي". */
  nameAr: string;
  /** Sub-unit display name, e.g. "هللة". */
  subunitNameAr: string;
  /** Fraction digits: 2 (1/100) or 3 (1/1000). */
  decimals: 2 | 3;
  main: CountedNoun;
  sub: CountedNoun;
}

interface NounForms {
  gender: Gender;
  /** singular, singular accusative (tanween), dual, dual oblique, plural */
  forms: [string, string, string, string, string];
}

/** Nisba adjective (سعودي): sg, sg acc, dual, dual oblique, and feminine singular used with non-human plurals. */
const nisba = (adj: string): [string, string, string, string, string] => [adj, `${adj}اً`, `${adj}ان`, `${adj}ين`, `${adj}ة`];

function noun({ gender, forms }: NounForms, adjective?: string): CountedNoun {
  const [sg, sgAcc, du, duObl, pl] = forms;
  const a = adjective ? nisba(adjective) : null;
  const w = (n: string, i: number) => (a ? `${n} ${a[i]}` : n);
  const one = gender === 'masculine' ? ['واحد', 'واحداً'] : ['واحدة', 'واحدة'];
  return {
    gender,
    one: cf(`${w(sg, 0)} ${one[0]}`, `${w(sgAcc, 1)} ${one[1]}`, `${w(sg, 0)} ${one[0]}`),
    singular: cf(w(sg, 0), w(sgAcc, 1), w(sg, 0)),
    dual: cf(w(du, 2), w(duObl, 3), w(duObl, 3)),
    plural: w(pl, 4),
  };
}

const RIYAL: NounForms = { gender: 'masculine', forms: ['ريال', 'ريالاً', 'ريالان', 'ريالين', 'ريالات'] };
const DIRHAM: NounForms = { gender: 'masculine', forms: ['درهم', 'درهماً', 'درهمان', 'درهمين', 'دراهم'] };
const POUND: NounForms = { gender: 'masculine', forms: ['جنيه', 'جنيهاً', 'جنيهان', 'جنيهين', 'جنيهات'] };
const DINAR: NounForms = { gender: 'masculine', forms: ['دينار', 'ديناراً', 'ديناران', 'دينارين', 'دنانير'] };
const HALALA: NounForms = { gender: 'feminine', forms: ['هللة', 'هللة', 'هللتان', 'هللتين', 'هللات'] };
const FILS: NounForms = { gender: 'masculine', forms: ['فلس', 'فلساً', 'فلسان', 'فلسين', 'فلوس'] };
const PIASTRE: NounForms = { gender: 'masculine', forms: ['قرش', 'قرشاً', 'قرشان', 'قرشين', 'قروش'] };
const BAISA: NounForms = { gender: 'feminine', forms: ['بيسة', 'بيسة', 'بيستان', 'بيستين', 'بيسات'] };

const def = (
  code: CurrencyCode,
  main: NounForms,
  adjective: string,
  sub: NounForms,
  decimals: 2 | 3,
): CurrencyDefinition => ({
  code,
  nameAr: `${main.forms[0]} ${adjective}`,
  subunitNameAr: sub.forms[0],
  decimals,
  main: noun(main, adjective),
  sub: noun(sub),
});

export const CURRENCIES: Readonly<Record<CurrencyCode, CurrencyDefinition>> = {
  SAR: def('SAR', RIYAL, 'سعودي', HALALA, 2),
  AED: def('AED', DIRHAM, 'إماراتي', FILS, 2),
  EGP: def('EGP', POUND, 'مصري', PIASTRE, 2),
  QAR: def('QAR', RIYAL, 'قطري', DIRHAM, 2),
  KWD: def('KWD', DINAR, 'كويتي', FILS, 3),
  BHD: def('BHD', DINAR, 'بحريني', FILS, 3),
  OMR: def('OMR', RIYAL, 'عماني', BAISA, 3),
};
