/**
 * Turkish NLP Normalization, Stemming, and Color Detection utilities
 */
import { COLOR_MODIFIERS, COLOR_SUFFIXES, TURKISH_COLORS_CATALOG } from '../data/fallbackColors.ts';

/**
 * Proper Turkish lowercase conversion
 * Handles İ -> i, I -> ı, Ş -> ş, etc.
 */
export function normalizeTurkish(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Common Turkish noun suffixes for stemming
 */
const TURKISH_INFLECTIONAL_SUFFIXES = [
  // Plurals
  'lar', 'ler',
  // Ablative / Locative
  'dan', 'den', 'tan', 'ten',
  'da', 'de', 'ta', 'te',
  // Dative / Accusative
  'ya', 'ye', 'na', 'ne', 'a', 'e',
  'yı', 'yi', 'yu', 'yü', 'nı', 'ni', 'nu', 'nü', 'ı', 'i', 'u', 'ü',
  // Genitive
  'nın', 'nin', 'nun', 'nün', 'ın', 'in', 'un', 'ün',
  // Possessive
  'ları', 'leri', 'mız', 'miz', 'muz', 'müz', 'nız', 'niz', 'nuz', 'nüz',
  'ım', 'im', 'um', 'üm', 'ın', 'in', 'un', 'ün', 'sı', 'si', 'su', 'sü'
];

/**
 * Attempts to extract the root lemma of a Turkish word
 */
export function stemTurkishWord(rawWord: string): { stem: string; strippedSuffix: string; isColorVariant: boolean } {
  const normalized = normalizeTurkish(rawWord);
  if (!normalized) {
    return { stem: '', strippedSuffix: '', isColorVariant: false };
  }

  // Check if directly a known color
  if (TURKISH_COLORS_CATALOG[normalized]) {
    return { stem: normalized, strippedSuffix: '', isColorVariant: true };
  }

  // Handle compound words like "açık mavi", "koyu yeşil", "buz mavisi"
  const tokens = normalized.split(' ');
  if (tokens.length >= 2) {
    const lastToken = tokens[tokens.length - 1];
    const firstToken = tokens[0];

    // Check if last token is a color or inflected color
    const lastStem = stemTurkishWord(lastToken);
    if (lastStem.isColorVariant) {
      return { stem: lastStem.stem, strippedSuffix: firstToken, isColorVariant: true };
    }

    if (COLOR_MODIFIERS.includes(firstToken)) {
      if (TURKISH_COLORS_CATALOG[lastToken]) {
        return { stem: lastToken, strippedSuffix: firstToken, isColorVariant: true };
      }
    }
  }

  // Check color-deriving suffixes (e.g., mavimsi -> mavi, sarımtırak -> sarı)
  for (const suf of COLOR_SUFFIXES) {
    if (normalized.endsWith(suf) && normalized.length > suf.length + 2) {
      const candidate = normalized.slice(0, -suf.length);
      if (TURKISH_COLORS_CATALOG[candidate]) {
        return { stem: candidate, strippedSuffix: suf, isColorVariant: true };
      }
      // Turkish phonology buffer letter (e.g. mavi-m-si)
      if (candidate.endsWith('m') && TURKISH_COLORS_CATALOG[candidate.slice(0, -1)]) {
        return { stem: candidate.slice(0, -1), strippedSuffix: 'm' + suf, isColorVariant: true };
      }
    }
  }

  // Check standard inflectional suffixes
  for (const suf of TURKISH_INFLECTIONAL_SUFFIXES) {
    if (normalized.endsWith(suf) && normalized.length > suf.length + 2) {
      const candidate = normalized.slice(0, -suf.length);
      if (TURKISH_COLORS_CATALOG[candidate]) {
        return { stem: candidate, strippedSuffix: suf, isColorVariant: true };
      }
    }
  }

  return { stem: normalized, strippedSuffix: '', isColorVariant: false };
}

/**
 * Checks if a word is recognized as a color
 */
export function checkDirectColorMatch(word: string): { isColor: boolean; matchedName?: string; hex?: string } {
  const norm = normalizeTurkish(word);
  if (TURKISH_COLORS_CATALOG[norm]) {
    return { isColor: true, matchedName: TURKISH_COLORS_CATALOG[norm].name, hex: TURKISH_COLORS_CATALOG[norm].hex };
  }

  const { stem, isColorVariant } = stemTurkishWord(word);
  if (isColorVariant && TURKISH_COLORS_CATALOG[stem]) {
    return { isColor: true, matchedName: TURKISH_COLORS_CATALOG[stem].name, hex: TURKISH_COLORS_CATALOG[stem].hex };
  }

  return { isColor: false };
}
