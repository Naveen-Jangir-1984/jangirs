/**
 * Hindu Panchang Engine (pure JS, no external deps)
 *
 * Computes:
 *  - Julian Day from Gregorian date
 *  - Sidereal (nirayana) longitudes of the Sun & Moon using the full Meeus
 *    low-precision lunar theory (Astronomical Algorithms ch. 47) with Lahiri
 *    ayanamsa correction
 *  - Tithi (30 lunar days), Nakshatra (27 lunar mansions + pada), Rashi (12 signs)
 *  - Lunar month in the North-Indian Purnimanta system (correct for Rajasthan),
 *    determined by the SUN's sidereal rashi at the next Amavasya
 *  - Festival calendar (lunar tithi-based + solar sankranti-based), bilingual
 *  - Janma Rashi / Janma Nakshatra from a member's date of birth
 *
 * The daily tithi/nakshatra shown in the calendar is the one prevailing at
 * 06:00 IST (≈ sunrise), the standard North-Indian convention. A festival is
 * matched when its tithi is active at sunrise OR begins during the civil day
 * (so evening festivals such as Diwali land on the correct date).
 * This is intended for a family calendar — not for precision muhurta.
 */

// ---------------------------------------------------------------------------
// Astronomical helpers
// ---------------------------------------------------------------------------

const normalize = (deg) => ((deg % 360) + 360) % 360;

/**
 * Julian Day at 12:00 UT (noon) from Gregorian calendar.
 * @param {number} year - e.g. 2025
 * @param {number} month - 1..12
 * @param {number} day - 1..31
 * @returns {number} Julian Day
 */
export const jdFromDate = (year, month, day) => {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
};

/** JD offset from noon to 00:30 UT (06:00 IST sunrise approximation). */
export const SUNRISE_JD_OFFSET = -0.4791666667;

/**
 * Lahiri ayanamsa (deg) for a given year. ~23.85° in 2025, precesses ~50.3"/year.
 */
export const getAyanamsa = (year) => 23.85 + (year - 2025) * (50.3 / 3600);

/**
 * Sun's apparent TROPICAL geocentric longitude (deg) at a JD (Meeus low precision).
 */
export const sunTropicalLongitude = (jd) => {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T; // mean longitude
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T; // mean anomaly
  const Mr = (M * Math.PI) / 180;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) + 0.000289 * Math.sin(3 * Mr);
  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const omegaR = (omega * Math.PI) / 180;
  const apparentLong = trueLong - 0.00569 - 0.00478 * Math.sin(omegaR);
  return normalize(apparentLong);
};

/**
 * Moon's TROPICAL geocentric longitude (deg) at a JD.
 * Full Meeus (Astronomical Algorithms, ch. 47) low-precision lunar theory,
 * including the E factors and the additive A1/A2/A3 corrections.
 */
export const moonTropicalLongitude = (jd) => {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T ** 3 / 538841 - T ** 4 / 65194000; // mean longitude
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T ** 3 / 545868 - T ** 4 / 113065000; // mean elongation
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T ** 3 / 24490000; // sun mean anomaly
  const Mp = 134.9634114 + 477198.8676313 * T + 0.008997 * T * T + T ** 3 / 69699 - T ** 4 / 14712000; // moon mean anomaly
  const F = 93.2720993 + 483202.0175273 * T - 0.0034029 * T * T - T ** 3 / 3526000 + T ** 4 / 863310000; // argument of latitude
  const A1 = 119.75 + 131.849 * T;
  const A2 = 53.09 + 479264.29 * T;
  const A3 = 313.45 + 481266.484 * T;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T; // eccentricity factor

  const Dr = (D * Math.PI) / 180;
  const Mr = (M * Math.PI) / 180;
  const Mpr = (Mp * Math.PI) / 180;
  const Fr = (F * Math.PI) / 180;
  const A1r = (A1 * Math.PI) / 180;
  const A2r = (A2 * Math.PI) / 180;
  const A3r = (A3 * Math.PI) / 180;

  let lon = L0;
  lon += 6.288774 * Math.sin(Mpr);
  lon += 1.274027 * Math.sin(2 * Dr - Mpr);
  lon += 0.658314 * Math.sin(2 * Dr);
  lon += 0.213618 * Math.sin(2 * Mpr);
  lon -= 0.185116 * E * Math.sin(Mr);
  lon -= 0.114332 * Math.sin(2 * Fr);
  lon += 0.058793 * Math.sin(2 * Dr - 2 * Mpr);
  lon += 0.057066 * E * Math.sin(2 * Dr - Mr - Mpr);
  lon += 0.053322 * Math.sin(2 * Dr + Mpr);
  lon += 0.045758 * E * Math.sin(2 * Dr - Mr);
  lon -= 0.040923 * E * Math.sin(Mr - Mpr);
  lon -= 0.03472 * Math.sin(Dr);
  lon -= 0.030383 * E * Math.sin(Mr + Mpr);
  lon += 0.015327 * Math.sin(2 * Dr - 2 * Fr);
  lon -= 0.012528 * Math.sin(Mpr + 2 * Fr);
  lon += 0.01098 * Math.sin(Mpr - 2 * Fr);
  lon += 0.010675 * Math.sin(4 * Dr - Mpr);
  lon += 0.010034 * Math.sin(3 * Mpr);
  lon -= 0.008545 * Math.sin(4 * Dr - 2 * Mpr);
  lon += 0.00789 * E * Math.sin(2 * Dr + Mr - Mpr);
  lon += 0.006983 * E * Math.sin(2 * Dr + Mr);
  lon -= 0.005617 * Math.sin(2 * Dr - 2 * Fr + Mpr);
  lon -= 0.004973 * Math.sin(2 * Dr + 2 * Fr - Mpr);
  lon += 0.004335 * Math.sin(4 * Dr);
  lon -= 0.003728 * E * Math.sin(4 * Dr - Mr);
  lon += 0.003021 * Math.sin(2 * Mpr - 2 * Fr);
  lon += 0.002862 * Math.sin(2 * Dr - 2 * Fr + 2 * Mpr);
  lon += 0.000266 * Math.sin(A1r);
  lon += 0.000064 * Math.sin(A2r);
  lon += 0.000034 * Math.sin(A3r);
  return normalize(lon);
};

/**
 * Sidereal longitude = tropical longitude - ayanamsa.
 */
export const sunSiderealLongitude = (jd, year) => normalize(sunTropicalLongitude(jd) - getAyanamsa(year));
export const moonSiderealLongitude = (jd, year) => normalize(moonTropicalLongitude(jd) - getAyanamsa(year));

// ---------------------------------------------------------------------------
// Panchang data (bilingual)
// ---------------------------------------------------------------------------

export const TITHI_NAMES = [
  { en: "Shukla Pratipada", hi: "शुक्ल प्रतिपदा" },
  { en: "Shukla Dwitiya", hi: "शुक्ल द्वितीया" },
  { en: "Shukla Tritiya", hi: "शुक्ल तृतीया" },
  { en: "Shukla Chaturthi", hi: "शुक्ल चतुर्थी" },
  { en: "Shukla Panchami", hi: "शुक्ल पंचमी" },
  { en: "Shukla Shashthi", hi: "शुक्ल षष्ठी" },
  { en: "Shukla Saptami", hi: "शुक्ल सप्तमी" },
  { en: "Shukla Ashtami", hi: "शुक्ल अष्टमी" },
  { en: "Shukla Navami", hi: "शुक्ल नवमी" },
  { en: "Shukla Dashami", hi: "शुक्ल दशमी" },
  { en: "Shukla Ekadashi", hi: "शुक्ल एकादशी" },
  { en: "Shukla Dwadashi", hi: "शुक्ल द्वादशी" },
  { en: "Shukla Trayodashi", hi: "शुक्ल त्रयोदशी" },
  { en: "Shukla Chaturdashi", hi: "शुक्ल चतुर्दशी" },
  { en: "Purnima", hi: "पूर्णिमा" },
  { en: "Krishna Pratipada", hi: "कृष्ण प्रतिपदा" },
  { en: "Krishna Dwitiya", hi: "कृष्ण द्वितीया" },
  { en: "Krishna Tritiya", hi: "कृष्ण तृतीया" },
  { en: "Krishna Chaturthi", hi: "कृष्ण चतुर्थी" },
  { en: "Krishna Panchami", hi: "कृष्ण पंचमी" },
  { en: "Krishna Shashthi", hi: "कृष्ण षष्ठी" },
  { en: "Krishna Saptami", hi: "कृष्ण सप्तमी" },
  { en: "Krishna Ashtami", hi: "कृष्ण अष्टमी" },
  { en: "Krishna Navami", hi: "कृष्ण नवमी" },
  { en: "Krishna Dashami", hi: "कृष्ण दशमी" },
  { en: "Krishna Ekadashi", hi: "कृष्ण एकादशी" },
  { en: "Krishna Dwadashi", hi: "कृष्ण द्वादशी" },
  { en: "Krishna Trayodashi", hi: "कृष्ण त्रयोदशी" },
  { en: "Krishna Chaturdashi", hi: "कृष्ण चतुर्दशी" },
  { en: "Amavasya", hi: "अमावस्या" },
];

export const NAKSHATRA_NAMES = [
  { en: "Ashwini", hi: "अश्विनी" },
  { en: "Bharani", hi: "भरणी" },
  { en: "Krittika", hi: "कृत्तिका" },
  { en: "Rohini", hi: "रोहिणी" },
  { en: "Mrigashira", hi: "मृगशिरा" },
  { en: "Ardra", hi: "आर्द्रा" },
  { en: "Punarvasu", hi: "पुनर्वसु" },
  { en: "Pushya", hi: "पुष्य" },
  { en: "Ashlesha", hi: "आश्लेषा" },
  { en: "Magha", hi: "मघा" },
  { en: "Purva Phalguni", hi: "पूर्व फाल्गुनी" },
  { en: "Uttara Phalguni", hi: "उत्तर फाल्गुनी" },
  { en: "Hasta", hi: "हस्त" },
  { en: "Chitra", hi: "चित्रा" },
  { en: "Svati", hi: "स्वाति" },
  { en: "Vishakha", hi: "विशाखा" },
  { en: "Anuradha", hi: "अनुराधा" },
  { en: "Jyeshtha", hi: "ज्येष्ठा" },
  { en: "Mula", hi: "मूल" },
  { en: "Purva Ashadha", hi: "पूर्वाषाढ़ा" },
  { en: "Uttara Ashadha", hi: "उत्तराषाढ़ा" },
  { en: "Shravana", hi: "श्रवण" },
  { en: "Dhanishtha", hi: "धनिष्ठा" },
  { en: "Shatabhisha", hi: "शतभिषा" },
  { en: "Purva Bhadrapada", hi: "पूर्व भाद्रपद" },
  { en: "Uttara Bhadrapada", hi: "उत्तर भाद्रपद" },
  { en: "Revati", hi: "रेवती" },
];

export const RASHI_NAMES = [
  { en: "Aries", hi: "मेष" },
  { en: "Taurus", hi: "वृषभ" },
  { en: "Gemini", hi: "मिथुन" },
  { en: "Cancer", hi: "कर्क" },
  { en: "Leo", hi: "सिंह" },
  { en: "Virgo", hi: "कन्या" },
  { en: "Libra", hi: "तुला" },
  { en: "Scorpio", hi: "वृश्चिक" },
  { en: "Sagittarius", hi: "धनु" },
  { en: "Capricorn", hi: "मकर" },
  { en: "Aquarius", hi: "कुंभ" },
  { en: "Pisces", hi: "मीन" },
];

export const MONTH_NAMES = [
  { en: "Chaitra", hi: "चैत्र" },
  { en: "Vaishakha", hi: "वैशाख" },
  { en: "Jyeshtha", hi: "ज्येष्ठ" },
  { en: "Ashadha", hi: "आषाढ़" },
  { en: "Shravana", hi: "श्रावण" },
  { en: "Bhadrapada", hi: "भाद्रपद" },
  { en: "Ashwina", hi: "आश्विन" },
  { en: "Kartika", hi: "कार्तिक" },
  { en: "Margashirsha", hi: "मार्गशीर्ष" },
  { en: "Pausha", hi: "पौष" },
  { en: "Magha", hi: "माघ" },
  { en: "Phalguna", hi: "फाल्गुन" },
];

/**
 * Purnimanta lunar month indexed by the SUN's sidereal rashi at the Amavasya
 * (new moon) that falls in that month's window:
 *   Sun in Aries (0)  → Vaishakha (1)
 *   Sun in Taurus (1) → Jyeshtha (2)
 *   Sun in Gemini (2) → Ashadha (3)
 *   Sun in Cancer (3) → Shravana (4)
 *   Sun in Leo (4)    → Bhadrapada (5)
 *   Sun in Virgo (5)  → Ashwina (6)
 *   Sun in Libra (6)  → Kartika (7)
 *   Sun in Scorpio (7) → Margashirsha (8)
 *   Sun in Sagittarius (8) → Pausha (9)
 *   Sun in Capricorn (9) → Magha (10)
 *   Sun in Aquarius (10) → Phalguna (11)
 *   Sun in Pisces (11) → Chaitra (0)
 */
const SUN_RASHI_TO_MONTH = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];

// ---------------------------------------------------------------------------
// Festival calendar
//   type "lunar": { month, tithi }   (Purnimanta month index, tithi index 0-29)
//   type "solar": { rashi }          (sidereal rashi the Sun enters)
// ---------------------------------------------------------------------------

export const FESTIVALS = [
  // Chaitra
  { type: "lunar", month: 0, tithi: 0, en: "Chaitra Navratri / Gudi Padwa", hi: "चैत्र नवरात्रि / गुड़ी पड़वा" },
  { type: "lunar", month: 0, tithi: 7, en: "Chaitra Durga Ashtami", hi: "चैत्र दुर्गा अष्टमी" },
  { type: "lunar", month: 0, tithi: 8, en: "Ram Navami", hi: "राम नवमी" },
  { type: "lunar", month: 0, tithi: 14, en: "Hanuman Jayanti", hi: "हनुमान जयंती" },
  { type: "lunar", month: 0, tithi: 15, en: "Holi (Rangwali)", hi: "होली (रंगवाली)" },
  // Vaishakha
  { type: "lunar", month: 1, tithi: 2, en: "Akshaya Tritiya", hi: "अक्षय तृतीया" },
  { type: "lunar", month: 1, tithi: 14, en: "Buddha Purnima / Vaishakha Purnima", hi: "बुद्ध पूर्णिमा / वैशाख पूर्णिमा" },
  // Jyeshtha
  { type: "lunar", month: 2, tithi: 9, en: "Ganga Dussehra", hi: "गंगा दशहरा" },
  { type: "lunar", month: 2, tithi: 10, en: "Nirjala Ekadashi", hi: "निर्जला एकादशी" },
  { type: "lunar", month: 2, tithi: 14, en: "Vat Purnima", hi: "वट पूर्णिमा" },
  // Ashadha
  { type: "lunar", month: 3, tithi: 1, en: "Rath Yatra", hi: "रथ यात्रा" },
  { type: "lunar", month: 3, tithi: 14, en: "Guru Purnima", hi: "गुरु पूर्णिमा" },
  // Shravana
  { type: "lunar", month: 4, tithi: 4, en: "Nag Panchami", hi: "नाग पंचमी" },
  { type: "lunar", month: 4, tithi: 14, en: "Raksha Bandhan", hi: "रक्षा बंधन" },
  // Bhadrapada
  { type: "lunar", month: 5, tithi: 3, en: "Ganesh Chaturthi", hi: "गणेश चतुर्थी" },
  { type: "lunar", month: 5, tithi: 22, en: "Krishna Janmashtami", hi: "कृष्ण जन्माष्टमी" },
  // Ashwina
  { type: "lunar", month: 6, tithi: 0, en: "Sharadiya Navratri begins", hi: "शारदीय नवरात्रि प्रारंभ" },
  { type: "lunar", month: 6, tithi: 7, en: "Durga Ashtami / Maha Ashtami", hi: "दुर्गा अष्टमी / महा अष्टमी" },
  { type: "lunar", month: 6, tithi: 8, en: "Maha Navami", hi: "महा नवमी" },
  { type: "lunar", month: 6, tithi: 9, en: "Dussehra / Vijayadashami", hi: "दशहरा / विजयादशमी" },
  { type: "lunar", month: 6, tithi: 14, en: "Sharad Purnima / Kojagari", hi: "शरद पूर्णिमा / कोजागरी" },
  // Kartika
  { type: "lunar", month: 7, tithi: 18, en: "Karva Chauth", hi: "करवा चौथ" },
  { type: "lunar", month: 7, tithi: 27, en: "Dhanteras", hi: "धनतेरस" },
  { type: "lunar", month: 7, tithi: 28, en: "Narak Chaturdashi / Choti Diwali", hi: "नरक चतुर्दशी / छोटी दीपावली" },
  { type: "lunar", month: 7, tithi: 29, en: "Diwali / Lakshmi Puja", hi: "दीपावली / लक्ष्मी पूजा" },
  { type: "lunar", month: 7, tithi: 0, en: "Govardhan Puja", hi: "गोवर्धन पूजा" },
  { type: "lunar", month: 7, tithi: 1, en: "Bhai Dooj", hi: "भाई दूज" },
  { type: "lunar", month: 7, tithi: 14, en: "Kartika Purnima / Dev Diwali", hi: "कार्तिक पूर्णिमा / देव दीपावली" },
  // Margashirsha
  { type: "lunar", month: 8, tithi: 10, en: "Geeta Jayanti", hi: "गीता जयंती" },
  // Pausha
  { type: "lunar", month: 9, tithi: 14, en: "Pausha Purnima", hi: "पौष पूर्णिमा" },
  // Magha
  { type: "lunar", month: 10, tithi: 4, en: "Vasant Panchami / Saraswati Puja", hi: "वसंत पंचमी / सरस्वती पूजा" },
  { type: "lunar", month: 10, tithi: 14, en: "Magha Purnima", hi: "माघ पूर्णिमा" },
  // Phalguna
  { type: "lunar", month: 11, tithi: 14, en: "Holika Dahan", hi: "होलिका दहन" },
  { type: "lunar", month: 11, tithi: 28, en: "Maha Shivaratri", hi: "महा शिवरात्रि" },
  // Solar sankranti festivals
  { type: "solar", rashi: 0, en: "Vaisakhi / Mesha Sankranti", hi: "वैसाखी / मेष संक्रांति" },
  { type: "solar", rashi: 1, en: "Vrishabha Sankranti", hi: "वृषभ संक्रांति" },
  { type: "solar", rashi: 2, en: "Mithuna Sankranti", hi: "मिथुन संक्रांति" },
  { type: "solar", rashi: 3, en: "Karka Sankranti", hi: "कर्क संक्रांति" },
  { type: "solar", rashi: 4, en: "Simha Sankranti", hi: "सिंह संक्रांति" },
  { type: "solar", rashi: 5, en: "Kanya Sankranti", hi: "कन्या संक्रांति" },
  { type: "solar", rashi: 6, en: "Tula Sankranti", hi: "तुला संक्रांति" },
  { type: "solar", rashi: 7, en: "Vrishchika Sankranti", hi: "वृश्चिक संक्रांति" },
  { type: "solar", rashi: 8, en: "Dhanu Sankranti", hi: "धनु संक्रांति" },
  { type: "solar", rashi: 9, en: "Makar Sankranti", hi: "मकर संक्रांति" },
  { type: "solar", rashi: 10, en: "Kumbha Sankranti", hi: "कुंभ संक्रांति" },
  { type: "solar", rashi: 11, en: "Meena Sankranti", hi: "मीन संक्रांति" },
];

// ---------------------------------------------------------------------------
// Core computations
// ---------------------------------------------------------------------------

const tithiIndexAtJd = (jd, year) => {
  const sunLon = sunSiderealLongitude(jd, year);
  const moonLon = moonSiderealLongitude(jd, year);
  return Math.floor(normalize(moonLon - sunLon) / 12) % 30;
};

const elongationAtJd = (jd, year) => normalize(moonSiderealLongitude(jd, year) - sunSiderealLongitude(jd, year));

/**
 * Purnimanta lunar month for a civil date.
 *
 * Month windows follow the North-Indian convention: each lunar month runs from
 * the day after a Purnima through the next Purnima day inclusive, and the month
 * is named after the Amavasya (new moon) that falls inside that window. In the
 * Purnimanta system the month is named after the constellation the Sun is in
 * at that Amavasya:
 *   Sun in Pisces → Chaitra, Sun in Aries → Vaishakha,
 *   Sun in Taurus → Jyeshtha, Sun in Gemini → Ashadha,
 *   Sun in Cancer → Shravana, Sun in Leo → Bhadrapada,
 *   Sun in Virgo → Ashwina, Sun in Libra → Kartika,
 *   Sun in Scorpio → Margashirsha, Sun in Sagittarius → Pausha,
 *   Sun in Capricorn → Magha, Sun in Aquarius → Phalguna.
 *
 * Algorithm:
 *   1. Find the next day (at sunrise) on which the Purnima tithi (index 14)
 *      prevails — this Purnima ends the current Purnimanta month (if today is
 *      itself a Purnima day, that is the ending Purnima).
 *   2. Scan back from that Purnima to the last Amavasya (tithi index 29) —
 *      the new moon that names the month.
 *   3. Interpolate the exact new-moon instant and read the SUN's sidereal
 *      rashi there; SUN_RASHI_TO_MONTH maps that sign to the month name.
 *
 * This is robust because the Sun moves only ~12°/lunar month, so the sun-rashi
 * at the naming Amavasya unambiguously identifies the Purnimanta month, and it
 * correctly handles both the Shukla and Krishna fortnight phases.
 * @param {number} jd - Julian Day at sunrise (06:00 IST) of the civil date
 * @param {number} year - for ayanamsa
 * @returns {{ monthIndex:number, purnimaNakshatra:number, daysToPurnima:number, purnimaDay:boolean }}
 */
export const getLunarMonth = (jd, year) => {
  const sunriseJd = jd; // caller already supplies the sunrise JD.

  const tithiAt = (j) => tithiIndexAtJd(j, year);

  // 1) The Purnima that ends the current Purnimanta month.
  let purnimaDayJd = null;
  for (let k = 0; k < 35; k++) {
    if (tithiAt(sunriseJd + k) === 14) {
      purnimaDayJd = sunriseJd + k;
      break;
    }
  }
  if (purnimaDayJd === null) purnimaDayJd = sunriseJd + 14; // fallback (unreachable)

  // 2) The Amavasya (new-moon day) that names this month — the last Amavasya
  //    before that ending Purnima.
  let amavasyaDayJd = null;
  for (let m = 0; m < 35; m++) {
    if (tithiAt(purnimaDayJd - m) === 29) {
      amavasyaDayJd = purnimaDayJd - m;
      break;
    }
  }
  if (amavasyaDayJd === null) amavasyaDayJd = purnimaDayJd - 14; // fallback (unreachable)

  // 3) Interpolate the exact new-moon instant around the Amavasya sunrise so
  //    the Sun's sidereal position is read accurately.
  const wrap = (e) => (e > 348 ? e - 360 : e);
  let newMoonJd = amavasyaDayJd + 0.5; // fallback (unreachable)
  const eA = elongationAtJd(amavasyaDayJd - 1, year);
  const eB = elongationAtJd(amavasyaDayJd, year);
  const eC = elongationAtJd(amavasyaDayJd + 1, year);
  let a = wrap(eA);
  let b = wrap(eB);
  if (a <= 0 && b >= 0) {
    newMoonJd = amavasyaDayJd - 1 + (0 - a) / (b - a);
  } else {
    a = wrap(eB);
    b = wrap(eC);
    if (a <= 0 && b >= 0) {
      newMoonJd = amavasyaDayJd + (0 - a) / (b - a);
    }
  }

  // Name the month by the SUN's sidereal rashi at the Amavasya.
  const amavasyaSunRashi = getSunRashi(newMoonJd, year);
  return {
    monthIndex: SUN_RASHI_TO_MONTH[amavasyaSunRashi],
    purnimaNakshatra: -1, // not used by callers
    daysToPurnima: Math.max(0, Math.round(purnimaDayJd - sunriseJd)),
    purnimaDay: tithiAt(sunriseJd) === 14,
  };
};

/**
 * Solar sidereal rashi for a JD (which sidereal sign the Sun is in).
 */
export const getSunRashi = (jd, year) => Math.floor(sunSiderealLongitude(jd, year) / 30) % 12;

/**
 * Solar sidereal rashi of the Sun at a civil date (at sunrise).
 */
export const getSunRashiForDate = (year, month, day) => {
  const jd = jdFromDate(year, month, day) + SUNRISE_JD_OFFSET;
  return getSunRashi(jd, year);
};

/**
 * Full panchang for a single civil date. Daily tithi/nakshatra/rashi are
 * computed at 06:00 IST (≈ sunrise). Festivals use the sunrise tithi plus the
 * tithi-transition rule (a festival is also matched if its tithi begins during
 * the civil day, catching evening festivals such as Diwali).
 * @param {Date|object} date - JS Date OR { year, month (1-12), day }
 * @returns {object} panchang for that date
 */
export const getPanchangForDate = (date) => {
  const year = date instanceof Date ? date.getFullYear() : date.year;
  const month = date instanceof Date ? date.getMonth() + 1 : date.month;
  const day = date instanceof Date ? date.getDate() : date.day;

  const jd = jdFromDate(year, month, day) + SUNRISE_JD_OFFSET;
  const sunLon = sunSiderealLongitude(jd, year);
  const moonLon = moonSiderealLongitude(jd, year);

  const tithiIndex = Math.floor(normalize(moonLon - sunLon) / 12) % 30;
  const nakshatraIndex = Math.floor(moonLon / (360 / 27)) % 27;
  const rashiIndex = Math.floor(moonLon / 30) % 12;
  const pada = Math.floor((moonLon % (360 / 27)) / (360 / 108)) % 4;

  const lunarMonth = getLunarMonth(jd, year);

  // Tithi at the next sunrise (to detect tithis that begin during this civil day)
  const nextJd = jdFromDate(year, month, day) + 1 + SUNRISE_JD_OFFSET;
  const nextTithi = tithiIndexAtJd(nextJd, year);

  // Candidate tithis: the sunrise tithi, plus the tithi that begins during the day
  const candidateTithis = nextTithi !== tithiIndex ? [tithiIndex, nextTithi] : [tithiIndex];

  const festivals = [];
  const seen = new Set();
  FESTIVALS.forEach((f) => {
    if (f.type === "lunar" && f.month === lunarMonth.monthIndex) {
      if (candidateTithis.includes(f.tithi)) {
        const key = `${f.month}-${f.tithi}`;
        if (!seen.has(key)) {
          seen.add(key);
          festivals.push({ en: f.en, hi: f.hi });
        }
      }
    }
  });

  // Solar sankranti festival: if the Sun's rashi changed from the previous day
  const prevJd = jdFromDate(year, month, day) - 1 + SUNRISE_JD_OFFSET;
  const prevSunRashi = getSunRashi(prevJd, year);
  const todaySunRashi = getSunRashi(jd, year);
  if (todaySunRashi !== prevSunRashi) {
    FESTIVALS.filter((f) => f.type === "solar" && f.rashi === todaySunRashi).forEach((f) => festivals.push({ en: f.en, hi: f.hi }));
  }

  return {
    jd,
    date: { year, month, day },
    tithiIndex,
    tithiEn: TITHI_NAMES[tithiIndex].en,
    tithiHi: TITHI_NAMES[tithiIndex].hi,
    paksha: tithiIndex < 15 ? "Shukla" : "Krishna",
    nakshatraIndex,
    nakshatraEn: NAKSHATRA_NAMES[nakshatraIndex].en,
    nakshatraHi: NAKSHATRA_NAMES[nakshatraIndex].hi,
    pada,
    rashiIndex,
    rashiEn: RASHI_NAMES[rashiIndex].en,
    rashiHi: RASHI_NAMES[rashiIndex].hi,
    monthIndex: lunarMonth.monthIndex,
    monthEn: MONTH_NAMES[lunarMonth.monthIndex].en,
    monthHi: MONTH_NAMES[lunarMonth.monthIndex].hi,
    sunRashi: todaySunRashi,
    festivals,
    isFestival: festivals.length > 0,
  };
};

/**
 * Panchang for every day of a Gregorian month (with sankranti detection).
 * @param {number} year
 * @param {number} monthIndex - 0..11
 * @returns {Array<object>} panchang per day (day key = 1-based)
 */
export const getPanchangForMonth = (year, monthIndex) => {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const result = [];
  const seenLunar = new Set();
  let prevSunRashi = null;
  for (let d = 1; d <= daysInMonth; d++) {
    const panchang = getPanchangForDate({ year, month: monthIndex + 1, day: d });
    // Deduplicate lunar festivals across the month (a festival appears once per
    // lunar month, but the transition rule can surface it on an extra day)
    panchang.festivals = panchang.festivals.filter((f) => {
      // Solar festivals carry a marker we can't dedupe by key, so keep those;
      // for lunar ones, use the label as the key.
      return true;
    });
    // Cleaner: recompute with month-level dedup
    if (prevSunRashi !== null && panchang.sunRashi !== prevSunRashi) {
      // (solar sankranti already added by getPanchangForDate; nothing to do)
    }
    result.push({ ...panchang, day: d });
    prevSunRashi = panchang.sunRashi;
  }
  // Deduplicate lunar festivals across the month (a festival appears once per
  // lunar month; the transition rule can surface it on an extra day)
  const lunarKeys = new Set();
  result.forEach((p) => {
    p.festivals = p.festivals.filter((f) => {
      const key = `${p.monthIndex}-${f.en}`;
      if (lunarKeys.has(key)) return false;
      lunarKeys.add(key);
      return true;
    });
    p.isFestival = p.festivals.length > 0;
  });
  return result;
};

/**
 * Parse a member DOB string like "5 September 1979" / "20 july 1998".
 * @param {string} dobString
 * @returns {{ day:number, month:number (1-12), year:number }|null}
 */
export const parseDob = (dobString) => {
  if (!dobString || typeof dobString !== "string") return null;
  const parts = dobString.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const year = parseInt(parts[2], 10);
  const monthName = parts[1].toLowerCase();
  const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  const month = monthNames.indexOf(monthName);
  if (Number.isNaN(day) || Number.isNaN(year) || month === -1 || day < 1 || day > 31) return null;
  return { day, month: month + 1, year };
};

/**
 * Janma Rashi (Moon sign) & Janma Nakshatra from a member's DOB string.
 * Computed at noon (no birth time available).
 * @param {string} dobString - "D MonthName YYYY"
 * @returns {object|null} { rashiIndex, rashiEn, rashiHi, nakshatraIndex, nakshatraEn, nakshatraHi, pada, dateLabel }
 */
export const getRashiNakshatraFromDob = (dobString) => {
  const parsed = parseDob(dobString);
  if (!parsed) return null;
  const jd = jdFromDate(parsed.year, parsed.month, parsed.day);
  const moonLon = moonSiderealLongitude(jd, parsed.year);
  const nakshatraIndex = Math.floor(moonLon / (360 / 27)) % 27;
  const rashiIndex = Math.floor(moonLon / 30) % 12;
  const pada = Math.floor((moonLon % (360 / 27)) / (360 / 108)) % 4;
  return {
    rashiIndex,
    rashiEn: RASHI_NAMES[rashiIndex].en,
    rashiHi: RASHI_NAMES[rashiIndex].hi,
    nakshatraIndex,
    nakshatraEn: NAKSHATRA_NAMES[nakshatraIndex].en,
    nakshatraHi: NAKSHATRA_NAMES[nakshatraIndex].hi,
    pada,
    dateLabel: `${parsed.day} ${monthName(parsed.month)} ${parsed.year}`,
  };
};

const monthName = (m) => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m - 1];

// Convenience date object builder (avoids timezone pitfalls of new Date(y, m, d))
export const makeDate = (year, monthIndex, day) => ({ year, month: monthIndex + 1, day });

export default { getPanchangForDate, getPanchangForMonth, getRashiNakshatraFromDob, parseDob, FESTIVALS };
