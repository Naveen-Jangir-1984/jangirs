// Verify generation segregation logic for Generation Mosaic
// Mirrors the traversal in GenerationMosaic.js
const db = require("../src/database/db.json");

// Build generation groups exactly like GenerationMosaic.js
function buildGenerationGroups(dulania, moruwa, tatija) {
  const groups = {};
  const seen = new Set();

  const addMember = (member, gen) => {
    if (!member || !member.name) return;
    if (member.id != null && seen.has(member.id)) return;
    if (member.id != null) seen.add(member.id);
    const g = gen != null ? gen : member.generation != null ? member.generation : 1;
    if (!groups[g]) groups[g] = [];
    groups[g].push(member);
  };

  const traverse = (node, gen) => {
    if (!node) return;
    addMember(node, gen);
    if (node.gender === "M" && node.children?.length) {
      node.children.forEach((child) => traverse(child, gen + 1));
    }
    if (node.wives?.length) {
      node.wives.forEach((wife) => addMember(wife, gen));
    }
  };

  const villages = [
    { name: "tatija", tree: tatija || [] },
    { name: "moruwa", tree: moruwa || [] },
    { name: "dulania", tree: dulania || [] },
  ];

  const perVillage = {};
  villages.forEach(({ name, tree }) => {
    perVillage[name] = {};
    tree.forEach((root) => {
      const rootGen = root.generation != null ? root.generation : 1;
      const subSeen = new Set();
      const subGroups = {};
      const subAdd = (member, gen) => {
        if (!member || !member.name) return;
        if (member.id != null && subSeen.has(member.id)) return;
        if (member.id != null) subSeen.add(member.id);
        const g = gen != null ? gen : member.generation != null ? member.generation : rootGen;
        if (!subGroups[g]) subGroups[g] = [];
        subGroups[g].push(member);
      };
      const subTraverse = (node, gen) => {
        if (!node) return;
        subAdd(node, gen);
        if (node.gender === "M" && node.children?.length) {
          node.children.forEach((child) => subTraverse(child, gen + 1));
        }
        if (node.wives?.length) {
          node.wives.forEach((wife) => subAdd(wife, gen));
        }
      };
      subTraverse(root, rootGen);
      Object.entries(subGroups).forEach(([gen, members]) => {
        if (!perVillage[name][gen]) perVillage[name][gen] = [];
        perVillage[name][gen].push(...members);
      });
    });
  });

  // Overall groups
  villages.forEach(({ name, tree }) => {
    tree.forEach((root) => {
      const rootGen = root.generation != null ? root.generation : 1;
      traverse(root, rootGen);
    });
  });

  const sorted = Object.entries(groups)
    .map(([gen, members]) => ({ generation: parseInt(gen, 10), members, count: members.length }))
    .sort((a, b) => a.generation - b.generation);

  return { sorted, perVillage };
}

const { sorted, perVillage } = buildGenerationGroups(db.dulania, db.moruwa, db.tatija);

console.log("===== OVERALL GENERATION WALL =====");
sorted.forEach((g) => {
  console.log(`Generation ${g.generation}: ${g.count} members`);
});

console.log("\n===== PER VILLAGE RANGES =====");
Object.entries(perVillage).forEach(([village, gens]) => {
  const gensList = Object.keys(gens)
    .map(Number)
    .sort((a, b) => a - b);
  console.log(`${village.toUpperCase()}: gens ${gensList[0]} - ${gensList[gensList.length - 1]} (${gensList.length} generations)`);
  gensList.forEach((g) => {
    console.log(`  Gen ${g}: ${gens[g].length} members`);
  });
});

// Validate continuity and expected ranges
console.log("\n===== VALIDATION =====");
const tatijaGens = Object.keys(perVillage.tatija)
  .map(Number)
  .sort((a, b) => a - b);
const moruwaGens = Object.keys(perVillage.moruwa)
  .map(Number)
  .sort((a, b) => a - b);
const dulaniaGens = Object.keys(perVillage.dulania)
  .map(Number)
  .sort((a, b) => a - b);
console.log(`Tatija starts at gen ${tatijaGens[0]} (expected 1): ${tatijaGens[0] === 1 ? "PASS" : "FAIL"}`);
console.log(`Moruwa starts at gen ${moruwaGens[0]} (expected 8): ${moruwaGens[0] === 8 ? "PASS" : "FAIL"}`);
console.log(`Dulania starts at gen ${dulaniaGens[0]} (expected 11): ${dulaniaGens[0] === 11 ? "PASS" : "FAIL"}`);
console.log(`Continuity Tatija->Moruwa (moruwa min <= tatija max+1): ${moruwaGens[0] <= tatijaGens[tatijaGens.length - 1] + 1 ? "PASS" : "FAIL"}`);
console.log(`Continuity Moruwa->Dulania (dulania min <= moruwa max+1): ${dulaniaGens[0] <= moruwaGens[moruwaGens.length - 1] + 1 ? "PASS" : "FAIL"}`);
