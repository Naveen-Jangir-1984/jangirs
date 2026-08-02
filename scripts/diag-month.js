const p = require("../src/utils/panchang.js");

const NAK_TO_MONTH = [6, 7, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5, 5, 6];
const SUN_TO_MONTH = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];

const findPurnimaData = (year, month, day) => {
  // Use the internal approach: scan forward from the given date's sunrise
  const jd = p.jdFromDate(year, month, day) + p.SUNRISE_JD_OFFSET;
  const tithiAt = (j) => Math.floor(((((p.moonSiderealLongitude(j, year) - p.sunSiderealLongitude(j, year)) % 360) + 360) % 360) / 12) % 30;
  const elong = (j) => (((p.moonSiderealLongitude(j, year) - p.sunSiderealLongitude(j, year)) % 360) + 360) % 360;

  let scan = jd;
  let found = null;
  for (let guard = 0; guard < 35; guard++) {
    const ti = tithiAt(scan);
    const tiNext = tithiAt(scan + 1);
    if (ti === 14 || tiNext === 14) {
      // interpolate
      const e0 = elong(scan);
      const e1 = elong(scan + 1);
      let pj;
      if (e0 >= 180) pj = scan;
      else if (e1 < 180) pj = scan + 1 + ((180 - e1) / 360) * 29.530588853;
      else pj = scan + (180 - e0) / (e1 - e0);
      const moonSid = p.moonSiderealLongitude(pj, year);
      const sunSid = p.sunSiderealLongitude(pj, year);
      const naks = Math.floor(moonSid / (360 / 27)) % 27;
      const sunRashi = Math.floor(sunSid / 30) % 12;
      const moonDays = pj - jd;
      found = { scanDay: Math.round(scan - jd), pjOffset: moonDays.toFixed(2), naks, naksName: p.NAKSHATRA_NAMES[naks].en, sunRashi, sunRashiName: p.RASHI_NAMES[sunRashi].en, monthNak: NAK_TO_MONTH[naks], monthSun: SUN_TO_MONTH[sunRashi], isPurnimaDay: false };
      break;
    }
    scan += 1;
  }
  return found;
};

let out = "# Per-date: find next Purnima from that date and report moon nakshatra + sun rashi at exact instant\n\n";

const cases = [
  // [year, month, day, label, expectedMonth]
  [2025, 1, 13, "2025 Pausha Purnima", "Pausha"],
  [2025, 2, 12, "2025 Magha Purnima", "Magha"],
  [2025, 3, 14, "2025 Phalguna Purnima (Holika)", "Phalguna"],
  [2025, 4, 12, "2025 Chaitra Purnima", "Chaitra"],
  [2025, 5, 12, "2025 Vaishakha Purnima", "Vaishakha"],
  [2025, 6, 11, "2025 Jyeshtha Purnima", "Jyeshtha"],
  [2025, 7, 10, "2025 Ashadha Purnima", "Ashadha"],
  [2025, 8, 9, "2025 Shravana Purnima", "Shravana"],
  [2025, 9, 7, "2025 Bhadrapada Purnima", "Bhadrapada"],
  [2025, 10, 7, "2025 Ashwina Purnima", "Ashwina"],
  [2025, 11, 5, "2025 Kartika Purnima", "Kartika"],
  [2024, 3, 25, "2024 Phalguna Purnima (Holi)", "Phalguna"],
  [2024, 4, 23, "2024 Chaitra Purnima", "Chaitra"],
  [2024, 8, 19, "2024 Shravana Purnima (Rakhi)", "Shravana"],
  [2024, 11, 15, "2024 Kartika Purnima", "Kartika"],
  [2024, 11, 1, "2024 Diwali (Kartika Amavasya)", "Kartika"],
  [2024, 3, 8, "2024 Maha Shivaratri (Phalguna Chaturdashi)", "Phalguna"],
];

for (const [y, m, d, label, exp] of cases) {
  const r = findPurnimaData(y, m, d);
  if (!r) {
    out += `${label}: NO PURNIMA FOUND\n`;
    continue;
  }
  out += `${label} expects ${exp}\n  next purnima ${r.scanDay} days ahead, interpolated ${r.pjOffset}d from given date\n  moon nakshatra=${r.naksName}(${r.naks}) -> nak-month ${p.MONTH_NAMES[r.monthNak].en}\n  sun rashi=${r.sunRashiName}(${r.sunRashi}) -> sun-month ${p.MONTH_NAMES[r.monthSun].en}\n`;
}
out += "\nNote: For a date already in a month, the +1 shift in naskshatra/sun-month mapping means:\n";
out += "  Nak table: month ending at a purnima where MOON is in namesake nakshatra.\n";
out += "  Sun table: month ending at a purnima where SUN is in sign (namesake+1).\n";

require("fs").writeFileSync("diag-month.txt", out);
