import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SelectOption = { label: string; value: string };

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  options: SelectOption[];
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ id, label, error, options, className, ...props }, ref) => (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-enterprise-charcoal"
      >
        {label}
      </label>
      <select
        id={id}
        ref={ref}
        className={cn(
          "w-full rounded-sharp border border-enterprise-border bg-white px-4 py-3.5 text-base text-enterprise-charcoal transition focus:border-enterprise-blue focus:outline-none focus:ring-2 focus:ring-enterprise-blue/20",
          error && "border-red-500 focus:border-red-500 focus:ring-red-200",
          className
        )}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
);

Select.displayName = "Select";
