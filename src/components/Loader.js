import React from "react";
import "./Loader.css";

/**
 * Loader - A reusable component for handling loading and error states across the app
 *
 * Props:
 * @param {boolean} loading - Whether content is being loaded
 * @param {string|null} error - Error message to display (null if no error)
 * @param {ReactNode} children - Content to render when not loading and no error
 * @param {Function} onRetry - Callback function for retry button
 * @param {string} loadingMessage - Custom loading message (default: "Loading...")
 * @param {ReactNode} skeleton - Custom skeleton component to show while loading (default: default skeleton)
 * @param {boolean} useSkeleton - Whether to show skeleton while loading (default: true)
 */
const Loader = React.memo(({ loading = false, error = null, children = null, onRetry = null, loadingMessage = "Loading...", skeleton = null, useSkeleton = true }) => {
  // Loading state with skeleton
  if (loading && useSkeleton) {
    return (
      <div className="loader-container" aria-label="Loading content" role="status">
        <div className="loader-skeleton">
          {skeleton || (
            <div className="loader-default-skeleton">
              <div className="loader-shimmer-row">
                <div className="skeleton skeleton-text skeleton-text-lg" style={{ width: "60%" }} />
              </div>
              <div className="loader-shimmer-row">
                <div className="skeleton skeleton-text skeleton-text-md" style={{ width: "80%" }} />
              </div>
              <div className="loader-shimmer-row">
                <div className="skeleton skeleton-text skeleton-text-sm" style={{ width: "40%" }} />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="loader-shimmer-row loader-shimmer-card" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="skeleton skeleton-avatar skeleton-avatar-sm" />
                  <div className="skeleton skeleton-text skeleton-text-md" style={{ width: `${70 - i * 5}%` }} />
                  <div className="skeleton skeleton-avatar skeleton-avatar-sm" />
                  <div className="skeleton skeleton-rect" style={{ width: "23px", height: "23px", borderRadius: "50%" }} />
                </div>
              ))}
              <div className="loader-shimmer-row" style={{ marginTop: "10px" }}>
                <div className="skeleton skeleton-text skeleton-text-sm" style={{ width: "30%" }} />
              </div>
            </div>
          )}
        </div>
        {loadingMessage && <div className="loader-message">{loadingMessage}</div>}
      </div>
    );
  }

  // Loading state without skeleton (simple message)
  if (loading && !useSkeleton) {
    return (
      <div className="loader-container loader-simple" aria-label="Loading" role="status">
        <div className="loader-spinner" />
        <div className="loader-message">{loadingMessage}</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="loader-container loader-error" role="alert">
        <div className="loader-error-content">
          <div className="loader-error-icon">⚠</div>
          <div className="loader-error-message">{error}</div>
          {onRetry && (
            <button className="loader-retry-btn" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Normal state: render children
  return children;
});

export default Loader;
