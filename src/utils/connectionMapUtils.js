/**
 * Connection Map Utilities
 * Extracts inter-gotra and inter-village marriage connections from the family tree
 */

/**
 * Build a complete gotra connection graph from all village trees
 * Algorithm:
 *  - Each male member (Jangir) with a wife creates an edge: "Jangir" → wife.gotra
 *  - Each married daughter creates an edge: "Jangir" → daughter.gotra
 *  - Males with multiple wives connect those wife-gotras together
 * @param {Object} db - Database with dulania, moruwa, tatija members
 * @returns {Object} - { nodes: Array<Object>, edges: Array<Object> }
 */
export const buildConnectionGraph = (db) => {
  const gotraMap = new Map(); // gotra name -> { count, villages: Set, connections: Map<gotra, weight>, members: Array }
  const edgeSet = new Set(); // dedup "gotraA||gotraB"

  const villages = Object.keys(db).filter((v) => db[v]?.length);

  // Process each village tree
  for (const village of villages) {
    const members = db[village];
    if (!members || !members.length) continue;
    members.forEach((rootMember) => {
      traverseTree(rootMember, gotraMap, edgeSet, village);
    });
  }

  // Convert maps to arrays for rendering
  const nodes = [];
  for (const [name, data] of gotraMap) {
    // Build sorted connections array
    const connections = [...data.connections.entries()].map(([gotra, weight]) => ({ gotra, weight })).sort((a, b) => b.weight - a.weight);

    // Deduplicate members by id
    const memberMap = new Map();
    for (const m of data.members || []) {
      if (!memberMap.has(m.id)) {
        memberMap.set(m.id, m);
      }
    }

    nodes.push({
      id: name,
      name,
      count: data.count,
      villages: [...data.villages].sort(),
      connections,
      members: [...memberMap.values()],
      memberPairs: data.memberPairs || [],
    });
  }

  // Build edges array from connection maps
  const edges = [];
  const processedEdgeSet = new Set();
  for (const node of nodes) {
    for (const conn of node.connections) {
      const edgeKey = [node.id, conn.gotra].sort().join("||");
      if (!processedEdgeSet.has(edgeKey)) {
        processedEdgeSet.add(edgeKey);
        edges.push({
          source: node.id,
          target: conn.gotra,
          weight: conn.weight,
        });
      }
    }
  }

  return { nodes, edges };
};

/**
 * Traverse a member subtree to collect gotra connections and member lists
 */
function traverseTree(member, gotraMap, edgeSet, village) {
  if (!member) return;

  const JANGIR = "Mayal";

  // Process male members — they are Jangir by default, marry into other gotras
  if (member.gender === "M" && member.wives?.length) {
    const wifeGotras = member.wives.map((w) => w.gotra).filter(Boolean);
    const uniqueWifeGotras = [...new Set(wifeGotras)];

    // Register Jangir node if any marriage exists, add male to Mayal members
    ensureGotraNode(gotraMap, JANGIR, village);
    addMemberToGotra(gotraMap, JANGIR, member);

    // Create edges: Jangir <-> each wife's gotra (unique)
    for (const gotra of uniqueWifeGotras) {
      const g = gotra.trim();
      if (g && g !== JANGIR) {
        ensureGotraNode(gotraMap, g, village);
        addEdgeBetween(gotraMap, edgeSet, JANGIR, g, 1);
        // Add husband (male member) to wife's gotra as associated
        addMemberToGotra(gotraMap, g, member);
      }
    }

    // Add each wife as a member to her own gotra AND create a paired entry (wife + husband)
    for (const wife of member.wives) {
      if (wife.gotra && wife.gotra.trim() && wife.gotra.trim() !== JANGIR) {
        const wg = wife.gotra.trim();
        // Ensure the gotra node exists (safe guard) and add the wife member
        if (!gotraMap.has(wg)) {
          gotraMap.set(wg, { count: 0, villages: new Set(), connections: new Map() });
        }
        addMemberToGotra(gotraMap, wg, wife);
        // Create a paired entry (wife + husband) for combined display
        addMemberPair(gotraMap, wg, { wife: wife, husband: member });
      }
    }

    // If multiple wives from different gotras, connect those gotras
    if (uniqueWifeGotras.length >= 2) {
      const unique = [...new Set(uniqueWifeGotras.map((g) => g.trim()).filter(Boolean))];
      for (let i = 0; i < unique.length; i++) {
        for (let j = i + 1; j < unique.length; j++) {
          if (unique[i] !== unique[j]) {
            addEdgeBetween(gotraMap, edgeSet, unique[i], unique[j], 1);
          }
        }
      }
    }
  }

  // Process female members (daughters) — they inherit gotra from marriage
  if (member.gender === "F" && member.gotra && member.village) {
    const g = member.gotra.trim();
    if (g) {
      ensureGotraNode(gotraMap, JANGIR, village);
      ensureGotraNode(gotraMap, g, member.village || village);
      addEdgeBetween(gotraMap, edgeSet, JANGIR, g, 1);
      // Add daughter to her married gotra
      addMemberToGotra(gotraMap, g, member);
    }
  }

  // Also add male members without wives to Mayal
  if (member.gender === "M" && (!member.wives || member.wives.length === 0) && member.name) {
    ensureGotraNode(gotraMap, JANGIR, village);
    addMemberToGotra(gotraMap, JANGIR, member);
  }

  // Traverse children (only males to avoid double counting through wives)
  if (member.gender === "M" && member.children?.length) {
    member.children.forEach((child) => traverseTree(child, gotraMap, edgeSet, village));
  }

  // Traverse wives (they may have children listed under them in some cases)
  if (member.wives?.length) {
    member.wives.forEach((wife) => {
      if (wife.children?.length) {
        wife.children.forEach((child) => traverseTree(child, gotraMap, edgeSet, village));
      }
    });
  }
}

/**
 * Add a member to a gotra node's member list
 */
function addMemberToGotra(gotraMap, gotraName, member) {
  const data = gotraMap.get(gotraName);
  if (data) {
    if (!data.members) {
      data.members = [];
    }
    data.members.push(member);
  }
}

/**
 * Add a member pair (e.g., wife + husband) to a gotra node for combined display
 */
function addMemberPair(gotraMap, gotraName, pair) {
  const data = gotraMap.get(gotraName);
  if (data) {
    if (!data.memberPairs) {
      data.memberPairs = [];
    }
    // Deduplicate by wifeId||husbandId
    const key = (pair.wife?.id || "") + "||" + (pair.husband?.id || "");
    if (!data.memberPairs.some((p) => (p.wife?.id || "") + "||" + (p.husband?.id || "") === key)) {
      data.memberPairs.push(pair);
    }
  }
}

/**
 * Ensure a gotra node exists in the map
 */
function ensureGotraNode(gotraMap, name, village) {
  if (!gotraMap.has(name)) {
    gotraMap.set(name, {
      count: 0,
      villages: new Set(),
      connections: new Map(), // gotra -> weight
      memberPairs: [],
    });
  }
  const data = gotraMap.get(name);
  data.count++;
  if (village) data.villages.add(village);
}

/**
 * Add a weighted edge between two gotras (undirected)
 */
function addEdgeBetween(gotraMap, edgeSet, gotraA, gotraB, weight = 1) {
  if (gotraA === gotraB) return;

  // Update gotraA's connections
  const dataA = gotraMap.get(gotraA);
  if (dataA) {
    const currentWeight = dataA.connections.get(gotraB) || 0;
    dataA.connections.set(gotraB, currentWeight + weight);
  }

  // Update gotraB's connections
  const dataB = gotraMap.get(gotraB);
  if (dataB) {
    const currentWeight = dataB.connections.get(gotraA) || 0;
    dataB.connections.set(gotraA, currentWeight + weight);
  }
}

/**
 * Get connection statistics
 * @param {Array} nodes - Gotra nodes
 * @param {Array} edges - Edges array
 * @returns {Object} - Statistics
 */
export const getConnectionStats = (nodes, edges) => {
  const totalGotras = nodes.length;
  const totalEdges = edges.length;
  const weights = edges.map((e) => e.weight);
  const maxWeight = Math.max(0, ...weights);
  const maxConnections = Math.max(0, ...nodes.map((n) => n.connections?.length || 0));

  return {
    totalGotras,
    totalEdges,
    maxWeight,
    maxConnections,
    avgConnections: totalGotras ? (totalEdges / totalGotras).toFixed(1) : 0,
  };
};

/**
 * Build inter-village connections
 * Shows marriage connections based on the selected village(s)
 * @param {Object} db - Database with village keys
 * @returns {Object} - { nodes: Array, edges: Array }
 */
export const buildVillageConnections = (db) => {
  const villages = Object.keys(db).filter((v) => db[v]?.length);
  if (!villages.length) return { nodes: [], edges: [] };

  // Single village mode - show marriage connections (wife villages & daughter marriage villages)
  if (villages.length === 1) {
    const village = villages[0];
    const members = db[village];
    const connectionVillages = new Map();
    const villageCount = members.length;

    // Build member list per village
    const villageMembers = new Map(); // village -> member list
    const addedIdsPerVillage = new Map(); // village -> Set of member ids
    const villageMemberPairs = new Map(); // village -> array of {wife, husband} pairs

    const addMemberToVillage = (villageKey, m) => {
      if (!m || !m.name) return;
      if (!addedIdsPerVillage.has(villageKey)) {
        addedIdsPerVillage.set(villageKey, new Set());
      }
      const villageAddedIds = addedIdsPerVillage.get(villageKey);
      if (villageAddedIds.has(m.id)) return;
      villageAddedIds.add(m.id);
      if (!villageMembers.has(villageKey)) {
        villageMembers.set(villageKey, []);
      }
      villageMembers.get(villageKey).push(m);
    };

    const addMemberPairToVillage = (villageKey, pair) => {
      if (!villageMemberPairs.has(villageKey)) {
        villageMemberPairs.set(villageKey, []);
      }
      const pairs = villageMemberPairs.get(villageKey);
      const key = (pair.wife?.id || "") + "||" + (pair.husband?.id || "");
      if (!pairs.some((p) => (p.wife?.id || "") + "||" + (p.husband?.id || "") === key)) {
        pairs.push(pair);
      }
    };

    const traverse = (member) => {
      if (!member) return;
      // Add member to their own village
      addMemberToVillage(village, member);
      // Male with wife from another village
      if (member.gender === "M" && member.wives?.length) {
        for (const wife of member.wives) {
          if (wife.village && wife.village.toLowerCase() !== village) {
            const wv = wife.village.toLowerCase();
            connectionVillages.set(wv, (connectionVillages.get(wv) || 0) + 1);
            // Add the male member also to wife's village node
            addMemberToVillage(wv, member);
            // Also add the wife as a member to her own village
            addMemberToVillage(wv, wife);
            // Create paired entry for the wife's village
            addMemberPairToVillage(wv, { wife: wife, husband: member });
          }
        }
      }
      // Married daughter settled elsewhere
      if (member.gender === "F" && member.village && member.village.toLowerCase() !== village) {
        const sv = member.village.toLowerCase();
        connectionVillages.set(sv, (connectionVillages.get(sv) || 0) + 1);
        // Add daughter to her settlement village
        addMemberToVillage(sv, member);
      }
      // Traverse children
      if (member.gender === "M" && member.children?.length) {
        member.children.forEach(traverse);
      }
      if (member.wives?.length) {
        member.wives.forEach(traverse);
      }
    };

    members.forEach(traverse);

    // Create nodes: the selected village + all connected villages
    const nodes = [{ id: village, name: village.charAt(0).toUpperCase() + village.slice(1), count: villageCount, members: villageMembers.get(village) || [], memberPairs: villageMemberPairs.get(village) || [] }];
    for (const [v, count] of connectionVillages) {
      nodes.push({ id: v, name: v.charAt(0).toUpperCase() + v.slice(1), count, members: villageMembers.get(v) || [], memberPairs: villageMemberPairs.get(v) || [] });
    }

    // Create edges from selected village to each connected village
    const edges = [];
    for (const [target, weight] of connectionVillages) {
      edges.push({ source: village, target, weight });
    }

    return { nodes, edges };
  }

  // Multiple villages mode (original behavior - shows inter-village marriage flow)
  const data = {};
  for (const village of villages) {
    data[village] = { count: 0, outgoing: {} };
  }

  for (const village of villages) {
    const members = db[village];
    if (!members?.length) continue;
    members.forEach((root) => traverseVillage(root, village, data));
  }

  const nodes = villages.map((v) => ({
    id: v,
    name: v.charAt(0).toUpperCase() + v.slice(1),
    count: data[v].count,
  }));

  const edges = [];
  for (const source of villages) {
    for (const [target, weight] of Object.entries(data[source].outgoing)) {
      if (weight > 0 && target !== source) {
        edges.push({ source, target, weight });
      }
    }
  }

  return { nodes, edges };
};

/**
 * Traverse tree for village-level connection data
 */
function traverseVillage(member, homeVillage, data) {
  if (!member) return;

  // Male members with wives from different villages
  if (member.gender === "M" && member.wives?.length) {
    data[homeVillage].count++;
    for (const wife of member.wives) {
      if (wife.village && wife.village.toLowerCase() !== homeVillage) {
        const wv = wife.village.toLowerCase();
        data[homeVillage].outgoing[wv] = (data[homeVillage].outgoing[wv] || 0) + 1;
      }
    }
  }

  // Married daughters settled in other villages
  if (member.gender === "F" && member.village) {
    const settledVillage = member.village.toLowerCase();
    if (settledVillage !== homeVillage) {
      if (!data[settledVillage]) {
        data[settledVillage] = { count: 0, outgoing: {} };
      }
      data[settledVillage].outgoing[homeVillage] = (data[settledVillage].outgoing[homeVillage] || 0) + 1;
    }
  }

  // Traverse children
  if (member.gender === "M" && member.children?.length) {
    member.children.forEach((child) => traverseVillage(child, homeVillage, data));
  }

  // Traverse wives
  if (member.wives?.length) {
    member.wives.forEach((wife) => traverseVillage(wife, homeVillage, data));
  }
}

/**
 * Build an In-law Network showing family-to-family marriage connections.
 * @param {Object} db - Database with dulania, moruwa, tatija members
 * @returns {Object} - { nodes: Array<Object>, edges: Array<Object> }
 */
export const buildInLawNetwork = (db) => {
  const familyMap = new Map();
  const edgeSet = new Set();
  const villages = Object.keys(db).filter((v) => db[v]?.length);

  const getFamilyNodeId = (member, type) => {
    if (type === "jangir") {
      return `jangir-${member.id}`;
    }
    const gotra = (member.gotra || "unknown").trim();
    const village = (member.village || member.wives?.[0]?.village || "unknown").trim();
    return `inlaw-${gotra}-${village}`;
  };

  const ensureFamilyNode = (id, name, type, gotra, village) => {
    if (!familyMap.has(id)) {
      familyMap.set(id, {
        id,
        name,
        type,
        gotra: gotra || "",
        village: village || "",
        count: 0,
        marriages: [],
        connectedFamilies: new Set(),
      });
    }
    const data = familyMap.get(id);
    data.count++;
    return data;
  };

  for (const village of villages) {
    const members = db[village];
    if (!members || !members.length) continue;

    const traverseForInLaws = (member, homeVillage) => {
      if (!member) return;

      if (member.gender === "M" && member.wives?.length) {
        const jangirId = getFamilyNodeId(member, "jangir");
        const jangirName = member.name || "Unknown";
        const jangirNode = ensureFamilyNode(jangirId, jangirName, "mayal", "Mayal", homeVillage);

        for (const wife of member.wives) {
          if (!wife.gotra && !wife.village) continue;
          const inlawId = getFamilyNodeId(wife, "inlaw");
          const inlawName = wife.gotra || wife.village || "Unknown";
          const inlawNode = ensureFamilyNode(inlawId, inlawName, "inlaw", wife.gotra || "", wife.village || "");

          jangirNode.marriages.push({
            jangirName,
            inlawName,
            memberId: wife.id || member.id,
            type: "wife",
            wifeName: wife.name || "",
            wifeGotra: wife.gotra || "",
            wifeVillage: wife.village || "",
          });

          const edgeKey = [jangirId, inlawId].sort().join("||");
          if (!edgeSet.has(edgeKey)) {
            edgeSet.add(edgeKey);
          }
          jangirNode.connectedFamilies.add(inlawId);
          inlawNode.connectedFamilies.add(jangirId);
        }

        if (member.children?.length) {
          for (const child of member.children) {
            traverseForInLaws(child, homeVillage);
          }
        }
      }

      if (member.gender === "F" && member.gotra && member.village) {
        const inlawId = `inlaw-${member.gotra.trim()}-${member.village.trim()}`;
        const inlawName = member.gotra || member.village || "Unknown";
        const inlawNode = ensureFamilyNode(inlawId, inlawName, "inlaw", member.gotra, member.village);

        if (member.fatherId) {
          const fatherId = `jangir-${member.fatherId}`;
          if (familyMap.has(fatherId)) {
            const jangirNode = familyMap.get(fatherId);
            jangirNode.marriages.push({
              jangirName: jangirNode.name,
              inlawName,
              memberId: member.id,
              type: "daughter",
              daughterName: member.name || "",
              daughterGotra: member.gotra || "",
              daughterVillage: member.village || "",
            });
            const edgeKey = [fatherId, inlawId].sort().join("||");
            if (!edgeSet.has(edgeKey)) {
              edgeSet.add(edgeKey);
            }
            jangirNode.connectedFamilies.add(inlawId);
            inlawNode.connectedFamilies.add(fatherId);
          }
        }
      }

      if (member.wives?.length) {
        for (const wife of member.wives) {
          if (wife.children?.length) {
            for (const child of wife.children) {
              traverseForInLaws(child, homeVillage);
            }
          }
        }
      }
    };

    members.forEach((rootMember) => traverseForInLaws(rootMember, village));
  }

  const nodes = [];
  for (const [id, data] of familyMap) {
    nodes.push({
      id,
      name: data.name,
      type: data.type,
      gotra: data.gotra,
      village: data.village,
      count: data.count,
      marriages: data.marriages.slice(0, 100),
      connectionCount: data.connectedFamilies.size,
      connections: [...data.connectedFamilies].map((fid) => {
        const f = familyMap.get(fid);
        return {
          familyId: fid,
          name: f ? f.name : "Unknown",
          type: f ? f.type : "inlaw",
        };
      }),
    });
  }

  const edges = [];
  const processedEdges = new Set();
  for (const node of nodes) {
    for (const conn of node.connections) {
      const edgeKey = [node.id, conn.familyId].sort().join("||");
      if (!processedEdges.has(edgeKey)) {
        processedEdges.add(edgeKey);
        const weight = Math.max(1, node.marriages.length);
        edges.push({
          source: node.id,
          target: conn.familyId,
          weight,
          type: conn.type,
        });
      }
    }
  }

  return { nodes, edges };
};
