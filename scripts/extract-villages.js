const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "src/database/db.json");
const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

const villages = new Set();

// Add ancestral villages
villages.add("dulania");
villages.add("moruwa");
villages.add("tatija");

// Traverse tree to find all village references
function traverse(member) {
  if (!member) return;
  if (member.village && member.village.trim()) {
    villages.add(member.village.toLowerCase().trim());
  }
  if (member.wives) member.wives.forEach(traverse);
  if (member.children) member.children.forEach(traverse);
}

data.dulania.forEach(traverse);
data.moruwa.forEach(traverse);
data.tatija.forEach(traverse);

// Also add from englishToHindi
Object.keys(data.englishToHindi.villages || {}).forEach((v) => villages.add(v));

console.log("Total unique villages:", villages.size);
const sorted = [...villages].sort();
sorted.forEach((v) => console.log(v));
