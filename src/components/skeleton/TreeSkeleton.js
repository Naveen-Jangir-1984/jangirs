import React from "react";
import { SkeletonAvatar, SkeletonText, SkeletonRect } from "./Skeleton";
import "./Skeleton.css";

/**
 * TreeSkeleton - Skeleton placeholder for the family tree view
 * Mimics the tree structure with indented member card placeholders
 */
const TreeSkeleton = React.memo(() => {
  // Simulate tree structure with varying indentation levels
  const skeletonCards = [
    { indent: 0, count: 3 }, // Level 0: Top-level members
    { indent: 1, count: 4 }, // Level 1: Children
    { indent: 2, count: 3 }, // Level 2: Grandchildren
    { indent: 3, count: 2 }, // Level 3: Great-grandchildren
    { indent: 4, count: 2 }, // Level 4: Great-great-grandchildren
    { indent: 5, count: 1 }, // Level 5: Deepest level
  ];

  let cardIndex = 0;

  return (
    <div className="tree-skeleton" aria-label="Loading family tree" role="status">
      {skeletonCards.map((level, levelIdx) =>
        Array.from({ length: level.count }).map(() => {
          const currentIndex = cardIndex++;
          const indentClass = `tree-skeleton-indent${level.indent > 0 ? `-${Math.min(level.indent, 5)}` : ""}`;

          return (
            <div
              key={`${levelIdx}-${currentIndex}`}
              className={`tree-skeleton-card ${indentClass}`}
              style={{
                animationDelay: `${currentIndex * 0.08}s`,
                opacity: Math.max(0.3, 1 - level.indent * 0.12),
              }}
            >
              <SkeletonAvatar size="sm" />
              <SkeletonRect width={10} height={10} borderRadius="50%" />
              <SkeletonText size="md" width={`${Math.max(40, 80 - level.indent * 8)}%`} />
              <SkeletonRect width={10} height={10} borderRadius="50%" />
              <SkeletonRect width={23} height={23} borderRadius="50%" />
            </div>
          );
        }),
      )}
    </div>
  );
});

export default TreeSkeleton;
