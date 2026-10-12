import React from "react";
import { X } from "lucide-react";

export const ClayInput = React.forwardRef(function ClayInput(
  {
    label,
    icon: Icon,
    rightElement,
    error,
    value,
    onChange,
    onClear,
    placeholder,
    className = "",
    id,
    disabled = false,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs sm:text-sm font-heading font-bold text-ink-700 dark:text-ink-300 ml-1"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-4 pointer-events-none text-ink-400 dark:text-ink-500">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`clay-inset w-full bg-surface-cardSubtle dark:bg-surface-darkCard rounded-pill text-ink-900 dark:text-ink-100 placeholder:text-ink-400 dark:placeholder:text-ink-500 font-sans text-xs sm:text-sm py-3 transition-all clay-focus ${
            Icon ? "pl-11" : "pl-5"
          } ${
            onClear && value ? "pr-16" : rightElement ? "pr-12" : "pr-5"
          } ${error ? "ring-2 ring-status-danger" : ""} ${className}`}
          {...props}
        />
        {onClear && value && !disabled && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-4 p-1 rounded-full text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors"
            aria-label="Clear input"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {rightElement && !onClear && (
          <div className="absolute right-3.5">{rightElement}</div>
        )}
      </div>
      {error && (
        <p className="text-xs font-semibold text-status-danger ml-2">{error}</p>
      )}
    </div>
  );
});

export default ClayInput;
