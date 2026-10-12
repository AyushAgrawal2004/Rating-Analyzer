import React from "react";
import { ChevronDown } from "lucide-react";

export const ClaySelect = React.forwardRef(function ClaySelect(
  {
    children,
    label,
    options = [],
    value,
    onChange,
    className = "",
    id,
    disabled = false,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-heading font-bold text-ink-700 dark:text-ink-300 ml-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`clay-sm w-full appearance-none bg-surface-card dark:bg-surface-darkCard rounded-pill text-ink-800 dark:text-ink-100 font-sans text-xs sm:text-sm py-2.5 pl-4 pr-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed clay-focus transition-all ${className}`}
          {...props}
        >
          {children
            ? children
            : options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-surface-card dark:bg-surface-darkCard text-ink-900 dark:text-ink-100 py-1"
                >
                  {opt.label}
                </option>
              ))}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-400">
          <ChevronDown className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
});

export default ClaySelect;
