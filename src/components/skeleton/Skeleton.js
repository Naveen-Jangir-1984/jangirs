import React from "react";
import "./Skeleton.css";

/**
 * SkeletonText - A text line placeholder
 * @param {Object} props
 * @param {string} props.size - 'sm', 'md', 'lg' (default 'md')
 * @param {string} props.width - Custom width override (e.g., '80%', '150px')
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 */
const SkeletonText = React.memo(({ size = "md", width, className = "", style = {} }) => {
  const sizeClass = `skeleton-text-${size}`;
  return <div className={`skeleton skeleton-text ${sizeClass} ${className}`} style={{ width: width || undefined, ...style }} aria-hidden="true" />;
});

/**
 * SkeletonAvatar - A circular placeholder for profile images
 * @param {Object} props
 * @param {string} props.size - 'sm', 'md', 'lg' (default 'sm')
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 */
const SkeletonAvatar = React.memo(({ size = "sm", className = "", style = {} }) => {
  const sizeClass = `skeleton-avatar-${size}`;
  return <div className={`skeleton skeleton-avatar ${sizeClass} ${className}`} style={style} aria-hidden="true" />;
});

/**
 * SkeletonRect - A rectangular placeholder
 * @param {Object} props
 * @param {number|string} props.width - Width (e.g., 100, '100px', '50%')
 * @param {number|string} props.height - Height (e.g., 27, '27px')
 * @param {string} props.borderRadius - Border radius override
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 */
const SkeletonRect = React.memo(({ width, height, borderRadius, className = "", style = {} }) => {
  const resolvedWidth = typeof width === "number" ? `${width}px` : width;
  const resolvedHeight = typeof height === "number" ? `${height}px` : height;
  return (
    <div
      className={`skeleton skeleton-rect ${className}`}
      style={{
        width: resolvedWidth,
        height: resolvedHeight,
        borderRadius: borderRadius || "5px",
        ...style,
      }}
      aria-hidden="true"
    />
  );
});

/**
 * SkeletonCard - A full card placeholder with avatar + text lines
 * @param {Object} props
 * @param {string} props.avatarSize - Avatar size ('sm', 'md')
 * @param {number} props.textLines - Number of text lines (default 2)
 * @param {string} props.width - Card width
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 * @param {string} props.direction - 'row' or 'column'
 */
const SkeletonCard = React.memo(({ avatarSize = "sm", textLines = 2, width, className = "", style = {}, direction = "row" }) => {
  return (
    <div
      className={`skeleton-card ${className}`}
      style={{
        display: "flex",
        flexDirection: direction,
        alignItems: direction === "row" ? "center" : "flex-start",
        gap: direction === "row" ? "8px" : "6px",
        padding: "4px 0",
        width: width || "100%",
        ...style,
      }}
      aria-hidden="true"
    >
      <SkeletonAvatar size={avatarSize} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
        {Array.from({ length: textLines }).map((_, i) => (
          <SkeletonText key={i} size={i === 0 ? "md" : "sm"} width={i === 0 ? "80%" : "50%"} />
        ))}
      </div>
    </div>
  );
});

export { SkeletonText, SkeletonAvatar, SkeletonRect, SkeletonCard };
