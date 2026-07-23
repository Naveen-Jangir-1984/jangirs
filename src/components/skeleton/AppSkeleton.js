import React from "react";
import { SkeletonRect, SkeletonText, SkeletonAvatar } from "./Skeleton";
import "./Skeleton.css";

/**
 * AppSkeleton - Full-page skeleton shown during initial app data fetch
 * Replaces the "Please wait..." text fallback
 */
const AppSkeleton = React.memo(() => {
  return (
    <div className="app-skeleton" aria-label="Loading application" role="status">
      <div className="app-skeleton-header">
        <SkeletonRect width={85} height={27} />
        <SkeletonRect width={50} height={27} />
        <SkeletonRect width={50} height={27} />
        <SkeletonAvatar size="sm" />
        <SkeletonAvatar size="sm" />
        <SkeletonRect width={50} height={27} />
      </div>
      <div className="app-skeleton-body">
        <SkeletonText size="lg" width="60%" />
        <SkeletonText size="md" width="80%" />
        <SkeletonText size="sm" width="40%" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "90%", maxWidth: "400px" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "2px 0",
              animationDelay: `${i * 0.1}s`,
            }}
          >
            <SkeletonAvatar size="sm" />
            <SkeletonText size="md" width={`${70 - i * 3}%`} />
            <SkeletonAvatar size="sm" />
            <SkeletonRect width={23} height={23} borderRadius="50%" />
          </div>
        ))}
      </div>
      <div style={{ marginTop: "10px" }}>
        <SkeletonText size="sm" width="30%" />
      </div>
    </div>
  );
});

export default AppSkeleton;
