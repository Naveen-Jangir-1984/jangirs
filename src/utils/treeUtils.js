/**
 * Generic tree traversal utility functions
 */

/**
 * Traverse tree and collect members matching a predicate
 * @param {Array} members - Array of member nodes
 * @param {Function} predicate - Function to test each member
 * @param {Object} options - Traversal options
 * @returns {Array} - Array of matching members
 */
export const traverseMembers = (members, predicate, options = {}) => {
  const { includeWives = false, onlyMaleChildren = true } = options;
  let result = [];

  for (const member of members) {
    if (predicate(member)) {
      result.push(member);
    }

    // Traverse children
    if (member.children?.length) {
      if (!onlyMaleChildren || member.gender === "M") {
        result = result.concat(traverseMembers(member.children, predicate, options));
      }
    }

    // Traverse wives if needed
    if (includeWives && member.wives?.length) {
      result = result.concat(traverseMembers(member.wives, predicate, options));
    }
  }

  return result;
};

/**
 * Count members matching various criteria in a single pass
 * @param {Array} members - Array of member nodes
 * @returns {Object} - Statistics object with all counts
 */
export const computeMemberStats = (members) => {
  const stats = {
    maleAliveMarried: 0,
    maleDeadMarried: 0,
    maleAliveUnmarried: 0,
    maleDeadUnmarried: 0,
    femaleAliveMarried: 0,
    femaleDeadMarried: 0,
    femaleAliveUnmarried: 0,
    femaleDeadUnmarried: 0,
    maleVillages: new Set(),
    maleGotras: new Set(),
    femaleVillages: new Set(),
    femaleGotras: new Set(),
    maleVillageCount: {},
    maleGotraCount: {},
    femaleVillageCount: {},
    femaleGotraCount: {},
  };

  const traverse = (member) => {
    // Male statistics
    if (member.gender === "M") {
      const isMarried = member.wives?.length > 0;
      if (member.isAlive) {
        isMarried ? stats.maleAliveMarried++ : stats.maleAliveUnmarried++;
      } else {
        isMarried ? stats.maleDeadMarried++ : stats.maleDeadUnmarried++;
      }

      // Collect wife's village and gotra for male filters
      if (member.wives?.length && member.wives[0].village) {
        const village = member.wives[0].village;
        stats.maleVillages.add(village);
        stats.maleVillageCount[village] = (stats.maleVillageCount[village] || 0) + 1;
      }
      if (member.wives?.length && member.wives[0].gotra) {
        const gotra = member.wives[0].gotra;
        stats.maleGotras.add(gotra);
        stats.maleGotraCount[gotra] = (stats.maleGotraCount[gotra] || 0) + 1;
      }

      // Traverse children only for males
      member.children?.forEach(traverse);
    }

    // Female statistics (married daughters)
    if (member.gender === "F") {
      const isMarried = member.village !== undefined;
      if (member.isAlive) {
        isMarried ? stats.femaleAliveMarried++ : stats.femaleAliveUnmarried++;
      } else {
        isMarried ? stats.femaleDeadMarried++ : stats.femaleDeadUnmarried++;
      }

      // Collect village and gotra for female filters
      if (member.village) {
        stats.femaleVillages.add(member.village);
        stats.femaleVillageCount[member.village] = (stats.femaleVillageCount[member.village] || 0) + 1;
      }
      if (member.gotra) {
        stats.femaleGotras.add(member.gotra);
        stats.femaleGotraCount[member.gotra] = (stats.femaleGotraCount[member.gotra] || 0) + 1;
      }
    }
  };

  members.forEach(traverse);

  // Convert Sets to sorted arrays
  stats.maleVillages = [...stats.maleVillages].sort();
  stats.maleGotras = [...stats.maleGotras].sort();
  stats.femaleVillages = [...stats.femaleVillages].sort();
  stats.femaleGotras = [...stats.femaleGotras].sort();

  return stats;
};

/**
 * Compute alive and dead member counts for a subtree
 * @param {Object} member - Root member of subtree
 * @returns {Object} - { alive: number, dead: number }
 */
export const computeSubtreeCounts = (member) => {
  let alive = member.isAlive ? 1 : 0;
  let dead = member.isAlive ? 0 : 1;

  // Count children (only males for male count)
  const traverseChildren = (child, countFemales) => {
    if (countFemales || child.gender === "M") {
      if (child.isAlive) alive++;
      else dead++;
    }
    child.children?.forEach((c) => traverseChildren(c, false));
    child.wives?.forEach((w) => traverseChildren(w, true));
  };

  member.children?.forEach((c) => traverseChildren(c, false));
  member.wives?.forEach((w) => traverseChildren(w, true));

  return { alive, dead };
};

/**
 * Pre-compute counts for all members in the tree
 * @param {Array} members - Root level members
 * @returns {Map} - Map of memberId -> { alive, dead }
 */
export const precomputeAllCounts = (members) => {
  const countsMap = new Map();

  const traverse = (member) => {
    countsMap.set(member.id, computeSubtreeCounts(member));
    member.children?.forEach(traverse);
    member.wives?.forEach(traverse);
  };

  members.forEach(traverse);
  return countsMap;
};

/**
 * Traverse to add a member to the tree (returns new object references)
 */
export const addMemberToTree = (tree, id, member, type) => {
  if (!tree) return null;

  // Create a new object to ensure React detects the change
  const updatedTree = { ...tree };

  if (updatedTree.id === id && type === "child") {
    updatedTree.children = updatedTree.children ? [...updatedTree.children, member] : [member];
    return updatedTree;
  } else if (updatedTree.id === id && type === "wife") {
    updatedTree.wives = updatedTree.wives ? [...updatedTree.wives, member] : [member];
    return updatedTree;
  }

  // Recursively update children with new references
  if (updatedTree.children) {
    updatedTree.children = updatedTree.children.map((child) => addMemberToTree(child, id, member, type));
  }

  return updatedTree;
};

/**
 * Traverse to edit a member in the tree (returns new object references)
 */
export const editMemberInTree = (tree, updatedMember) => {
  if (!tree) return null;

  // Create a new object to ensure React detects the change
  let updatedTree = { ...tree };

  // If this is the member to update, apply the new fields
  if (updatedTree.id === updatedMember.id) {
    updatedTree = {
      ...updatedTree,
      name: updatedMember.name,
      gender: updatedMember.gender,
      isAlive: updatedMember.isAlive,
      dob: updatedMember.dob,
      dod: updatedMember.dod,
      village: updatedMember.village,
      gotra: updatedMember.gotra,
      email: updatedMember.email,
      mobile: updatedMember.mobile,
    };
  }

  // Recursively update children with new references
  if (updatedTree.children) {
    updatedTree.children = updatedTree.children.map((child) => editMemberInTree(child, updatedMember));
  }

  // Recursively update wives with new references
  if (updatedTree.wives) {
    updatedTree.wives = updatedTree.wives.map((wife) => editMemberInTree(wife, updatedMember));
  }

  return updatedTree;
};

/**
 * Traverse to delete a member from the tree
 */
export const deleteMemberFromTree = (tree, id) => {
  if (!tree) return null;
  if (tree.children) {
    tree.children = tree.children.filter((child) => child.id !== id);
  }
  tree.children?.forEach((child) => deleteMemberFromTree(child, id));
  if (tree.wives) {
    tree.wives = tree.wives.filter((wife) => wife.id !== id);
  }
  tree.wives?.forEach((wife) => deleteMemberFromTree(wife, id));
  return tree;
};

/**
 * Toggle collapse state of a member
 * When collapsing a parent, all descendants are also collapsed.
 * When expanding a parent, only that member is expanded (children stay as they were).
 * Returns a new object to ensure React detects the change
 */
export const toggleMemberCollapse = (member, id) => {
  // If we found the target member
  if (member.id === id && member.gender === "M") {
    const willBeCollapsed = !member.isCollapsed;

    // If collapsing, also collapse all descendants using toggleAllMembers
    if (willBeCollapsed) {
      return toggleAllMembers(member, true);
    }

    // If expanding, only expand this member — leave children's state unchanged
    const newChildren = member.children?.map((child) => toggleMemberCollapse(child, id));
    return {
      ...member,
      isCollapsed: false,
      children: newChildren,
    };
  }

  // Not the target — traverse children to find it
  const newChildren = member.children?.map((child) => toggleMemberCollapse(child, id));
  return newChildren ? { ...member, children: newChildren } : member;
};

/**
 * Expand or collapse all members
 * Returns a new object to ensure React detects the change
 */
export const toggleAllMembers = (member, flag) => {
  const newChildren = member.gender === "M" && member.children ? member.children.map((child) => toggleAllMembers(child, flag)) : member.children;

  return {
    ...member,
    isCollapsed: flag,
    children: newChildren,
  };
};

/**
 * Get male members filtered by wife's village
 */
export const getMalesByVillage = (members, village) => {
  return traverseMembers(members, (m) => m.wives?.length > 0 && m.wives[0].village === village, { onlyMaleChildren: true });
};

/**
 * Get male members filtered by wife's gotra
 */
export const getMalesByGotra = (members, gotra) => {
  return traverseMembers(members, (m) => m.wives?.length > 0 && m.wives[0].gotra === gotra, { onlyMaleChildren: true });
};

/**
 * Get female members filtered by village (married daughters)
 */
export const getFemalesByVillage = (members, village) => {
  return traverseMembers(members, (m) => m.gender === "F" && m.gotra !== undefined && m.village === village, { onlyMaleChildren: true });
};

/**
 * Get female members filtered by gotra (married daughters)
 */
export const getFemalesByGotra = (members, gotra) => {
  return traverseMembers(members, (m) => m.gender === "F" && m.village !== undefined && m.gotra === gotra, { onlyMaleChildren: true });
};

/**
 * Collect all mobile numbers from a member's subtree
 */
export const collectMobileNumbers = (member) => {
  const numbers = [];

  const traverse = (m) => {
    if (m.mobile?.length) {
      numbers.push(m.mobile[0]);
    }
    if (m.gender === "M") {
      m.children?.forEach(traverse);
    }
  };

  traverse(member);
  return numbers;
};

/**
 * Extract initial collapse states from members into a Map
 * @param {Array} members - Array of member nodes
 * @returns {Map} - Map of member id -> isCollapsed state
 */
export const extractInitialCollapseStates = (members) => {
  const collapseMap = new Map();

  const traverse = (member) => {
    if (member.gender === "M" && member.isCollapsed !== undefined) {
      collapseMap.set(member.id, member.isCollapsed);
    }
    member.children?.forEach(traverse);
  };

  members.forEach(traverse);
  return collapseMap;
};

/**
 * Restore collapse states from a Map
 * @param {Object} member - Member node
 * @param {Map} collapseMap - Map of member id -> isCollapsed state
 * @returns {Object} - Member with restored collapse state
 */
export const restoreCollapseStates = (member, collapseMap) => {
  const newChildren = member.children?.map((child) => restoreCollapseStates(child, collapseMap));

  if (member.gender === "M" && collapseMap.has(member.id)) {
    return {
      ...member,
      isCollapsed: collapseMap.get(member.id),
      children: newChildren,
    };
  }

  return newChildren ? { ...member, children: newChildren } : member;
};

/**
 * Collect all birthdays from the tree members (including wives)
 * @param {Array} members - Array of member nodes
 * @returns {Array} - Array of { member, eventType, dateObj, month, day, age } objects
 */
export const collectBirthdays = (members) => {
  const events = [];

  const traverse = (member) => {
    if (member.dob) {
      const parts = member.dob.split(" ");
      if (parts.length === 3) {
        const monthIndex = MONTHS_REF.indexOf(parts[1]);
        if (monthIndex !== -1) {
          const day = parseInt(parts[0], 10);
          const year = parseInt(parts[2], 10);
          const today = new Date();
          const birthDate = new Date(year, monthIndex, day);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - monthIndex;
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
            age--;
          }
          events.push({
            member,
            eventType: "birthday",
            dateObj: new Date(today.getFullYear(), monthIndex, day),
            month: monthIndex,
            day,
            year,
            age: Math.max(0, age),
          });
        }
      }
    }

    // Traverse children (male lineage)
    if (member.gender === "M" && member.children?.length) {
      member.children.forEach(traverse);
    }

    // Traverse wives
    if (member.wives?.length) {
      member.wives.forEach(traverse);
    }
  };

  members.forEach(traverse);
  return events;
};

/**
 * Collect all death anniversaries from the tree members (including wives)
 * @param {Array} members - Array of member nodes
 * @returns {Array} - Array of { member, eventType, dateObj, month, day, deathAge } objects
 */
export const collectDeathAnniversaries = (members) => {
  const events = [];

  const traverse = (member) => {
    if (member.dod) {
      const parts = member.dod.split(" ");
      if (parts.length === 3) {
        const monthIndex = MONTHS_REF.indexOf(parts[1]);
        if (monthIndex !== -1) {
          const day = parseInt(parts[0], 10);
          const year = parseInt(parts[2], 10);
          events.push({
            member,
            eventType: "anniversary",
            dateObj: new Date(new Date().getFullYear(), monthIndex, day),
            month: monthIndex,
            day,
            year,
            deathYear: year,
          });
        }
      }
    }

    // Traverse children (male lineage)
    if (member.gender === "M" && member.children?.length) {
      member.children.forEach(traverse);
    }

    // Traverse wives
    if (member.wives?.length) {
      member.wives.forEach(traverse);
    }
  };

  members.forEach(traverse);
  return events;
};

/**
 * Get events for a specific month
 * @param {Array} members - Array of member nodes
 * @param {number} month - Month index (0-11)
 * @param {number} year - Year
 * @returns {Array} - Combined and sorted events for the month
 */
export const getEventsForMonth = (members, month, year) => {
  const birthdays = collectBirthdays(members);
  const anniversaries = collectDeathAnniversaries(members);
  const allEvents = [...birthdays, ...anniversaries];

  // Filter for the selected month
  const monthEvents = allEvents.filter((event) => event.month === month);

  // Sort by day
  monthEvents.sort((a, b) => a.day - b.day);

  // Compute days until event for upcoming section
  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();

  monthEvents.forEach((event) => {
    if (event.month === todayMonth) {
      if (event.day >= todayDay) {
        event.daysUntil = event.day - todayDay;
      } else {
        // Already passed this year, compute days until next year
        const eventNextYear = new Date(year + 1, event.month, event.day);
        event.daysUntil = Math.ceil((eventNextYear - today) / (1000 * 60 * 60 * 24));
        event.isPast = true;
      }
    } else if (event.month > todayMonth) {
      const eventDate = new Date(year, event.month, event.day);
      event.daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
      event.isPast = false;
    } else {
      // Month already passed this year
      const eventNextYear = new Date(year + 1, event.month, event.day);
      event.daysUntil = Math.ceil((eventNextYear - today) / (1000 * 60 * 60 * 24));
      event.isPast = true;
    }
  });

  return monthEvents;
};

/**
 * Get upcoming events within the next N days
 * @param {Array} members - Array of member nodes
 * @param {number} days - Number of days to look ahead
 * @returns {Array} - Sorted array of upcoming events
 */
export const getUpcomingEvents = (members, days = 30) => {
  const birthdays = collectBirthdays(members);
  const anniversaries = collectDeathAnniversaries(members);
  const allEvents = [...birthdays, ...anniversaries];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);

  const upcoming = allEvents
    .map((event) => {
      // Calculate next occurrence of this event
      const eventThisYear = new Date(today.getFullYear(), event.month, event.day);
      if (eventThisYear < today) {
        // Already passed, use next year
        eventThisYear.setFullYear(today.getFullYear() + 1);
      }
      event.daysUntil = Math.ceil((eventThisYear - today) / (1000 * 60 * 60 * 24));
      event.nextOccurrence = eventThisYear;
      return event;
    })
    .filter((event) => event.daysUntil >= 0 && event.daysUntil <= days)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return upcoming;
};

// Reference for month name parsing
const MONTHS_REF = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/**
 * Calculate the generation range (min and max) for a tree
 * @param {Array} members - Array of root member nodes
 * @returns {Object} - { min: number, max: number }
 */
export const calculateGenerationRange = (members) => {
  if (!members || members.length === 0) return { min: 1, max: 1 };

  let minGen = Infinity;
  let maxGen = 0;

  const traverse = (member, currentGen) => {
    // Skip members who have moved to another village
    if (member.isMoved) {
      return;
    }

    if (currentGen < minGen) minGen = currentGen;
    if (currentGen > maxGen) maxGen = currentGen;

    if (member.gender === "M" && member.children?.length) {
      member.children.forEach((child) => traverse(child, currentGen + 1));
    }
  };

  members.forEach((member) => {
    const startGen = member.generation || 1;
    traverse(member, startGen);
  });

  return { min: minGen === Infinity ? 1 : minGen, max: maxGen || 1 };
};
