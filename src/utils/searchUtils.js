/**
 * Search utility functions for Global Search Bar
 * Provides fuzzy search across all members by name, mobile, email, village, gotra
 */

/**
 * Recursively flatten the nested member tree into a flat array
 * Traverses children arrays (male lineage) and wives arrays
 * @param {Array} members - Array of root member nodes
 * @param {string} village - The village this tree belongs to
 * @returns {Array} - Flat array of { member, sourceVillage }
 */
const flattenTree = (members, sourceVillage) => {
  const result = [];

  const traverse = (member) => {
    if (!member) return;

    // Add the member with its source village
    result.push({ member, sourceVillage });

    // Traverse children (only for males)
    if (member.gender === "M" && member.children?.length) {
      member.children.forEach(traverse);
    }

    // Traverse wives
    if (member.wives?.length) {
      member.wives.forEach(traverse);
    }
  };

  members.forEach(traverse);
  return result;
};

/**
 * Flatten all villages' member trees into a single flat array
 * @param {Array} dulania - Dulania village member tree
 * @param {Array} moruwa - Moruwa village member tree
 * @param {Array} tatija - Tatija village member tree
 * @returns {Array} - Flat array of all members with source village info
 */
export const flattenAllMembers = (dulania, moruwa, tatija) => {
  const all = [];

  if (dulania?.length) {
    all.push(...flattenTree(dulania, "dulania"));
  }
  if (moruwa?.length) {
    all.push(...flattenTree(moruwa, "moruwa"));
  }
  if (tatija?.length) {
    all.push(...flattenTree(tatija, "tatija"));
  }

  return all;
};

/**
 * Simple but effective fuzzy matching score
 * Returns a score (higher = better match) or 0 if no match
 */
const getFuzzyScore = (text, query) => {
  if (!text || !query) return 0;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Exact match - highest score
  if (lowerText === lowerQuery) return 100;

  // Starts with query
  if (lowerText.startsWith(lowerQuery)) return 80;

  // Contains query as substring
  if (lowerText.includes(lowerQuery)) return 60;

  // Fuzzy match: check if all characters of query appear in order in text
  let qi = 0;
  for (let ti = 0; ti < lowerText.length && qi < lowerQuery.length; ti++) {
    if (lowerText[ti] === lowerQuery[qi]) {
      qi++;
    }
  }

  if (qi === lowerQuery.length) {
    // Score based on how compact the match is
    return 40;
  }

  // Word-level matching: check if any word in text starts with query
  const words = lowerText.split(/[\s-]+/);
  for (const word of words) {
    if (word.startsWith(lowerQuery)) return 50;
    if (word.includes(lowerQuery)) return 30;
  }

  return 0;
};

/**
 * Get the field(s) that matched the query for display purposes
 * Returns an array of { field, value } objects
 */
const getMatchedFields = (member, query) => {
  const matched = [];
  const lowerQuery = query.toLowerCase();

  // Check name
  if (member.name && getFuzzyScore(member.name, query) > 0) {
    matched.push({ field: "name", value: member.name });
  }

  // Check mobile numbers
  if (member.mobile?.length) {
    for (const m of member.mobile) {
      const mobileStr = m.toString();
      if (getFuzzyScore(mobileStr, query) > 0) {
        matched.push({ field: "mobile", value: mobileStr });
        break;
      }
    }
  }

  // Check emails
  if (member.email?.length) {
    for (const e of member.email) {
      if (getFuzzyScore(e, query) > 0) {
        matched.push({ field: "email", value: e });
        break;
      }
    }
  }

  // Check village
  if (member.village && getFuzzyScore(member.village, query) > 0) {
    matched.push({ field: "village", value: member.village });
  }

  // Check gotra
  if (member.gotra && getFuzzyScore(member.gotra, query) > 0) {
    matched.push({ field: "gotra", value: member.gotra });
  }

  return matched;
};

/**
 * Perform fuzzy search across all flat members
 * @param {string} query - Search query string
 * @param {Array} flatMembers - Flat array of { member, sourceVillage } objects
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Array} - Sorted array of { member, sourceVillage, score, matchedFields } objects
 */
export const fuzzySearch = (query, flatMembers, maxResults = 20) => {
  if (!query || query.trim().length < 1) return [];

  const trimmedQuery = query.trim();

  // Score each member
  const scored = [];

  for (const item of flatMembers) {
    const member = item.member;

    // Skip members with no name (anonymous/unlabeled)
    if (!member.name) continue;

    // Calculate scores for different fields
    const nameScore = getFuzzyScore(member.name, trimmedQuery);
    const mobileScore = member.mobile?.length ? Math.max(...member.mobile.map((m) => getFuzzyScore(m.toString(), trimmedQuery))) : 0;
    const emailScore = member.email?.length ? Math.max(...member.email.map((e) => getFuzzyScore(e, trimmedQuery))) : 0;
    const villageScore = getFuzzyScore(member.village, trimmedQuery);
    const gotraScore = getFuzzyScore(member.gotra, trimmedQuery);

    const maxScore = Math.max(nameScore, mobileScore, emailScore, villageScore, gotraScore);

    if (maxScore > 0) {
      scored.push({
        member,
        sourceVillage: item.sourceVillage,
        score: maxScore,
        matchedFields: getMatchedFields(member, trimmedQuery),
      });
    }
  }

  // Sort by score descending, then alphabetically by name
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.member.name || "").localeCompare(b.member.name || "");
  });

  return scored.slice(0, maxResults);
};

export default { flattenAllMembers, fuzzySearch };
