import React from "react";
import { SkeletonRect, SkeletonText } from "./Skeleton";
import "./Skeleton.css";

/**
 * MosaicSkeleton - Skeleton placeholder for the Generation Mosaic view
 * Mimics generation rows with photo tiles and text labels
 */
const MosaicSkeleton = React.memo(() => {
  // Generate 4 generation rows with varying tile counts
  const generations = [
    { label: "Generation 1", tiles: 3 },
    { label: "Generation 2", tiles: 5 },
    { label: "Generation 3", tiles: 8 },
    { label: "Generation 4", tiles: 6 },
  ];

  return (
    <div className="mosaic-skeleton" aria-label="Loading generation mosaic" role="status">
      {generations.map((gen, gi) => (
        <div key={gi} className="mosaic-skeleton-gen" style={{ animationDelay: `${gi * 0.1}s` }}>
          <SkeletonText size="lg" width="180px" style={{ marginBottom: "6px" }} />
          <div className="mosaic-skeleton-row">
            {Array.from({ length: gen.tiles }).map((_, ti) => (
              <div key={ti} className="mosaic-skeleton-tile" style={{ animationDelay: `${gi * 0.1 + ti * 0.05}s` }}>
                <SkeletonRect width={56} height={56} borderRadius="50%" />
                <SkeletonText size="sm" width="50px" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

export default MosaicSkeleton;
