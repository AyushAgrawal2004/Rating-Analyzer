import React from "react";

export function ClaySkeleton({
  className = "",
  rounded = "rounded-clay-md",
  width,
  height,
}) {
  return (
    <div
      style={{ width, height }}
      className={`clay-sm bg-surface-cardSubtle dark:bg-surface-darkCardSubtle animate-pulse-subtle relative overflow-hidden ${rounded} ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent animate-shimmer-clay" />
    </div>
  );
}

export default ClaySkeleton;
