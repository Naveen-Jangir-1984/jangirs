import React from "react";
import { SkeletonRect, SkeletonText } from "./Skeleton";
import "./Skeleton.css";

/**
 * SignInSkeleton - Skeleton placeholder for the sign-in page
 * Shows loading placeholders for the user select dropdown, password input, and sign-in button
 */
const SignInSkeleton = React.memo(() => {
  return (
    <div className="signin-skeleton" aria-label="Loading sign-in form" role="status">
      <SkeletonRect width={150} height={27} borderRadius="5px" />
      <SkeletonRect width={150} height={27} borderRadius="5px" />
      <SkeletonRect width={80} height={27} borderRadius="5px" />
      <div style={{ marginTop: "8px" }}>
        <SkeletonText size="sm" width="120px" />
      </div>
    </div>
  );
});

export default SignInSkeleton;
