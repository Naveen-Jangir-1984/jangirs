/**
 * AI4Bharat-style Custom Hindi Transliteration
 * Centralized module for English to Hindi (Devanagari) transliteration
 * Used by both frontend and backend
 */

// Consonants with aspirates (must check longer patterns first)
const CONSONANTS = {
  // Aspirated consonants (2-letter combinations - check first)
  kh: "ख",
  gh: "घ",
  ch: "छ",
  jh: "झ",
  th: "थ",
  dh: "ध",
  ph: "फ",
  bh: "भ",
  sh: "श",
  // Special consonants
  ng: "ङ",
  ny: "ञ",
  // Single consonants
  k: "क",
  g: "ग",
  c: "च",
  j: "ज",
  t: "त",
  d: "द",
  n: "न",
  p: "प",
  b: "ब",
  m: "म",
  y: "य",
  r: "र",
  l: "ल",
  v: "व",
  w: "व",
  s: "स",
  h: "ह",
  f: "फ़",
  z: "ज़",
  q: "क़",
  x: "क्स",
};

// Vowels (independent form)
const VOWELS = {
  aa: "आ",
  ee: "ई",
  ii: "ई",
  oo: "ऊ",
  uu: "ऊ",
  ai: "ऐ",
  au: "औ",
  ou: "औ",
  a: "अ",
  i: "इ",
  u: "उ",
  e: "ए",
  o: "ओ",
};

// Vowel matras (dependent form - used after consonants)
const MATRAS = {
  aa: "ा",
  ee: "ी",
  ii: "ी",
  oo: "ू",
  uu: "ू",
  ai: "ै",
  au: "ौ",
  ou: "ौ",
  a: "",
  i: "ि",
  u: "ु",
  e: "े",
  o: "ो",
};

// Halant (virama) - removes inherent 'a' vowel
const HALANT = "्";

// Sorted keys by length (longer first) for proper matching
const CONSONANT_KEYS = Object.keys(CONSONANTS).sort((a, b) => b.length - a.length);
const VOWEL_KEYS = Object.keys(VOWELS).sort((a, b) => b.length - a.length);

/**
 * Transliterate English text to Hindi (Devanagari)
 * @param {string} text - English text to transliterate
 * @returns {string} - Hindi text in Devanagari script
 */
function transliterateToHindi(text) {
  if (!text) return text;

  const input = text.toLowerCase();
  let result = "";
  let i = 0;
  let lastWasConsonant = false;

  while (i < input.length) {
    let matched = false;

    // Skip spaces and special characters
    if (input[i] === " " || input[i] === "-" || input[i] === "(" || input[i] === ")") {
      if (lastWasConsonant) {
        result += HALANT;
      }
      result += input[i];
      lastWasConsonant = false;
      i++;
      continue;
    }

    // Try to match vowels first (if last was consonant, use matra)
    if (lastWasConsonant) {
      for (const vowel of VOWEL_KEYS) {
        if (input.substring(i, i + vowel.length) === vowel) {
          result += MATRAS[vowel];
          i += vowel.length;
          matched = true;
          lastWasConsonant = false;
          break;
        }
      }
      if (matched) continue;
    }

    // Try to match consonants
    for (const cons of CONSONANT_KEYS) {
      if (input.substring(i, i + cons.length) === cons) {
        if (lastWasConsonant) {
          result += HALANT;
        }
        result += CONSONANTS[cons];
        i += cons.length;
        matched = true;
        lastWasConsonant = true;
        break;
      }
    }
    if (matched) continue;

    // Try to match independent vowels
    for (const vowel of VOWEL_KEYS) {
      if (input.substring(i, i + vowel.length) === vowel) {
        if (lastWasConsonant) {
          result += MATRAS[vowel];
        } else {
          result += VOWELS[vowel];
        }
        i += vowel.length;
        matched = true;
        lastWasConsonant = false;
        break;
      }
    }
    if (matched) continue;

    // No match - keep original character
    if (lastWasConsonant) {
      result += HALANT;
    }
    result += input[i];
    lastWasConsonant = false;
    i++;
  }

  // Handle trailing consonant
  if (lastWasConsonant) {
    result += HALANT;
  }

  return result;
}

// Export for both ES modules and CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = { transliterateToHindi };
}

export { transliterateToHindi };
