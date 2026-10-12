import React from "react";
import ClayCard from "./ClayCard.jsx";

export function ClayTable({ children, className = "" }) {
  return (
    <ClayCard className={`overflow-hidden p-0 ${className}`}>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          {children}
        </table>
      </div>
    </ClayCard>
  );
}

export function ClayTableHead({ children, className = "" }) {
  return (
    <thead className={`bg-surface-cardSubtle/70 dark:bg-surface-darkCardSubtle/70 border-b border-ink-100 dark:border-ink-800/60 text-ink-500 dark:text-ink-400 font-heading font-extrabold uppercase tracking-wider text-[11px] ${className}`}>
      {children}
    </thead>
  );
}

export function ClayTableRow({ children, className = "", onClick }) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-ink-100/70 dark:border-ink-800/40 hover:bg-surface-cardSubtle/60 dark:hover:bg-surface-darkCardSubtle/40 transition-colors ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </tr>
  );
}

export default ClayTable;
