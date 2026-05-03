import { useMemo } from "react";
import { computeMemberStats, precomputeAllCounts } from "../utils/treeUtils";

/**
 * Custom hook that memoizes member statistics computation
 * @param {Array} members - Array of member nodes
 * @returns {Object} - Computed statistics
 */
export const useMemberStats = (members) => {
  const stats = useMemo(() => {
    if (!members?.length) {
      return {
        maleAliveMarried: 0,
        maleDeadMarried: 0,
        maleAliveUnmarried: 0,
        maleDeadUnmarried: 0,
        femaleAliveMarried: 0,
        femaleDeadMarried: 0,
        femaleAliveUnmarried: 0,
        femaleDeadUnmarried: 0,
        maleVillages: [],
        maleGotras: [],
        femaleVillages: [],
        femaleGotras: [],
        maleVillageCount: {},
        maleGotraCount: {},
        femaleVillageCount: {},
        femaleGotraCount: {},
      };
    }
    return computeMemberStats(members);
  }, [members]);

  return stats;
};

/**
 * Custom hook that memoizes subtree counts for all members
 * @param {Array} members - Array of member nodes
 * @returns {Map} - Map of memberId -> { alive, dead }
 */
export const useMemberCounts = (members) => {
  const countsMap = useMemo(() => {
    if (!members?.length) return new Map();
    return precomputeAllCounts(members);
  }, [members]);

  return countsMap;
};

/**
 * Custom hook that creates a Map for O(1) image lookups
 * @param {Array} images - Array of image objects with id and src
 * @returns {Map} - Map of memberId -> imageSrc
 */
export const useImageMap = (images) => {
  const imageMap = useMemo(() => {
    if (!images?.length) return new Map();
    return new Map(images.map((img) => [img.id, img.src]));
  }, [images]);

  return imageMap;
};

export default useMemberStats;
