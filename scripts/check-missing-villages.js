/**
 * Check which villages from the family tree data have coordinates coverage
 * Run: node scripts/check-missing-villages.js
 */
const db = require("../src/database/db.json");
const { resolveVillageKey, getVillageCoords } = require("../src/utils/geoUtils");

const villages = new Set();

Object.keys(db).forEach((v) => {
  if (Array.isArray(db[v]) && v !== "users" && v !== "villages" && v !== "visitors") {
    const traverse = (member) => {
      if (!member) return;
      if (member.village) villages.add(member.village.toLowerCase().trim());
      member.wives?.forEach((w) => {
        if (w.village) villages.add(w.village.toLowerCase().trim());
      });
      if (member.gender === "M" && member.children) member.children.forEach(traverse);
      member.wives?.forEach((w) => {
        if (w.children) w.children.forEach(traverse);
      });
    };
    db[v].forEach(traverse);
  }
});

const sorted = [...villages].sort();
let covered = 0;
let missing = [];

sorted.forEach((v) => {
  const key = resolveVillageKey(v);
  const coords = getVillageCoords(v);
  if (coords) {
    covered++;
  } else {
    missing.push({ name: v, key });
  }
});

console.log(`Total unique villages: ${sorted.length}`);
console.log(`Covered by VILLAGE_COORDS: ${covered}`);
console.log(`Missing coordinates: ${missing.length}`);
if (missing.length > 0) {
  console.log("\nMissing villages:");
  missing.forEach((m) => console.log(`  ${m.name} -> key: "${m.key}"`));
}
</｜｜DSML｜｜parameter>
</｜｜DSML｜｜invoke>
</｜｜DSML｜｜tool_calls>
