const fs = require("fs");
const p = require("../src/utils/panchang.js");

const check = (label, d) => {
  const pn = p.getPanchangForDate(d);
  return `${label}: tithi=${pn.tithiEn} (${pn.tithiIndex}) month=${pn.monthEn} naks=${pn.nakshatraEn} fest=${pn.festivals.map((f) => f.en).join(",") || "none"}\n`;
};

let out = "VERIFY 2025 (known festival dates)\n";
out += check("Diwali 10/20 (Kartika Amavasya)", { year: 2025, month: 10, day: 20 });
out += check("Dhanteras 10/18 (Kartika Trayodashi)", { year: 2025, month: 10, day: 18 });
out += check("Bhai Dooj 10/23 (Kartika Shukla Dwitiya)", { year: 2025, month: 10, day: 23 });
out += check("Raksha Bandhan 8/9 (Shravana Purnima)", { year: 2025, month: 8, day: 9 });
out += check("Janmashtami 8/16 (Bhadrapada Ashtami)", { year: 2025, month: 8, day: 16 });
out += check("Ganesh Chaturthi 8/27 (Bhadrapada Shukla Chaturthi)", { year: 2025, month: 8, day: 27 });
out += check("Maha Shivaratri 2/26 (Phalguna Chaturdashi)", { year: 2025, month: 2, day: 26 });
out += check("Holi 3/14 (Phalguna Purnima)", { year: 2025, month: 3, day: 14 });
out += check("Ram Navami 4/6 (Chaitra Navami)", { year: 2025, month: 4, day: 6 });
out += check("Makar Sankranti ~1/14", { year: 2025, month: 1, day: 14 });
out += check("Vaisakhi ~4/14", { year: 2025, month: 4, day: 14 });
out += check("Karva Chauth ~10/10", { year: 2025, month: 10, day: 10 });

out += "\nVERIFY 2024\n";
out += check("Diwali 11/1 (Kartika Amavasya)", { year: 2024, month: 11, day: 1 });
out += check("Raksha Bandhan 8/19 (Shravana Purnima)", { year: 2024, month: 8, day: 19 });
out += check("Janmashtami 8/26 (Bhadrapada Ashtami)", { year: 2024, month: 8, day: 26 });
out += check("Ganesh Chaturthi 9/7 (Bhadrapada Shukla Chaturthi)", { year: 2024, month: 9, day: 7 });
out += check("Maha Shivaratri 3/8 (Phalguna Chaturdashi)", { year: 2024, month: 3, day: 8 });
out += check("Holi 3/25 (Phalguna Purnima)", { year: 2024, month: 3, day: 25 });

out += "\nDOB checks\n";
const dobs = ["3 November 1984", "12 March 1982", "5 September 1979", "14 January 1986", "30 November 2017"];
for (const dob of dobs) {
  const r = p.getRashiNakshatraFromDob(dob);
  out += `${dob} => ${r ? r.rashiEn + " / " + r.nakshatraEn + " pada " + (r.pada + 1) : "invalid"}\n`;
}

fs.writeFileSync("month-debug.txt", out);
