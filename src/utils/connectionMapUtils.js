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
  const gotraMap = new Map(); // gotra name -> { count, villages: Set, connections: Map<gotra, weight> }
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

    nodes.push({
      id: name,
      name,
      count: data.count,
      villages: [...data.villages].sort(),
      connections,
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
 * Traverse a member subtree to collect gotra connections
 */
function traverseTree(member, gotraMap, edgeSet, village) {
  if (!member) return;

  // Process male members — they are Jangir by default, marry into other gotras
  if (member.gender === "M" && member.wives?.length) {
    const wifeGotras = member.wives.map((w) => w.gotra).filter(Boolean);
    const uniqueWifeGotras = [...new Set(wifeGotras)];
    const JANGIR = "Jangir";

    // Register Jangir node if any marriage exists
    ensureGotraNode(gotraMap, JANGIR, village);

    // Create edges: Jangir <-> each wife's gotra
    for (const gotra of uniqueWifeGotras) {
      const g = gotra.trim();
      if (g && g !== JANGIR) {
        ensureGotraNode(gotraMap, g, village);
        addEdgeBetween(gotraMap, edgeSet, JANGIR, g, 1);
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
    const JANGIR = "Jangir";
    const g = member.gotra.trim();
    if (g) {
      ensureGotraNode(gotraMap, JANGIR, village);
      ensureGotraNode(gotraMap, g, member.village || village);
      addEdgeBetween(gotraMap, edgeSet, JANGIR, g, 1);
    }
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
 * Ensure a gotra node exists in the map
 */
function ensureGotraNode(gotraMap, name, village) {
  if (!gotraMap.has(name)) {
    gotraMap.set(name, {
      count: 0,
      villages: new Set(),
      connections: new Map(), // gotra -> weight
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

    const traverse = (member) => {
      // Male with wife from another village
      if (member.gender === "M" && member.wives?.length) {
        for (const wife of member.wives) {
          if (wife.village && wife.village.toLowerCase() !== village) {
            const wv = wife.village.toLowerCase();
            connectionVillages.set(wv, (connectionVillages.get(wv) || 0) + 1);
          }
        }
      }
      // Married daughter settled elsewhere
      if (member.gender === "F" && member.village && member.village.toLowerCase() !== village) {
        const sv = member.village.toLowerCase();
        connectionVillages.set(sv, (connectionVillages.get(sv) || 0) + 1);
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
    const nodes = [{ id: village, name: village.charAt(0).toUpperCase() + village.slice(1), count: villageCount }];
    for (const [v, count] of connectionVillages) {
      nodes.push({ id: v, name: v.charAt(0).toUpperCase() + v.slice(1), count });
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
