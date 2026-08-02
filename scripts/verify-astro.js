const p = require("../src/utils/panchang.js");

let out = "ASTRO VERIFICATION\n";

// Sun tropical longitude at known seasonal points (2025):
// March Equinox: ~Mar 20 09:01 UT -> sun tropical longitude should be 0
// June Solstice: ~Jun 21 02:42 UT -> 90
// Sept Equinox: ~Sep 22 18:19 UT -> 180
// Dec Solstice: ~Dec 21 15:03 UT -> 270
const sunChecks = [
  { label: "Mar Equinox 2025", jd: p.jdFromDate(2025, 3, 20) - 0.5 + 9.02 / 24, expect: 0 },
  { label: "Jun Solstice 2025", jd: p.jdFromDate(2025, 6, 21) - 0.5 + 2.7 / 24, expect: 90 },
  { label: "Sep Equinox 2025", jd: p.jdFromDate(2025, 9, 22) - 0.5 + 18.32 / 24, expect: 180 },
  { label: "Dec Solstice 2025", jd: p.jdFromDate(2025, 12, 21) - 0.5 + 15.05 / 24, expect: 270 },
];
out += "\nSUN TROPICAL LONGITUDE\n";
for (const c of sunChecks) {
  const val = p.sunTropicalLongitude(c.jd);
  out += `${c.label}: computed=${val.toFixed(3)} expect=${c.expect} diff=${(val - c.expect).toFixed(3)}deg\n`;
}

// Moon tropical longitude at known full/new moons 2025
// (times UT from Astronomical Almanac / public data)
const moonChecks = [
  { label: "New Moon Mar 29 2025", jd: p.jdFromDate(2025, 3, 29) - 0.5 + 10.58 / 24, expect: 0 }, // new moon near 0 elong
  { label: "Full Moon Apr 12 2025", jd: p.jdFromDate(2025, 4, 12) - 0.5 + 0.22 / 24, expect: 180 }, // full
  { label: "New Moon Apr 27 2025", jd: p.jdFromDate(2025, 4, 27) - 0.5 + 19.31 / 24, expect: 0 }, // new
  { label: "Full Moon May 12 2025", jd: p.jdFromDate(2025, 5, 12) - 0.5 + 16.55 / 24, expect: 180 }, // full
  { label: "New Moon Nov 20 2025", jd: p.jdFromDate(2025, 11, 20) - 0.5 + 6.47 / 24, expect: 0 }, // new (Diwali came Oct 20; this is Kartika Amavasya)
  { label: "Full Moon Nov 5 2025", jd: p.jdFromDate(2025, 11, 5) - 0.5 + 13.19 / 24, expect: 180 }, // full
];
out += "\nMOON ELONGATION (lunar - solar)\n";
for (const c of moonChecks) {
  const lon = p.moonTropicalLongitude(c.jd);
  const sun = p.sunTropicalLongitude(c.jd);
  let elong = (lon - sun + 360) % 360;
  if (elong > 180) elong -= 360;
  out += `${c.label}: elong=${elong.toFixed(3)} expect=${c.expect === 0 ? "new(0)" : "full(180)"} absErr=${Math.abs(elong - c.expect).toFixed(3)}deg\n`;
}

// The problematic date: what nakshatra is the moon in at the Nov 5 2025 full moon?
out += "\nNOV 5 2025 FULL MOON DETAIL\n";
{
  const c = moonChecks[5];
  const moonLonTrop = p.moonTropicalLongitude(c.jd);
  const year = 2025;
  const ayan = p.getAyanamsa(year);
  const moonSid = (moonLonTrop - ayan + 360) % 360;
  const naks = Math.floor(moonSid / (360 / 27)) % 27;
  out += `tropical=${moonLonTrop.toFixed(3)} ayanamsa=${ayan.toFixed(4)}\n`;
  out += `sidereal=${moonSid.toFixed(3)} nakshatra=${p.NAKSHATRA_NAMES[naks].en} (index ${naks})\n`;
  out += `=> month index by NAKSHATRA_TO_MONTH = ${[6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5, 5, 6][naks]}\n`;
}

// Known reference nakshatra: Moon was in Pushya on a known date?
// Instead, probe the full moon nakshatra chronology for all 2025 full moons
out += "\n2025 FULL MOON NAKSHATRAS (each new/full)\n";
for (let month = 1; month <= 12; month++) {
  // Find the full moon day in this month by scanning
  for (let d = 1; d <= 31; d++) {
    if (d > new Date(2025, month, 0).getDate()) break;
    const pn = p.getPanchangForDate({ year: 2025, month, day: d });
    if (pn.tithiIndex === 14) {
      const ayan = p.getAyanamsa(2025);
      const jd = p.jdFromDate(2025, month, d) + p.SUNRISE_JD_OFFSET;
      const moonSid = (p.moonTropicalLongitude(jd) - ayan + 360) % 360;
      const naks = Math.floor(moonSid / (360 / 27)) % 27;
      out += `${month}/${d}: tithi=${pn.tithiEn} naks=${p.NAKSHATRA_NAMES[naks].en} (${naks}) month=${pn.monthEn}\n`;
      break;
    }
  }
}

require("fs").writeFileSync("astro-verify.txt", out);
