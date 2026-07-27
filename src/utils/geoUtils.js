/**
 * Geographic Family Map Utilities
 * Provides village coordinate database and functions to extract
 * geographic data from the family tree for Leaflet mapping.
 */

/**
 * Comprehensive village coordinate database
 * Contains all known village locations from the Jangir family tree
 * (primarily Jhunjhunu/Sikar region of Rajasthan)
 *
 * All coordinates are approximate (placed within known tehsil/district areas)
 */
const VILLAGE_COORDS = {
  // ====== Ancestral Villages (Jangir family) ======
  dulania: { lat: 28.5432, lng: 75.4971, type: "ancestral" },
  moruwa: { lat: 28.5618, lng: 75.5125, type: "ancestral" },
  tatija: { lat: 28.5287, lng: 75.4828, type: "ancestral" },

  // ====== Jhunjhunu District Villages (Rajasthan) ======
  aduka: { lat: 28.2853, lng: 75.5832, type: "wife" },
  anji_ki_dhani: { lat: 28.1542, lng: 75.5217, type: "wife" },
  ardawata: { lat: 28.2861, lng: 75.6314, type: "wife" },
  baakra: { lat: 28.3952, lng: 75.6217, type: "wife" },
  baamlan_ki_dhani: { lat: 28.1831, lng: 75.4974, type: "wife" },
  babaai: { lat: 28.4351, lng: 75.7342, type: "daughter" },
  bahal: { lat: 28.3763, lng: 75.5798, type: "wife" },
  bajawa: { lat: 28.2547, lng: 75.6153, type: "wife" },
  bajla: { lat: 28.3675, lng: 75.5432, type: "wife" },
  bangothdi: { lat: 28.5321, lng: 75.6347, type: "wife" },
  bhagina: { lat: 28.1526, lng: 75.5741, type: "wife" },
  bhapar: { lat: 28.4123, lng: 75.6621, type: "wife" },
  bharinda: { lat: 28.3214, lng: 75.5432, type: "daughter" },
  bharu: { lat: 28.3021, lng: 75.5812, type: "wife" },
  bhasawata: { lat: 28.2851, lng: 75.5743, type: "wife" },
  bhawathadi: { lat: 28.2085, lng: 75.5123, type: "wife" },
  bhukana: { lat: 28.2341, lng: 75.5287, type: "wife" },
  bhuriwaas: { lat: 28.4125, lng: 75.6543, type: "daughter" },
  bhutiya_ka_baas: { lat: 28.1654, lng: 75.5487, type: "daughter" },
  bisanpura: { lat: 28.3142, lng: 75.5721, type: "wife" },
  budana: { lat: 28.3842, lng: 75.6847, type: "daughter" },
  budania: { lat: 28.2154, lng: 75.5178, type: "wife" },
  chaavsari: { lat: 28.4352, lng: 75.5987, type: "daughter" },
  chanana: { lat: 28.2987, lng: 75.6132, type: "wife" },
  chandgothi: { lat: 28.5421, lng: 75.6854, type: "daughter" },
  charawas: { lat: 28.2784, lng: 75.5921, type: "wife" },
  chhapda: { lat: 28.4124, lng: 75.6312, type: "wife" },
  chidsan_ki_dhani: { lat: 28.1842, lng: 75.5124, type: "daughter" },
  chirani: { lat: 28.3512, lng: 75.6014, type: "daughter" },
  daabdi: { lat: 28.3421, lng: 75.6287, type: "daughter" },
  devroad: { lat: 28.2654, lng: 75.5872, type: "wife" },
  dhaana: { lat: 28.4215, lng: 75.6247, type: "daughter" },
  dhakamaandi: { lat: 28.2871, lng: 75.5654, type: "wife" },
  dingli: { lat: 28.2954, lng: 75.6287, type: "wife" },
  dobada: { lat: 28.4121, lng: 75.6123, type: "daughter" },
  dumoli: { lat: 28.3142, lng: 75.5487, type: "wife" },
  gaadli: { lat: 28.3542, lng: 75.6521, type: "daughter" },
  ghardana: { lat: 28.2351, lng: 75.5478, type: "wife" },
  ghumansar: { lat: 28.2154, lng: 75.5347, type: "wife" },
  govind_singh_ka_baas: { lat: 28.2145, lng: 75.5623, type: "wife" },
  haripura: { lat: 28.3542, lng: 76.0124, type: "daughter" },
  hukma_ki_dhani: { lat: 28.1752, lng: 75.4954, type: "daughter" },
  jai_pahadi: { lat: 28.1865, lng: 75.4875, type: "wife" },
  jakhoda: { lat: 28.4123, lng: 75.5874, type: "daughter" },
  jaswantpura: { lat: 28.3241, lng: 75.5947, type: "daughter" },
  jeeva_ka_baas: { lat: 28.1954, lng: 75.5247, type: "daughter" },
  kakdeu: { lat: 28.2874, lng: 75.6123, type: "wife" },
  kakraye: { lat: 28.3215, lng: 75.6284, type: "daughter" },
  kaloth: { lat: 28.3754, lng: 75.6487, type: "daughter" },
  kashni: { lat: 28.2741, lng: 75.5478, type: "wife" },
  keharpura: { lat: 28.3124, lng: 75.5723, type: "wife" },
  khaatiya_ki_dhani: { lat: 28.2345, lng: 75.5125, type: "wife" },
  khatehpura: { lat: 28.3351, lng: 75.5821, type: "daughter" },
  khatiyan_ki_dhani: { lat: 28.2454, lng: 75.5217, type: "daughter" },
  khedla: { lat: 28.2541, lng: 75.5487, type: "wife" },
  khudana: { lat: 28.2415, lng: 75.5472, type: "wife" },
  khudaniya: { lat: 28.2874, lng: 75.5874, type: "wife" },
  khudiyan_ka_baas: { lat: 28.2175, lng: 75.5123, type: "daughter" },
  kisari: { lat: 28.2754, lng: 75.5621, type: "wife" },
  laalpur: { lat: 28.2987, lng: 75.5547, type: "wife" },
  laddusar: { lat: 28.3547, lng: 75.6123, type: "daughter" },
  lalasi: { lat: 28.3214, lng: 75.5987, type: "daughter" },
  maakhar: { lat: 28.3875, lng: 75.6347, type: "daughter" },
  mandasi: { lat: 28.2654, lng: 75.5741, type: "wife" },
  mandawa: { lat: 28.3521, lng: 75.6125, type: "daughter" },
  mandri: { lat: 28.2854, lng: 75.5587, type: "wife" },
  manjwa_ki_dhani: { lat: 28.1987, lng: 75.5284, type: "wife" },
  mithadi: { lat: 28.3687, lng: 75.6214, type: "daughter" },
  moi: { lat: 28.4125, lng: 75.6021, type: "daughter" },
  nesal: { lat: 28.4215, lng: 75.6487, type: "daughter" },
  nokhla_ki_dhani: { lat: 28.2241, lng: 75.5347, type: "wife" },
  nuniya_gothda: { lat: 28.4352, lng: 75.6487, type: "wife" },
  nyaloth: { lat: 28.2487, lng: 75.5587, type: "daughter" },
  ojtu: { lat: 28.3124, lng: 75.5487, type: "wife" },
  paaldi: { lat: 28.2785, lng: 75.5874, type: "wife" },
  paalwas: { lat: 28.3145, lng: 75.5721, type: "wife" },
  pajju: { lat: 28.4215, lng: 75.6154, type: "wife" },
  pichnwa: { lat: 28.2351, lng: 75.5421, type: "wife" },
  rajgarh: { lat: 28.2861, lng: 75.8054, type: "wife" },
  ramgadh: { lat: 27.6512, lng: 75.1987, type: "daughter" },
  rampura: { lat: 27.7354, lng: 75.1865, type: "daughter" },
  rasoolpur: { lat: 28.3287, lng: 75.9123, type: "wife" },
  rayala: { lat: 28.3145, lng: 75.6054, type: "daughter" },
  saakhu: { lat: 28.3452, lng: 75.6254, type: "daughter" },
  saari: { lat: 28.4321, lng: 75.6354, type: "daughter" },
  saarsar: { lat: 28.3021, lng: 75.5623, type: "wife" },
  salaampur: { lat: 28.3654, lng: 75.6421, type: "daughter" },
  singhana: { lat: 28.3352, lng: 75.6321, type: "daughter" },
  sinwali: { lat: 28.2547, lng: 75.5214, type: "wife" },
  solana: { lat: 28.3214, lng: 75.6123, type: "daughter" },
  sultana: { lat: 28.4215, lng: 75.6547, type: "daughter" },
  tara_ka_baas: { lat: 28.3254, lng: 75.5874, type: "daughter" },
  thirpali: { lat: 28.2784, lng: 75.5712, type: "wife" },

  // ====== Sikar District Villages (Rajasthan) ======
  sikar: { lat: 27.6143, lng: 75.1392, type: "city" },
  bandiabhas_sikar: { lat: 27.7215, lng: 75.2145, type: "wife" },
  peepli_laxmangarh: { lat: 27.8125, lng: 75.3421, type: "wife" },
  nawalgarh: { lat: 27.8512, lng: 75.2741, type: "town" },
  mukundgarh: { lat: 27.9512, lng: 75.2314, type: "daughter" },

  // ====== Jhunjhunu City & Surrounding ======
  jhunjhunu: { lat: 28.1276, lng: 75.3979, type: "city" },
  chirawa: { lat: 28.2454, lng: 75.6452, type: "town" },
  pilani: { lat: 28.3654, lng: 75.6014, type: "town" },
  surajgarh: { lat: 28.3124, lng: 75.7321, type: "town" },
  khetri: { lat: 28.0012, lng: 75.8021, type: "town" },

  // ====== Jaipur Region ======
  jaipur: { lat: 26.9124, lng: 75.7873, type: "city" },

  // ====== Haryana ======
  narnaul: { lat: 28.0456, lng: 76.1083, type: "town" },
  delhi: { lat: 28.7041, lng: 77.1025, type: "city" },
  greater_noida: { lat: 28.4744, lng: 77.504, type: "city" },
  sardarsheher: { lat: 28.5847, lng: 75.5421, type: "daughter" },
  jhajjar: { lat: 28.6056, lng: 76.6567, type: "town" },

  // ====== Default fallback for unknown villages (centered near Jhunjhunu) ======
  unknown: { lat: 28.2, lng: 75.6, type: "unknown" },
};

/**
 * Secondary mapping: common alternative spellings/hyphenated names -> canonical key
 */
const VILLAGE_ALIASES = {
  "jai-pahadi": "jai_pahadi",
  "jai pahadi": "jai_pahadi",
  "chidsan-ki-dhani": "chidsan_ki_dhani",
  "hukma-ki-dhani": "hukma_ki_dhani",
  "baamlan-ki-dhani": "baamlan_ki_dhani",
  "bhutiya-ka-baas": "bhutiya_ka_baas",
  "jeeva-ka-baas": "jeeva_ka_baas",
  "khudiyan-ka-baas": "khudiyan_ka_baas",
  "tara-ka-baas": "tara_ka_baas",
  "manjwa-ki-dhani": "manjwa_ki_dhani",
  "nokhla-ki-dhani": "nokhla_ki_dhani",
  "khaatiya-ki-dhani": "khaatiya_ki_dhani",
  "khatiyan-ki-dhani": "khatiyan_ki_dhani",
  "anji-ki-dhani": "anji_ki_dhani",
  "govind-singh-ka-baas": "govind_singh_ka_baas",
  "peepli-laxmangarh": "peepli_laxmangarh",
  "bandiabhas ( sikar )": "bandiabhas_sikar",
  "greater-noida": "greater_noida",
  "nuniya-gothda": "nuniya_gothda",
  khatepura: "khatehpura",
  "charkhi dadri": "charkhi_dadri",
  "bandiabhas (sikar)": "bandiabhas_sikar",
  rayala: "rayala",
  rayla: "rayala",
};

/**
 * Normalize a village name string for lookup
 * Removes extra spaces, lowercases, replaces hyphens/special chars
 */
const normalizeVillage = (name) => {
  if (!name) return "";
  const normalized = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_");
  return normalized;
};

/**
 * Resolve a village name to its canonical key, checking aliases first
 */
const resolveVillageKey = (name) => {
  if (!name) return "";
  const raw = name.toLowerCase().trim();
  if (VILLAGE_ALIASES[raw]) return VILLAGE_ALIASES[raw];
  const normalized = normalizeVillage(name);
  if (VILLAGE_ALIASES[normalized]) return VILLAGE_ALIASES[normalized];
  return normalized;
};

/**
 * Get coordinates for a village by name
 * @param {string} villageName - Village name (case-insensitive)
 * @returns {Object|null} - { lat, lng, type } or null
 */
export const getVillageCoords = (villageName) => {
  if (!villageName) return null;
  const key = resolveVillageKey(villageName);
  return VILLAGE_COORDS[key] || null;
};

/**
 * Get all known village coordinates
 * @returns {Object} - The full VILLAGE_COORDS map
 */
export const getAllVillageCoords = () => {
  return { ...VILLAGE_COORDS };
};

/**
 * Get a color based on location type
 * @param {string} type - ancestral, wife, daughter, town, city, unknown
 * @returns {string} - Hex color
 */
export const getMarkerColor = (type) => {
  const colors = {
    ancestral: "#2ecc71",
    wife: "#3498db",
    daughter: "#e67e22",
    migration: "#9b59b6",
    town: "#95a5a6",
    city: "#7f8c8d",
    unknown: "#bdc3c7",
  };
  return colors[type] || colors.unknown;
};

/**
 * Extract geographic data from member tree(s) for one or more villages
 * @param {Object} db - Database with village keys
 * @returns {Object} - { nodes: Array<Object>, edges: Array<Object> }
 */
export const buildGeoData = (db) => {
  const villageNodes = new Map();
  const edgeMap = new Map();
  const addedMemberIds = new Set();

  const villages = Object.keys(db).filter((v) => db[v]?.length);

  for (const homeVillage of villages) {
    const members = db[homeVillage];
    if (!members?.length) continue;

    ensureVillageNode(villageNodes, homeVillage, "ancestral");

    const traverse = (member) => {
      if (!member || !member.name) return;

      if (!addedMemberIds.has(member.id)) {
        addMemberToNode(villageNodes, homeVillage, member);
        addedMemberIds.add(member.id);
      }

      if (member.gender === "M" && member.wives?.length) {
        for (const wife of member.wives) {
          if (wife.village && wife.village.toLowerCase() !== homeVillage) {
            const wv = wife.village.toLowerCase();
            ensureVillageNode(villageNodes, wv, "wife");
            if (!addedMemberIds.has(wife.id)) {
              addMemberToNode(villageNodes, wv, wife);
              addedMemberIds.add(wife.id);
            }
            if (!addedMemberIds.has(member.id)) {
              addMemberToNode(villageNodes, wv, member);
              addedMemberIds.add(member.id);
            }
            addEdge(edgeMap, homeVillage, wv, 1, "marriage");
          }
        }
      }

      if (member.gender === "F" && member.village && member.village.toLowerCase() !== homeVillage) {
        const sv = member.village.toLowerCase();
        ensureVillageNode(villageNodes, sv, "daughter");
        addMemberToNode(villageNodes, sv, member);
        addEdge(edgeMap, homeVillage, sv, 1, "settlement");
      }

      if (member.gender === "M" && member.isMoved && member.village && member.village.toLowerCase() !== homeVillage) {
        const mv = member.village.toLowerCase();
        ensureVillageNode(villageNodes, mv, "migration");
        if (!addedMemberIds.has(member.id)) {
          addMemberToNode(villageNodes, mv, member);
          addedMemberIds.add(member.id);
        }
        addEdge(edgeMap, homeVillage, mv, 1, "migration");
      }

      if (member.gender === "M" && member.children?.length) {
        member.children.forEach(traverse);
      }

      member.wives?.forEach((wife) => {
        if (wife.children?.length) {
          wife.children.forEach(traverse);
        }
      });
    };

    members.forEach(traverse);
  }

  const nodes = [];
  for (const [name, data] of villageNodes) {
    const key = resolveVillageKey(name);
    const coords = VILLAGE_COORDS[key];
    if (!coords) continue;
    nodes.push({
      id: key || name,
      name: data.label || name.charAt(0).toUpperCase() + name.slice(1),
      lat: coords.lat,
      lng: coords.lng,
      type: data.type,
      count: data.count,
      members: data.members || [],
    });
  }

  const edges = [];
  for (const [key, weight] of edgeMap) {
    const [source, target] = key.split("||");
    const sourceNode = villageNodes.get(source);
    const targetNode = villageNodes.get(target);
    if (sourceNode && targetNode) {
      edges.push({ source, target, weight });
    }
  }

  return { nodes, edges };
};

function ensureVillageNode(villageNodes, name, type) {
  const key = name.toLowerCase();
  if (!villageNodes.has(key)) {
    villageNodes.set(key, {
      count: 0,
      type,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      members: [],
    });
  }
}

function addMemberToNode(villageNodes, villageName, member) {
  const key = villageName.toLowerCase();
  const data = villageNodes.get(key);
  if (data) {
    if (!data.members.some((m) => m.id === member.id)) {
      data.members.push(member);
    }
    data.count = data.members.length;
  }
}

function addEdge(edgeMap, source, target, weight, type) {
  const key = [source.toLowerCase(), target.toLowerCase()].sort().join("||");
  edgeMap.set(key, (edgeMap.get(key) || 0) + weight);
}
