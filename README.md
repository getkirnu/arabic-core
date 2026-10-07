# @kirnu/arabic-core

Arabic text, number-to-words (tafgeet) and Hijri date utilities — the engine behind [Kirnu](https://getkirnu.com).
Plain TypeScript: no React, no DOM, no network, no dependencies. Runs in browsers, Node and workers.

> **بالعربية:** مكتبة مفتوحة المصدر لمعالجة العربية: تفقيط الأرقام والمبالغ بقواعد النحو الصحيحة (العدد والمعدود، المثنى، التمييز)، وإزالة التشكيل والتطويل، وتطبيع النص، وتحويل الأرقام العربية والإنجليزية، والتحويل بين التاريخ الهجري (أم القرى) والميلادي. هي المحرّك نفسه الذي تعمل به أدوات [كرنو](https://getkirnu.com/ar/).

```bash
npm install @kirnu/arabic-core
```

```ts
import { tafgeet, currencyToWords, removeTashkeel, normalizeArabic, gregorianToHijri } from '@kirnu/arabic-core';

tafgeet(1001011);                         // مليون وألف وأحد عشر
currencyToWords('1250.50', 'SAR', { cheque: true });
// فقط ألف ومئتان وخمسون ريالاً سعودياً وخمسون هللة لا غير
removeTashkeel('مُحَمَّدٌ');                // محمد
normalizeArabic('أحمد  علی');             // احمد علي
gregorianToHijri({ year: 2024, month: 3, day: 11 }); // { year: 1445, month: 9, day: 1 }
```

### Try it online

Every function is live on getkirnu.com, free and in the browser:

| Function | Tool |
|---|---|
| `tafgeet` | [تفقيط الأرقام](https://getkirnu.com/ar/text/tafgeet/) |
| `currencyToWords` | [تحويل المبالغ إلى كلمات](https://getkirnu.com/ar/text/currency-to-words/) |
| `removeTashkeel` | [إزالة التشكيل](https://getkirnu.com/ar/text/remove-tashkeel/) |
| `normalizeArabic` | [تطبيع النص العربي](https://getkirnu.com/ar/text/arabic-normalizer/) |
| `cleanText` / `fixRtl` | [تنظيف النص العربي](https://getkirnu.com/ar/text/clean-text/) · [إصلاح اتجاه النص](https://getkirnu.com/ar/text/rtl-fixer/) |
| `hijriToGregorian` / `gregorianToHijri` | [هجري إلى ميلادي](https://getkirnu.com/ar/dates/hijri-to-gregorian/) · [ميلادي إلى هجري](https://getkirnu.com/ar/dates/gregorian-to-hijri/) |
| `ageGregorian` / `ageHijri` | [حساب العمر](https://getkirnu.com/ar/dates/age-calculator/) |
| `countWorkingDays` | [حساب أيام العمل](https://getkirnu.com/ar/dates/working-days/) |

## Scripts

These run inside the Kirnu monorepo.

| Command | What it does |
|---|---|
| `npm test` | Vitest unit tests |
| `npm run build` | ESM + CJS + `.d.ts` into `dist/` (tsup) |
| `npm run review` | Writes `EDITOR-REVIEW.md` — every tafgeet/currency fixture with live output, for the Arabic editor |
| `npm run generate:ummalqura` | Regenerates the Umm al-Qura table from ICU (only needed to change the range) |

---

## Numbers

### `tafgeet(input, options?)`

Number → Arabic words (Modern Standard Arabic), **0 to 999,999,999,999**.

- `input`: `number | bigint | string`. Strings may use Western, Arabic-Indic (٠–٩) or Persian (۰–۹) digits;
  `,` `٬` and spaces are thousands separators, `.` or `٫` is the decimal point. Use strings for exact values.
- `options.gender`: `'masculine'` (default) | `'feminine'` — gender of the **counted noun**. Numbers 3–10 take the opposite form (ثلاثة كتب / ثلاث هللات).
- `options.case`: `'nominative'` (default) | `'accusative'` | `'genitive'` — changes duals, 12 and the tens (اثنان/اثنين، عشرون/عشرين، مئتان/مئتين).
- `options.cheque`: wraps the result in «فقط … لا غير».
- `options.spelling`: `'modern'` (مئة, default) | `'classic'` (مائة).
- Fractions are read after «فاصلة» as a whole number; leading zeros are read as «صفر» (3.05 → ثلاثة فاصلة صفر خمسة); trailing zeros are dropped.
- Negative numbers are prefixed with «سالب».
- Throws `SyntaxError` for non-numeric input and `RangeError` outside the supported range.

#### Grammar rules applied

Every number + noun phrase (including ألف / مليون / مليار and currency names) follows one rule set:

| Count | Noun form | Example |
|---|---|---|
| 1 | the noun alone | ألف · ريال سعودي واحد |
| 2 | dual | ألفان · ريالان سعوديان |
| 3–10 | number in the opposite gender + genitive plural | ثلاثة آلاف · ثلاث هللات |
| 11–99 | number + accusative singular (tamyiz) | أحد عشر ألفاً · خمسون هللة |
| whole hundreds (last two digits 00) | number + genitive singular | مئة ألف · ثلاثة آلاف ريال |

- For counts above 100, the noun follows the **last** part (strict MSA): 102,000 → «مئة وألفان».
- A dual directly followed by its noun takes the construct form: «مئتا ألف», «ألفا ريال».
- Thousands, millions and billions (مليار) are masculine nouns, so their counts always use the masculine-noun form.
- All expected outputs are tracked in `test/fixtures/tafgeet.cases.ts` with status `TODO-VERIFY` until a native Arabic editor approves them (see `EDITOR-REVIEW.md`).

### `currencyToWords(amount, currency, options?)`

| Code | Unit | Sub-unit | Sub-units per unit |
|---|---|---|---|
| SAR | ريال سعودي | هللة (feminine) | 100 |
| AED | درهم إماراتي | فلس | 100 |
| EGP | جنيه مصري | قرش | 100 |
| QAR | ريال قطري | درهم | 100 |
| KWD | دينار كويتي | فلس | 1000 |
| BHD | دينار بحريني | فلس | 1000 |
| OMR | ريال عماني | بيسة (feminine) | 1000 |

- Amounts are split into whole and minor units **without floating point**; extra fraction digits are rounded half-up (19.995 SAR → 20 SAR).
- A zero main amount is omitted (0.50 SAR → «خمسون هللة»); zero overall → «صفر ريال سعودي».
- Adjectives agree: «ريالاً سعودياً» (11–99), «ريالان سعوديان» (2), «ريالات سعودية» (3–10, non-human plural → feminine singular).
- Options: `cheque`, `case`, `spelling` as for `tafgeet`. Negative amounts throw `RangeError`.
- `CURRENCIES` exports the metadata (Arabic names, decimals) for building UIs.

### `parseNumberInput(input)` / `toMinorUnits(parsed, decimals)`

These are the low-level parsers used above, exported so UIs can validate input the same way the engine does.

---

## Text

### `removeTashkeel(text, options?)`

1. The text is first normalised with `text.normalize('NFC')`, so a decomposed hamza (ا + U+0654) becomes أ and is **kept**.
2. **Always removed:** U+064B–U+0652 (tanween, fatha, damma, kasra, shadda, sukun), U+0653–U+065F (maddah, small hamza and other marks), U+0670 (superscript alef).
3. `honorifics` (default **true**): removes U+0610–U+061A.
4. `quranicMarks` (default **true**): removes an **explicit list** of Quranic annotation marks (U+06D6–U+06DC, U+06DF–U+06E4, U+06E7, U+06E8, U+06EA–U+06ED; see `src/text/unicode.ts`). Marks not on the list are kept.
5. `tatweel` (default **false**): removes ـ U+0640.

**Never removed:** U+06DD (end of ayah), U+06DE (rub el hizb), U+06E5 (small waw), U+06E6 (small yeh). U+06E9 (place of sajdah) is also kept because it isn't on the list.

### `normalizeArabic(text, options?)`

The input is NFC-normalised first. Each rule has its own toggle, and they run in this order:

| Option | Default | Rule |
|---|---|---|
| `tatweel` | on | Remove ـ (U+0640). |
| `persian` | on | Persian keheh ک (U+06A9) → ك (U+0643); Farsi yeh ی (U+06CC) → ي (U+064A). |
| `alef` | on | أ إ آ ٱ ٲ ٳ → ا. Does **not** change ؤ, ئ or standalone ء. |
| `yeh` | `'toYeh'` | `'toYeh'`: every ى → ي. `'toAlefMaksura'`: word-final ي → ى (Egyptian spelling). `'none'`: unchanged. |
| `tehMarbuta` | off | ة → ه (lossy, so off by default). |
| `whitespace` | on | Runs of spaces/tabs/NBSP → one space; spaces trimmed at line edges; 3+ line breaks → one blank line; whole text trimmed. |

`normalizeArabic` doesn't remove tashkeel; use `removeTashkeel` for that.

### `convertNumerals(text, direction, options?)`

- `'toWestern'`: ٠–٩ and ۰–۹ → 0–9.
- `'toArabicIndic'`: 0–9 and ۰–۹ → ٠–٩.
- `separators` (default on): `.` ↔ ٫ and `,` ↔ ٬, **only between digits**. Sentence punctuation is untouched.

### Cleanup: `removeTatweel`, `cleanText`, `formatText`, `fixRtl`

- `removeTatweel(text)`: removes ـ (U+0640) only; `countTatweel(text)` counts them.
- `cleanText(text, options?)`: `whitespace` (default on) collapses runs of spaces; `lineBreaks` (on) trims lines and limits blank lines; `invisible` (off) removes zero-width spaces, BOM, soft hyphens, word joiners and bidi marks but **keeps ZWNJ/ZWJ**; `tatweel` and `tashkeel` (off) remove those.
- `formatText(text, options?)`: `trimLines`, `collapseSpaces`, `removeEmptyLines`, and `join`: `'none'` | `'all'` (one line) | `'paragraphs'` (join lines within paragraphs).
- `fixRtl(text, options?)`: makes mixed Arabic/English text display correctly in RTL contexts by adding an RLM at the start of each line and isolating Latin/number runs in LRI…PDI. The visible text is unchanged. `stripBidiControls` removes such marks; `countBidiControls` counts them.

### `countWords(text)` / `countChars(text)`

- A word is a run of letters, combining marks, digits or tatweel. Tashkeel and tatweel never split a word. Numbers like 1,250.50 count as one word. Arabic punctuation (، ؛ ؟) separates words.
- `countChars` counts Unicode code points after NFC, with CRLF counted as one line break. It returns `characters`, `charactersNoSpaces`, `charactersNoDiacritics`, `letters` (tatweel excluded), `diacritics`, `digits`, `spaces`, `words`, `lines` and `paragraphs`.

---

## Dates

All dates are `{ year, month, day }` objects, with `month` 1-based. There are no `Date` objects and no time zones, so results never shift by a day.

### `hijriToGregorian(date)` / `gregorianToHijri(date)`

- These use the **Umm al-Qura** calendar from a bundled month-length table covering **1343–1500 AH (2 Aug 1924 – 16 Nov 2077)**.
- The table is generated from ICU's Umm al-Qura data (`npm run generate:ummalqura`). Tests compare every day in the range against `Intl`'s `islamic-umalqura` calendar in both directions.
- Out-of-range or invalid dates throw `HijriRangeError`, which is a `RangeError`.
- Umm al-Qura is the official calendar of Saudi Arabia. Religious dates announced after moon sighting can differ by a day.

Helpers: `hijriMonthLength`, `isValidHijriDate`, `weekday` (0 = Sunday), `HIJRI_RANGE`, `HIJRI_MONTHS`, `GREGORIAN_MONTHS`, `SYRIAC_MONTHS`, `WEEKDAYS`.

### `dateDifference(from, to)` / `hijriDateDifference(from, to)`

These return `{ sign, years, months, days, totalDays, totalWeeks, remainderDays, totalMonths }`.

- The order of the arguments doesn't matter; `sign` gives the direction.
- Months are added with the day clamped to the target month's length, so 31 Jan → 28 Feb counts as one whole month.

### `ageGregorian(birth, on)` / `ageHijri(birth, on)`

These return the age in years, months and days, plus the totals, `nextBirthday` and `daysUntilNextBirthday`.

- A 29 February birthday falls on 28 February in common years.
- A Hijri 30th falls on the 29th in 29-day months.

### `addDays(date, days)` / `daysBetween(from, to)` / `countWorkingDays(from, to, weekend, inclusive?)`

- `addDays` accepts negative numbers; it throws `RangeError` for non-integer days or results outside years 1–9999.
- `countWorkingDays` takes the weekend as weekday numbers (0 = Sunday … 6 = Saturday), e.g. `[5, 6]` for Friday–Saturday, and returns `{ workingDays, weekendDays, totalDays }`. Public holidays are not included (they vary by country and year).

---

## Data and license

- The Umm al-Qura month-length table is generated from the calendar data in [ICU](https://icu.unicode.org/) (the Unicode library built into browsers and Node), used under the [Unicode License](https://www.unicode.org/license.txt).
- Arabic grammar output is tracked case by case and under review by a native Arabic editor; corrections are welcome as issues.
- Code: [MIT](./LICENSE) © Kirnu ([getkirnu.com](https://getkirnu.com)).
