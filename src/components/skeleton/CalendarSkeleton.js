import React from "react";
import { SkeletonText, SkeletonRect } from "./Skeleton";
import "./Skeleton.css";

/**
 * CalendarSkeleton - Skeleton placeholder for the events calendar view
 * Mimics a calendar grid with loading placeholders
 */
const CalendarSkeleton = React.memo(() => {
  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  // Generate 35 cells to fill a ~5 week grid
  const days = Array.from({ length: 35 }, (_, i) => i);

  return (
    <div className="calendar-skeleton" aria-label="Loading calendar" role="status">
      {/* Calendar header with navigation */}
      <div className="calendar-skeleton-header">
        <SkeletonRect width={30} height={27} borderRadius="5px" />
        <SkeletonText size="lg" width="180px" />
        <SkeletonRect width={30} height={27} borderRadius="5px" />
      </div>

      {/* Day headers row */}
      <div className="calendar-skeleton-grid">
        {dayHeaders.map((_, i) => (
          <div key={`header-${i}`} className="calendar-skeleton-day-header skeleton" style={{ height: "18px" }} />
        ))}
      </div>

      {/* Calendar days grid */}
      <div className="calendar-skeleton-grid">
        {days.map((day) => (
          <div
            key={day}
            className="calendar-skeleton-day skeleton"
            style={{
              animationDelay: `${day * 0.03}s`,
              opacity: Math.max(0.2, 1 - (day % 7) * 0.1),
            }}
          />
        ))}
      </div>

      {/* Event list placeholders */}
      <div style={{ width: "100%", maxWidth: "500px", display: "flex", flexDirection: "column", gap: "6px", marginTop: "10px" }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`event-${i}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 0",
              animationDelay: `${i * 0.1}s`,
            }}
          >
            <SkeletonRect width={4} height={30} borderRadius="2px" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
              <SkeletonText size="md" width="60%" />
              <SkeletonText size="sm" width="40%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default CalendarSkeleton;
