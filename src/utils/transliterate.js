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

// ==================== DEVANAGARI → ENGLISH (reverse transliteration) ====================
// Maps Devanagari characters to ITRANS-style English equivalents.
// Used by the Hindi voice search to convert spoken Hindi text into an English query.

// Independent vowels (Devanagari → English)
const DEVANAGARI_VOWELS = {
  "\u0905": "a", // अ
  "\u0906": "aa", // आ
  "\u0907": "i", // इ
  "\u0908": "ee", // ई
  "\u0909": "u", // उ
  "\u090A": "oo", // ऊ
  "\u090B": "ri", // ऋ
  "\u090F": "e", // ए
  "\u0910": "ai", // ऐ
  "\u0913": "o", // ओ
  "\u0914": "au", // औ
  "\u0911": "o", // ऑ
  "\u090D": "e", // ऍ
  "\u0912": "o", // ऒ
};

// Vowel matras (dependent signs after a consonant)
const DEVANAGARI_MATRAS = {
  "\u093E": "aa", // ा
  "\u093F": "i", // ि
  "\u0940": "ee", // ी
  "\u0941": "u", // ु
  "\u0942": "oo", // ू
  "\u0943": "ri", // ृ
  "\u0947": "e", // े
  "\u0948": "ai", // ै
  "\u094B": "o", // ो
  "\u094C": "au", // ौ
  "\u0949": "o", // ॉ
  "\u0945": "e", // ॅ
  "\u094A": "o", // ॊ
};

// Consonants (Devanagari → English)
const DEVANAGARI_CONSONANTS = {
  "\u0915": "k", // क
  "\u0916": "kh", // ख
  "\u0917": "g", // ग
  "\u0918": "gh", // घ
  "\u0919": "ng", // ङ
  "\u091A": "ch", // च
  "\u091B": "chh", // छ
  "\u091C": "j", // ज
  "\u091D": "jh", // झ
  "\u091E": "ny", // ञ
  "\u091F": "t", // ट
  "\u0920": "th", // ठ
  "\u0921": "d", // ड
  "\u0922": "dh", // ढ
  "\u0923": "n", // ण
  "\u0924": "t", // त
  "\u0925": "th", // थ
  "\u0926": "d", // द
  "\u0927": "dh", // ध
  "\u0928": "n", // न
  "\u092A": "p", // प
  "\u092B": "ph", // फ
  "\u092C": "b", // ब
  "\u092D": "bh", // भ
  "\u092E": "m", // म
  "\u092F": "y", // य
  "\u0930": "r", // र
  "\u0932": "l", // ल
  "\u0935": "v", // व
  "\u0936": "sh", // श
  "\u0937": "sh", // ष
  "\u0938": "s", // स
  "\u0939": "h", // ह
  "\u0958": "q", // क़
  "\u0959": "kh", // ख़
  "\u095A": "g", // ग़
  "\u095B": "z", // ज़
  "\u095C": "f", // फ़
  "\u095D": "r", // ड़
  "\u095E": "rh", // ढ़
};

// Devanagari signs
const DEVANAGARI_SIGNS = {
  "\u0902": "n", // ं anusvara
  "\u0901": "n", // ँ chandrabindu
  "\u0903": "h", // ः visarga
  "\u094D": "", // ् halant / virama
};

// Sorted Devanagari keys by length (longer first) for proper matching
const DEVANAGARI_VOWEL_KEYS = Object.keys(DEVANAGARI_VOWELS).sort((a, b) => b.length - a.length);
const DEVANAGARI_MATRA_KEYS = Object.keys(DEVANAGARI_MATRAS).sort((a, b) => b.length - a.length);
const DEVANAGARI_CONSONANT_KEYS = Object.keys(DEVANAGARI_CONSONANTS).sort((a, b) => b.length - a.length);

/**
 * Transliterate Devanagari (Hindi) text to English (ITRANS-style)
 * मनोज → manoj, राहुल → raahul
 * @param {string} text - Hindi text in Devanagari script
 * @returns {string} - English transliteration (lowercase)
 */
function transliterateToEnglish(text) {
  if (!text) return text;

  let result = "";
  let i = 0;

  while (i < text.length) {
    let matched = false;

    // Skip spaces, hyphens, and punctuation (preserve them as separators)
    const ch = text[i];
    if (ch === " " || ch === "-" || ch === "(" || ch === ")" || ch === "." || ch === "," || ch === "'") {
      // Add a space separator to preserve word boundaries
      if (result.length && !result.endsWith(" ")) {
        result += " ";
      }
      i++;
      continue;
    }

    // Try consonants first (2-char nukta forms like क़ before single क)
    for (const cons of DEVANAGARI_CONSONANT_KEYS) {
      if (text.substring(i, i + cons.length) === cons) {
        result += DEVANAGARI_CONSONANTS[cons];
        i += cons.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Try matras
    for (const matra of DEVANAGARI_MATRA_KEYS) {
      if (text.substring(i, i + matra.length) === matra) {
        result += DEVANAGARI_MATRAS[matra];
        i += matra.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Try independent vowels
    for (const vowel of DEVANAGARI_VOWEL_KEYS) {
      if (text.substring(i, i + vowel.length) === vowel) {
        result += DEVANAGARI_VOWELS[vowel];
        i += vowel.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Try signs (halant = nothing, anusvara = n)
    for (const sign of Object.keys(DEVANAGARI_SIGNS)) {
      if (text.substring(i, i + sign.length) === sign) {
        result += DEVANAGARI_SIGNS[sign];
        i += sign.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Unknown character — skip it
    i++;
  }

  // Normalize: collapse multiple spaces, trim
  result = result.replace(/\s+/g, " ").trim();

  // Devanagari omits the inherent 'a' at the end of words, but it IS pronounced.
  // For search purposes, stripping the trailing vowel usually matches better
  // (e.g., "मनोज" → "manoj" not "manoja"). The fuzzy matcher handles the rest.
  return result;
}

/**
 * Check whether a string contains Devanagari characters
 * @param {string} text - Text to test
 * @returns {boolean} - True if the string contains Devanagari script
 */
function isDevanagari(text) {
  if (!text) return false;
  return /[\u0900-\u097F]/.test(text);
}

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
  module.exports = { transliterateToHindi, transliterateToEnglish, isDevanagari };
}

export { transliterateToHindi, transliterateToEnglish, isDevanagari };
